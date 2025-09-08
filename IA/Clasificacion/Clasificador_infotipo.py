# clasificador_infotipo.py
import pandas as pd
import nltk
import string
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib
import os

# Verifica si el modelo ya está entrenado
modelo_path = "modelo_infotipo.pkl"
vector_path = "vectorizador.pkl"

if not os.path.exists(modelo_path):
    nltk.download("stopwords")
    df = pd.read_csv("WD2SAP_COMMON_ERRORS_HR.csv", encoding="ISO-8859-1")
    
    stemmer = PorterStemmer()
    stop_words = set(stopwords.words("english"))

    def preprocess(text):
        text = text.lower()
        text = text.translate(str.maketrans("", "", string.punctuation))
        words = text.split()
        filtered_words = [stemmer.stem(word) for word in words if word not in stop_words]
        return " ".join(filtered_words)

    df["Clean_Error"] = df["Error_Message"].apply(preprocess)

    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(df["Clean_Error"])
    y = df["Infotipo"]

    model = MultinomialNB()
    model.fit(X, y)

    # Guardar modelo y vectorizador
    joblib.dump(model, modelo_path)
    joblib.dump(vectorizer, vector_path)

else:
    model = joblib.load(modelo_path)
    vectorizer = joblib.load(vector_path)
    stemmer = PorterStemmer()
    stop_words = set(stopwords.words("english"))

    def preprocess(text):
        text = text.lower()
        text = text.translate(str.maketrans("", "", string.punctuation))
        words = text.split()
        filtered_words = [stemmer.stem(word) for word in words if word not in stop_words]
        return " ".join(filtered_words)

# 👉 Esta es la función que puedes importar
def predecir_infotipo(mensaje_error):
    texto_procesado = preprocess(mensaje_error)
    vectorizado = vectorizer.transform([texto_procesado])
    prediccion = model.predict(vectorizado)
    return prediccion[0]
