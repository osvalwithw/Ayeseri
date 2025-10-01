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

# if __name__ == "__main__":
#     try:
#         metrics = reentrenar_modelo()
#         print("\n=== Métricas de evaluación ===")
#         print(f"Accuracy: {metrics['accuracy']:.4f}")
#         print(f"F1-macro: {metrics['f1_macro']:.4f}")
#         print(f"F1-weighted: {metrics['f1_weighted']:.4f}")
#         print("\nClassification Report:\n", metrics["classification_report"])
#         print("Confusion Matrix:", metrics["confusion_matrix"])
#     except Exception as e:
#         print("No se pudo reentrenar:", e)

#     try:
#         ejemplo = "Formatting error in the field P0001-ANSVH"
#         print("\nPredicción de ejemplo ->", predecir_infotipo(ejemplo))
#     except Exception as e:
#         print("No se pudo predecir:", e)