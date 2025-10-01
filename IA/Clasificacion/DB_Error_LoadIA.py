# from Clasificador_infotipo import predecir_infotipo
from typing import List, Dict, Any, Callable, Tuple, Union
import os
import re
import unicodedata
import joblib
import nltk
from typing import List, Dict, Any, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import ComplementNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, f1_score, classification_report, confusion_matrix
)

# from API_connection import GetErros_FromAPI

PIPELINE_PATH = "modelo_infotipo_pipeline.pkl"

from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

# if __name__ == "__main__":
#     DB_data = GetErros_FromAPI()
#     if DB_data:
#         print("Informacion recibida")
#         # print(type(DB_data))
#         # print(json.dumps(DB_data, indent=1))
#     # for item in DB_data:
#     #     print(item['Error_Message'])

# def Processing_NewErrors(ErrorsFromFN, ErrorsFromDB):
#     to_insert = []
#     insertados = 0
#     for Item in ErrorsFromFN:
#         mensaje = Item['Error_Message']
            
#         if mensaje in ErrorsFromDB:
#             continue  # ya existe
#         id_infotipo = predecir_infotipo(mensaje)
#         insertados += 1
#         to_insert.append({"Error_Message": mensaje, "ID_infotype": int(id_infotipo)})
#     return to_insert, insertados

PIPELINE_PATH = "modelo_infotipo_pipeline.pkl"

from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

def _ensure_stopwords() -> set:
    try:
        stopwords.words("english")
    except LookupError:
        nltk.download("stopwords")
    sw_en = set(stopwords.words("english"))
    try:
        sw_es = set(stopwords.words("spanish"))
    except LookupError:
        nltk.download("stopwords")
        sw_es = set(stopwords.words("spanish"))
    return sw_en.union(sw_es)

STOP_WORDS = _ensure_stopwords()
STEMMER = PorterStemmer()

_punct_regex = re.compile(r"[^\w\s]")

