from Classify_Method import reentrenar_modelo, predecir_infotipo, debugging_tokens, tocs_predictions
 
m = reentrenar_modelo()
print("== métricas ==")
for k, v in m.items():
    if k != "classification_report":
        print(k, ":", v)
print(m.get("classification_report", ""))
 
ejemplo = "Postal code GHI must have length 5"
pred = predecir_infotipo(ejemplo)    
print("Predicción ejemplo:", pred)
debugging_tokens(ejemplo)
print(tocs_predictions(ejemplo, k=5))