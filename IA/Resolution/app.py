import json
from sentence_transformers import SentenceTransformer, util
import torch
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(script_dir, 'resolution_cook_book.json')

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        file_load = json.load(f)
    print(f"Se cargaron {len(file_load)} errores desde 'resolution_cook_book.json'.")
    error_knowledge_base = {}
    for error in file_load:
        index = error["Tittle"]
        error_knowledge_base[index] = error
except FileNotFoundError:
    print("Error: El archivo 'resolution_cook_book.json' no fue encontrado. Asegúrate de que esté en la misma carpeta.")
    exit()

corpus_completo = []
mapeo_a_solucion = []
for error_obj, info in error_knowledge_base.items():
    # sol_id = error_obj["Tittle"]
    for issue in info["Posible_consults"]:
        corpus_completo.append(issue)
        mapeo_a_solucion.append(error_obj)

model = SentenceTransformer('all-MiniLM-L6-v2')
corpus_embeddings = model.encode(corpus_completo, convert_to_tensor=True)

query = "El empleado que estoy buscando no esta"

query_embedding = model.encode(query, convert_to_tensor=True)

print(f"\nBuscando soluciones para: '{query}'")

k = 3

cos_scores = util.cos_sim(query_embedding, corpus_embeddings)[0]

top_k_results = torch.topk(cos_scores, k=k)

if top_k_results.values[0] < 0.4:
    print("\nNo se encontraron soluciones con un grado de confianza suficiente.")
else:
    print("\nSe encontraron las siguientes soluciones:")
    
    for i, (score, idx) in enumerate(zip(top_k_results.values, top_k_results.indices)):
        solucion_id = mapeo_a_solucion[idx.item()]
        solucion_data = error_knowledge_base[solucion_id]
        
        if i == 0:
            print("\n--- ✅ Solución Principal ---")
        else:
            print(f"\n--- ☑️ Solución Secundaria {i} ---")
            
        print(f"Título: {solucion_data['Tittle']} (ID: {solucion_id})")
        print(f"Similitud: {score.item():.4f}")