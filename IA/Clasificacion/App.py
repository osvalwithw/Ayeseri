import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from Errors_Mapping import process_errors_to_payload, build_lookup_by_message, _norm, _get_msg
from Classify_Method import predecir_infotipo
from API_requests import GetErros_FromAPI, UploadErrorList


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

    ErrorsFromDB = GetErros_FromAPI()
    onlynew = []
    not_processed = []
    existing_error_messages = {error['Error_Message'] for error in ErrorsFromDB}

    for error in ErrorsFromFN:
        if error['Error Message'] not in existing_error_messages:
            onlynew.append(error)
        else:
            not_processed.append(error['Error Message'])

    for new_error in onlynew:
        code = predecir_infotipo(new_error)
        new_error['ID_Infotype'] = code

    # print("TO process", onlynew)
    print("Ignored due to existence: ", not_processed)
    if onlynew:
        UploadErrorList(onlynew)
    else:
        print("No new errors to upload.")
    # def create_error_idx(msg: str) -> int:
    #     id_it = predecir_infotipo(msg)
    #     Onlynew = [err for err in to]
    #     UploadList([{"Error_Message": msg, 'ID_Infotype': id_it}])
    #     Errors_DB = GetErros_FromAPI() or []
    #     lookup = build_lookup_by_message(Errors_DB)
    #     idx = lookup.get(_norm(msg))
    #     return (idx, id_it)
    
    # payloads, stats = process_errors_to_payload(
    #     ErrorsFromFN,
    #     ErrorsFromDB,
    #     create_error_idx,
    #     predict_infotype=predecir_infotipo,
    #     keep_title=True
    # )
    # print("Stats:", stats)
    # print("Payloads:", payloads)
    return jsonify({"message": "Datos recibidos correctamente"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
