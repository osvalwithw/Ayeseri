import requests
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
# from DB_Error_LoadIA import Processing_NewErrors

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/ping')
def ping():
    return "pong", 200

@app.route('/ObtainErrors', methods=['POST', 'OPTIONS'])
def obtain_errors():
    if request.method == 'OPTIONS':
        return ('', 204)
    ErrorsFromFN = request.get_json(silent=True)
    if ErrorsFromFN is None:
        raw = request.get_ErrorsFromFN(cache=False, as_text=True)  # string
        if not raw:
            return jsonify({"error": "Cuerpo vacío"}), 400
        try:
            ErrorsFromFN = json.loads(raw)
        except Exception as e:
            return jsonify({"error": "JSON inválido", "detail": str(e)}), 400

    if isinstance(ErrorsFromFN, dict):
        ErrorsFromFN = [ErrorsFromFN]
    if not isinstance(ErrorsFromFN, list):
        return jsonify({"error": f"Se esperaba dict o list, llegó {type(ErrorsFromFN)._name_}"}), 400
    for i, item in enumerate(ErrorsFromFN):
        if not isinstance(item, dict):
            return jsonify({"error": f"Elemento {i} no es objeto JSON", "got": type(item)._name_}), 400

    # print("OK JSON list, n=", len(ErrorsFromFN))
    ErrorsFromDB = GetErros_FromAPI()
    print("Errores en DB:", len(ErrorsFromDB))
    for art in ErrorsFromFN:
        for file in ErrorsFromDB:
            if art['Error Message'] == file['Error_Message']:
                print("Error ya existe en DB:", art['Error Message'])
            else:
                print("Error nuevo a insertar:", art['Error Message'])
    # ErrorList, insertados = Processing_NewErrors(ErrorsFromFN, ErrorsFromDB)
    # if ErrorList:
    #     UploadList(ErrorList)
    #     print(f"{insertados} errores nuevos insertados correctamente.")   
    return jsonify({"message": "Datos recibidos correctamente"}), 200

# def Processing_NewErrors(ErrorsFromFN, ErrorsFromDB):
#     to_insert = []
#     insertados = 0
#     mensajes_db = {item['Error_Message'] for item in ErrorsFromDB}
#     for Item in ErrorsFromFN:
#         mensaje = Item['Error Message']
#         if mensaje in mensajes_db:
#             continue  # ya existe
#         id_infotipo = predecir_infotipo(mensaje)
#         insertados += 1
#         to_insert.append({"Error_Message": mensaje, "ID_infotype": int(id_infotipo)})
#     return to_insert, insertados

def GetErros_FromAPI():
    ErrorsfromDB = []
    url = f"https://ayeseri.onrender.com/getErrors"
    try:
        response = requests.get(url)
        response.raise_for_status()
        datos = response.json()
        if isinstance(datos, list) and datos and isinstance(datos[0], list):
            ErrorsfromDB = [element for sublist in datos for element in sublist]
        else:
            ErrorsfromDB = datos
        return ErrorsfromDB
        # si = New_Error(Toprocess, Finaloutput)
    except requests.exceptions.HTTPError as HttpError:
        print(f"Error HTTP: {HttpError}")
    except requests.exceptions.ConnectionError as CNTError:
        print(f"Error Conexion: {CNTError}")
    except requests.exceptions.Timeout as TMError:
        print(f"Respuesta no encontrada: {TMError}")    
    except requests.exceptions.RequestException as RQSError:
        print(f"Please review following error: {RQSError}")
    return None

def UploadList(ListToUpload):    
    try:
        url = f"https://ayeseri.onrender.com/InsertErrors"
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, json=ListToUpload, headers=headers)
        response.raise_for_status()
        print("Datos enviados correctamente a la API.")
    except requests.exceptions.HTTPError as HttpError:
        print(f"Error HTTP: {HttpError}")
    except requests.exceptions.ConnectionError as CNTError:
        print(f"Error Conexion: {CNTError}")
    except requests.exceptions.Timeout as TMError:
        print(f"Respuesta no encontrada: {TMError}")
    except requests.exceptions.RequestException as RQSError:
        print(f"Please review following error: {RQSError}")
    return

def EEDB_Load():
    insert = []
    url = f"https://ayeseri.onrender.com/EEInsertErrors"
    system_date = datetime.now()
    actual_date = system_date.date()
    actual_hour = system_date.time()
    bs_date = actual_date.strftime('%Y-%m-%d')
    bs_hour = actual_hour.strftime('%H:%M:%S')
    try:
        headers = {'Content-Type': 'application/json'}
        # response = requests.post(url, json=ListToUpload, headers=headers)
        # response.raise_for_status()
        print("Datos enviados correctamente a la API.")
    except requests.exceptions.HTTPError as HttpError:
        print(f"Error HTTP: {HttpError}")
    except requests.exceptions.ConnectionError as CNTError:
        print(f"Error Conexion: {CNTError}")
    except requests.exceptions.Timeout as TMError:
        print(f"Respuesta no encontrada: {TMError}")
    except requests.exceptions.RequestException as RQSError:
        print(f"Please review following error: {RQSError}")
    return
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
