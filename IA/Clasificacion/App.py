import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from Proccessing_data import Processing_new_errors, UploadingEE_Errors

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/ping')
def ping():
    return "pong", 200

@app.route('/ObtainErrorsFN', methods=['POST', 'OPTIONS'])
def obtain_errors():
    if request.method == 'OPTIONS':
        return ('', 204)
    ErrorsFromFN = request.get_json(silent=True)
    if ErrorsFromFN is None:
        raw = request.get_data(cache=False, as_text=True)  # string
        if not raw:
            return jsonify({"error": "Cuerpo vacío"}), 400
        try:
            ErrorsFromFN = json.loads(raw)
        except Exception as e:
            return jsonify({"error": "JSON inválido", "detail": str(e)}), 400

    if isinstance(ErrorsFromFN, dict):
        ErrorsFromFN = [ErrorsFromFN]
    if not isinstance(ErrorsFromFN, list):
        return jsonify({"error": f"Se esperaba dict o list, llegó {type(ErrorsFromFN).__name__}"}), 400
    for i, item in enumerate(ErrorsFromFN):
        if not isinstance(item, dict):
            return jsonify({"error": f"Elemento {i} no es objeto JSON", "got": type(item)._name_}), 400
    ErrHD = Processing_new_errors(ErrorsFromFN)
    UploadingEE_Errors(ErrorsFromFN, ErrHD)
    return jsonify({"message": "Datos recibidos correctamente"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
