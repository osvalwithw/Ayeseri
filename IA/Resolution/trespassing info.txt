import json
from sentence_transformers import SentenceTransformer, util
import torch
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(script_dir, 'resolution_cook_book.json')

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        error_knowledge_base = json.load(f)
    print(f"Se cargaron {len(error_knowledge_base)} errores desde 'resolution_cook_book.json'.")
except FileNotFoundError:
    print("Error: El archivo 'resolution_cook_book.json' no fue encontrado. Asegúrate de que esté en la misma carpeta.")
    exit()

print("Procesando base de conocimiento...")
corpus_completo = []
mapeo_a_solucion = []
for sol_id, data in error_knowledge_base.items():
    for problema in data["consultas_de_usuario_ejemplos"]:
        corpus_completo.append(problema)
        mapeo_a_solucion.append(sol_id)

model = SentenceTransformer('all-MiniLM-L6-v2')
corpus_embeddings = model.encode(corpus_completo, convert_to_tensor=True)
print("Sistema listo.")

# --- 3. Simulación de una Consulta de Usuario ---
query = "el salario de un empleado no se puede poner en el sistema"
query_embedding = model.encode(query, convert_to_tensor=True)

# --- 4. Búsqueda de Similitud (VERSIÓN MEJORADA: TOP-K) ---
print(f"\nBuscando soluciones para: '{query}'")

# Definimos cuántos resultados queremos (k=3 significa el principal y dos secundarios)
k = 3

# Calculamos la similitud contra todas las variaciones
cos_scores = util.cos_sim(query_embedding, corpus_embeddings)[0]

# Usamos torch.topk para obtener los k mejores resultados
top_k_results = torch.topk(cos_scores, k=k)

# Guardia de calidad: Si ni siquiera el mejor resultado es bueno, no mostramos nada.
if top_k_results.values[0] < 0.4:
    print("\nNo se encontraron soluciones con un grado de confianza suficiente.")
else:
    print("\nSe encontraron las siguientes soluciones:")
    
    # Iteramos sobre los resultados encontrados
    for i, (score, idx) in enumerate(zip(top_k_results.values, top_k_results.indices)):
        
        # Obtenemos el ID de la solución usando nuestro mapa
        solucion_id = mapeo_a_solucion[idx.item()]
        
        # Obtenemos la información completa de esa solución
        solucion_data = error_knowledge_base[solucion_id]
        
        if i == 0:
            print("\n--- ✅ Solución Principal ---")
        else:
            print(f"\n--- ☑️ Solución Secundaria {i} ---")
            
        print(f"Título: {solucion_data['Tittle']} (ID: {solucion_id})")
        print(f"Similitud: {score.item():.4f}")
        # Opcional: Mostrar más detalles
        # print(f"Pasos: {solucion_data['resolution_steps']}")