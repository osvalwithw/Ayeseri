# run_classifier_debug.py (script aparte para que no mezcle imports)
from Classify_Method import reentrenar_modelo, predecir_infotipo, debugging_tokens, tocs_predictions
 
# 1) Entrena (si tu .pkl no existe, esto lo crea; si existe, lo puedes forzar corriendo esto una vez)
m = reentrenar_modelo()
print("== métricas ==")
for k, v in m.items():
    if k != "classification_report":
        print(k, ":", v)
print(m.get("classification_report", ""))
 
# 2) Predice tu línea de ejemplo
ejemplo = "Postal code GHI must have length 5"
pred = predecir_infotipo(ejemplo)    # debería devolver "0001" (string 4 dígitos)
print("Predicción ejemplo:", pred)
debugging_tokens(ejemplo)
print(tocs_predictions(ejemplo, k=5))