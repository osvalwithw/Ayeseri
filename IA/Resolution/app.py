import json
from sentence_transformers import SentenceTransformer, util
import torch
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

print("Cargando modelo de IA y base de conocimiento...")

try:
    script_dir = os.path.dirname(__file__)
    json_path = os.path.join(script_dir, 'resolution_cook_book.json')
    
    with open(json_path, 'r', encoding='utf-8') as f:
        file_load = json.load(f)

    error_knowledge_base = {error["Tittle"]: error for error in file_load}
    
    corpus_completo = []
    mapeo_a_solucion = []
    for tittle, info in error_knowledge_base.items():
        for issue in info.get("Posible_consults", []):
            corpus_completo.append(issue)
            mapeo_a_solucion.append(tittle)

    model = SentenceTransformer('all-MiniLM-L6-v2')
    corpus_embeddings = model.encode(corpus_completo, convert_to_tensor=True)
    
    print("✅ Modelo de IA y base de conocimiento listos.")

except Exception as e:
    print(f"FATAL: No se pudo cargar la IA. Revisa tu archivo JSON. Error: {e}")
    exit()

def find_solution(query):
    """
    Toma la pregunta del usuario, la convierte en un vector
    y busca la solución más similar en la base de conocimiento.
    """
    query_embedding = model.encode(query, convert_to_tensor=True)    
    cos_scores = util.cos_sim(query_embedding, corpus_embeddings)[0]
    top_result = torch.topk(cos_scores, k=1)
    if top_result.values[0] < 0.4:
        return None
    best_match_idx = top_result.indices[0].item()
    solution_tittle = mapeo_a_solucion[best_match_idx]    
    return error_knowledge_base[solution_tittle]

@app.route('/ThinkingMethod', methods=['POST'])
def ask_ai_endpoint():
    user_query = request.json.get('query')
    
    if not user_query:
        return jsonify({"error": "No se proporcionó ninguna consulta (query)"}), 400
    
    solucion = find_solution(user_query)
    
    if solucion:
        response = {
            "answer": solucion.get("Tittle", "Título no encontrado"),
            "details": solucion.get("resolution_steps", "Pasos no disponibles.")
        }
    else:
        response = {
            "answer": "Lo siento, no pude encontrar una solución relevante. ¿Puedes intentar describirlo de otra manera?",
            "details": ""
        }
        
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5001)