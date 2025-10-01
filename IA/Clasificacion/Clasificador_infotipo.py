# -*- coding: utf-8 -*-
"""
classifier.py
- Entrena/carga un Pipeline (TF-IDF + ComplementNB) para clasificar ID_infotype
- Exponer: reentrenar_modelo(), cargar_modelo(), predecir_infotipo()
- Lee datos desde tu API (GetErros_FromAPI) con campos variables.
"""

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
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix

# ---- Conector de datos (ajusta al tuyo) ----
from API_connection import GetErros_FromAPI  # Debe devolver lista[dict]

PIPELINE_PATH = "modelo_infotipo_pipeline.pkl"

# ---- Stopwords bilingües y stemmer ----
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

def _analyzer(doc: str):
    doc = _normalize(doc)
    toks = []
    for t in doc.split():
        if t and t not in STOP_WORDS:
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
            or item.get("ID_infotype")
            or item.get("Infotype_IND")
            or item.get("Infotype")
            or item.get("IT_affected"))

def _load_training_data() -> Tuple[List[str], List[Any]]:
    data = GetErros_FromAPI()
    if not data:
        raise ValueError("GetErros_FromAPI() devolvió vacío.")
    X, y = [], []
    for it in data:
        msg = _extract_error_message(it)
        lbl = _extract_label(it)
        if msg and lbl is not None:
            X.append(msg)
            y.append(lbl)
    if len(X) < 2:
        raise ValueError("Datos insuficientes para entrenar (≥2 ejemplos).")
    if len(set(y)) < 2:
        raise ValueError("Se requiere ≥2 clases para entrenar.")
    return X, y

def _build_pipeline() -> Pipeline:
    vect = TfidfVectorizer(
        analyzer=_analyzer,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.90,
    )
    clf = ComplementNB()
    return Pipeline([("vect", vect), ("clf", clf)])

def reentrenar_modelo(test_size: float = 0.2, random_state: int = 42) -> dict:
    X, y = _load_training_data()
    Xtr, Xte, ytr, yte = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    pipe = _build_pipeline()
    pipe.fit(Xtr, ytr)

    ypred = pipe.predict(Xte)
    metrics = {
        "accuracy": float(accuracy_score(yte, ypred)),
        "f1_macro": float(f1_score(yte, ypred, average="macro", zero_division=0)),
        "f1_weighted": float(f1_score(yte, ypred, average="weighted", zero_division=0)),
        "classification_report": classification_report(yte, ypred, zero_division=0),
        "confusion_matrix": confusion_matrix(yte, ypred).tolist(),
        "n_samples_train": len(Xtr),
        "n_samples_test": len(Xte),
        "n_classes": len(set(y)),
    }

    joblib.dump(pipe, PIPELINE_PATH)
    return metrics

def cargar_modelo() -> Pipeline:
    if not os.path.exists(PIPELINE_PATH):
        reentrenar_modelo()
    return joblib.load(PIPELINE_PATH)

def predecir_infotipo(mensaje_error: str):
    if not mensaje_error:
        raise ValueError("mensaje_error vacío.")
    pipe = cargar_modelo()
    return pipe.predict([mensaje_error])[0]

# if __name__ == "__main__":
#     try:
#         m = reentrenar_modelo()
#         print("== Métricas ==\n", m["classification_report"])
#         print("Accuracy:", m["accuracy"])
#         print("F1-macro:", m["f1_macro"])
#         print("F1-weighted:", m["f1_weighted"])
#         print("Confusion matrix:", m["confusion_matrix"])
#     except Exception as e:
#         print("⚠️ No se pudo reentrenar:", e)

#     try:
#         ejemplo = "Formatting error in the field P0001-ANSVH"
#         print("Predicción ejemplo:", predecir_infotipo(ejemplo))
#     except Exception as e:
#         print("⚠️ Predicción falló:", e)