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

print("Cargando el modelo de Sentence Transformer...")
model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
print("Modelo cargado.")

corpus_texts = []
solutions = []

print("\nProcesando y creando embeddings para la base de conocimiento...")
for error in error_knowledge_base:
    combined_text = f"Título: {error['Tittle']}. " \
                    f"Preguntas: {' '.join(error['questions'])}. " \
                    f"Precondiciones: {' '.join(error['Preconditions'])}."
    
    corpus_texts.append(combined_text)
    solutions.append({
        "steps": error['resolution_steps'],
        "fallbacks": error['Fallbacks']
    })

corpus_embeddings = model.encode(corpus_texts, convert_to_tensor=True)
print(f"Se han creado {len(corpus_embeddings)} embeddings.")

print("\n--- Simulación de Búsqueda ---")
user_query = "El empleado no tiene cargado el turno en SAP"
print(f"Consulta del usuario: '{user_query}'")

query_embedding = model.encode(user_query, convert_to_tensor=True)

cosine_scores = util.cos_sim(query_embedding, corpus_embeddings)

top_result = torch.argmax(cosine_scores)
score = cosine_scores[0][top_result]
best_match_index = top_result.item()

print(error_knowledge_base[best_match_index]['Tittle'])
print(f"\nMejor coincidencia encontrada (Índice: {best_match_index}) con una similitud de: {score:.4f}")

most_relevant_solution = solutions[best_match_index]

print("\n✅ ¡Solución recomendada encontrada!")
print("------------------------------------")
print("Pasos a seguir:")
for i, step in enumerate(most_relevant_solution['steps'], 1):
    print(f"  {i}. {step}")

print("\nSi el problema persiste:")
for i, fallback in enumerate(most_relevant_solution['fallbacks'], 1):
    print(f"  - {fallback}")
print("------------------------------------")