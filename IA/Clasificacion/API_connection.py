import requests
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from DB_Error_LoadIA import New_Error

app = Flask(__name__)
CORS(app)

@app.route('/ObtainErrors', methods=['POST'])
def ObtainErrors():
    recieved = request.get_json(silent=True)
    if( not recieved ):
        return jsonify({"error": "No se recivio la informacion"}), 400
    print("Recivido en API_connection.py: ", json.dumps(recieved, ensure_ascii=Flask, indent=4))
    GetErros_FromAPI(recieved)
    return jsonify({"data": GetErros_FromAPI()}), 200

@app.route('/ping')
def ping():
    return "pong", 200

def GetErros_FromAPI(Toprocess):
    Finaloutput = []
    url = f"https://ayeseri.onrender.com/getErrors"
    try:
        response = requests.get(url)
        response.raise_for_status()

        datos = response.json()
        if isinstance(datos, list) and datos and isinstance(datos[0], list):
            Finaloutput = [element for sublist in datos for element in sublist]
        else:
            Finaloutput = datos
        si = New_Error(Toprocess, Finaloutput)
    except requests.exceptions.HTTPError as HttpError:
        print(f"Error HTTP: {HttpError}")
    except requests.exceptions.ConnectionError as CNTError:
        print(f"Error Conexion: {CNTError}")
    except requests.exceptions.Timeout as TMError:
        print(f"Respuesta no encontrada: {TMError}")    
    except requests.exceptions.RequestException as RQSError:
        print(f"Please review following error: {RQSError}")
    return None

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)