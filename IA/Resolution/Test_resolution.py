import json
from sentence_transformers import SentenceTransformer, util
import torch
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(script_dir, 'resolution_cook_book.json')

# 1. TUS DATOS (He copiado y pegado el JSON que me enviaste)
# En una aplicación real, cargarías esto desde un archivo o una base de datos.
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        error_knowledge_base = json.load(f)
    print(f"Se cargaron {len(error_knowledge_base)} errores desde 'resolution_cook_book.json'.")
except FileNotFoundError:
    print("Error: El archivo 'resolution_cook_book.json' no fue encontrado. Asegúrate de que esté en la misma carpeta.")
    exit()

# 2. INICIALIZAR EL MODELO DE EMBEDDINGS
# 'all-MiniLM-L6-v2' es un modelo excelente, rápido y ligero.
# La primera vez que lo ejecutes, se descargará automáticamente.
print("Cargando el modelo de Sentence Transformer...")
model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
print("Modelo cargado.")

# 3. PROCESAR Y VECTORIZAR LA BASE DE CONOCIMIENTO
# Vamos a crear una lista para guardar los textos que representarán cada error
# y otra para guardar las soluciones correspondientes.
corpus_texts = []
solutions = []

print("\nProcesando y creando embeddings para la base de conocimiento...")
for error in error_knowledge_base:
    # Combinamos los campos de texto más relevantes en un solo "documento"
    # para obtener una representación semántica rica del problema.
    combined_text = f"Título: {error['Tittle']}. " \
                    f"Preguntas: {' '.join(error['questions'])}. " \
                    f"Precondiciones: {' '.join(error['Preconditions'])}."
    
    corpus_texts.append(combined_text)
    # Guardamos la solución asociada a este texto
    solutions.append({
        "steps": error['resolution_steps'],
        "fallbacks": error['Fallbacks']
    })

# Ahora convertimos toda la lista de textos en vectores (embeddings)
# Esto es muy eficiente y se hace en un solo paso.
corpus_embeddings = model.encode(corpus_texts, convert_to_tensor=True)
print(f"Se han creado {len(corpus_embeddings)} embeddings.")

# En una aplicación real, guardarías estos 'corpus_embeddings' en una base de datos vectorial
# como ChromaDB o FAISS para no tener que recalcularlos cada vez.

# 4. SIMULAR UNA CONSULTA DEL USUARIO
print("\n--- Simulación de Búsqueda ---")
# El usuario describe su problema en lenguaje natural
user_query = "El empleado no tiene cargado el turno en SAP"
print(f"Consulta del usuario: '{user_query}'")

# Convertimos la consulta del usuario en un vector, usando EL MISMO MODELO.
query_embedding = model.encode(user_query, convert_to_tensor=True)

# 5. BUSCAR LA SOLUCIÓN MÁS SIMILAR
# Usamos la similitud de coseno para encontrar el vector del corpus más cercano al vector de la consulta.
# 'util.cos_sim' calcula la similitud entre todos los pares de vectores.
cosine_scores = util.cos_sim(query_embedding, corpus_embeddings)

# Obtenemos el índice y el puntaje del error más similar
top_result = torch.argmax(cosine_scores)
score = cosine_scores[0][top_result]
best_match_index = top_result.item()

print(error_knowledge_base[best_match_index]['Tittle'])
print(f"\nMejor coincidencia encontrada (Índice: {best_match_index}) con una similitud de: {score:.4f}")

# 6. MOSTRAR LA SOLUCIÓN RECOMENDADA
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