def _normalize(text: str) -> str:
    if not isinstance(text, str):
        text = "" if text is None else str(text)
    text = text.lower()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = _punct_regex.sub(" ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def _analyzer(doc: str) -> List[str]:
    doc = _normalize(doc)
    tokens = doc.split()
    toks = []
    for t in tokens:
        if not t or t in STOP_WORDS:
            continue
        toks.append(STEMMER.stem(t))
    return toks

def _extract_error_message(item: Dict[str, Any]) -> str:
    return (item.get("Error Message")
            or item.get("Error_Message")
            or item.get("Error_message")
            or item.get("Error")
            or "")

def _extract_label(item: Dict[str, Any]):
    return (item.get("ID_Infotype")
            or item.get("Infotype_IND")
            or item.get("Infotype")
            or item.get("IT_affected"))

def _load_training_data() -> Tuple[List[str], List[Any]]:
    data = GetErros_FromAPI()
    if not data:
        raise ValueError("GetErros_FromAPI() devolvió vacío. No hay datos para entrenar.")

    X_text, y = [], []
    for it in data:
        msg = _extract_error_message(it)
        lbl = _extract_label(it)
        if not msg or lbl is None:
            continue
        X_text.append(msg)
        y.append(lbl)

    if len(X_text) < 2:
        raise ValueError("Datos insuficientes para entrenar (se requieren al menos 2 ejemplos).")
    if len(set(y)) < 2:
        raise ValueError("Solo hay una clase en las etiquetas; se requieren al menos 2 clases.")

    return X_text, y

def _build_pipeline() -> Pipeline:
    vect = TfidfVectorizer(
        analyzer=_analyzer,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.90,
    )
    clf = ComplementNB()
    pipe = Pipeline([
        ("vect", vect),
        ("clf", clf),
    ])
    return pipe

def reentrenar_modelo(test_size: float = 0.2, random_state: int = 42) -> dict:
    X, y = _load_training_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    pipe = _build_pipeline()
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1_macro = f1_score(y_test, y_pred, average="macro", zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cls_report = classification_report(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    joblib.dump(pipe, PIPELINE_PATH)

    return {
        "accuracy": acc,
        "f1_macro": f1_macro,
        "f1_weighted": f1_weighted,
        "classification_report": cls_report,
        "confusion_matrix": cm.tolist(),
        "test_size": test_size,
        "n_samples_train": len(X_train),
        "n_samples_test": len(X_test),
        "n_classes": len(set(y))
    }

def cargar_modelo() -> Pipeline:
    if not os.path.exists(PIPELINE_PATH):
        reentrenar_modelo()
    return joblib.load(PIPELINE_PATH)

def predecir_infotipo(mensaje_error: str):
    if not mensaje_error:
        raise ValueError("mensaje_error está vacío o None.")
    pipe = cargar_modelo()
    return pipe.predict([mensaje_error])[0]


# ---------- Helpers de normalización ----------
# def _normalize(s: str) -> str:
#     return (s or "").strip().lower()

# def _get_msg(item: Dict[str, Any]) -> str:
#     return (item.get("Error Message")
#             or item.get("Error_Message")
#             or item.get("Error_message")
#             or item.get("Error")
#             or "")

# def _build_messages_set(ErrorsFromDB: Union[List[Dict[str, Any]], List[str], set]) -> set:
#     """
#     Acepta:
#       - lista de dicts con campo de mensaje (Error_Message / Error Message / Error)
#       - lista de strings
#       - set de strings
#     Devuelve un set de mensajes normalizados.
#     """
#     if isinstance(ErrorsFromDB, set):
#         return {_normalize(x) for x in ErrorsFromDB}
#     if not ErrorsFromDB:
#         return set()
#     first = ErrorsFromDB[0]
#     if isinstance(first, dict):
#         msgs = []
#         for row in ErrorsFromDB:
#             msg = (row.get("Error_Message") or row.get("Error Message")
#                    or row.get("Error_message") or row.get("Error") or "")
#             if msg:
#                 msgs.append(_normalize(msg))
#         return set(msgs)
#     else:
#         # lista de strings
#         return {_normalize(x) for x in ErrorsFromDB}

# def build_db_lookup_by_message(ErrorsCatalog: List[Dict[str, Any]]) -> Dict[str, int]:
#     """
#     Construye mapping mensaje_normalizado -> IDX usando el catálogo 'errors'.
#     Espera campos: IDX y alguno de Error_Message / Error Message / Error.
#     """
#     lookup = {}
#     for row in ErrorsCatalog:
#         idx = row.get("IDX") or row.get("Id") or row.get("ID") or row.get("id")
#         msg = (row.get("Error_Message") or row.get("Error Message")
#                or row.get("Error_message") or row.get("Error") or "")
#         if idx is not None and msg:
#             lookup[_normalize(msg)] = int(idx)
#     return lookup

# # ---------- 1) SOLO detectar nuevos y (opcional) predecir ----------
# def collect_new_errors(
#     ErrorsFromFN: List[Dict[str, Any]],
#     ErrorsFromDB: Union[List[Dict[str, Any]], List[str], set],
#     predecir_infotipo: Callable[[str], Any] = None
# ) -> List[Dict[str, Any]]:
#     existing = _build_messages_set(ErrorsFromDB)
#     seen_batch = set()
#     nuevos = []

#     for item in ErrorsFromFN:
#         mensaje = _get_msg(item)
#         key = _normalize(mensaje)
#         if not key:
#             continue
#         if key in existing or key in seen_batch:
#             continue
#         seen_batch.add(key)

#         payload = {"Error_Message": mensaje}
#         if predecir_infotipo is not None:
#             try:
#                 payload["ID_infotype"] = int(predecir_infotipo(mensaje)) #PPredciccion
#             except Exception:
#                 payload["ID_infotype"] = None
#         nuevos.append(payload)
#     return nuevos

# def map_titles_to_idx(
#     new_errors: List[Dict[str, Any]],
#     ErrorsCatalog: List[Dict[str, Any]],
#     get_or_create_error_idx: Callable[[str], int] = None,
#     allow_create_missing: bool = True,
#     remove_title: bool = True
# ) -> Tuple[List[Dict[str, Any]], int]:
#     """
#     Toma la lista de 'new_errors' (con 'Error_Message') y devuelve otra lista donde
#     ese campo se reemplaza por 'ID_Error' (IDX de la tabla 'errors').

#     Returns:
#       (final_list, nuevos_en_catalogo)
#     """
#     lookup = build_db_lookup_by_message(ErrorsCatalog)
#     final_list = []
#     nuevos_en_catalogo = 0

#     for item in new_errors:
#         msg = item.get("Error_Message") or item.get("Error") or ""
#         key = _normalize(msg)
#         if not key:
#             continue

#         idx = lookup.get(key)
#         if idx is None:
#             if allow_create_missing and get_or_create_error_idx is not None:
#                 idx = int(get_or_create_error_idx(msg))
#                 lookup[key] = idx
#                 nuevos_en_catalogo += 1
#             else:
#                 # Si no permites crear, lo saltamos
#                 continue

#         # armamos el registro final
#         new_item = {**item}
#         new_item["ID_Error"] = int(idx)
#         if remove_title:
#             new_item.pop("Error_Message", None)  # ya no guardes el texto en la tabla relacional
#         final_list.append(new_item)

#     return final_list, nuevos_en_catalogo

