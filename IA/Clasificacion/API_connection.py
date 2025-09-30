import requests
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/ObtainErrors', methods=['POST'])
def ObtainErrors():
    recieved = request.get_json
    if( not recieved ):
        return jsonify({"error": "No se recivio la informacion"}), 400
    print(recieved)

def GetErros_FromAPI():
    Finaloutput = []
    url = f"https://ayeseri.onrender.com/getErrors"

    try:
        response = requests.get(url)
        response.raise_for_status()

        datos = response.json()
        if datos:
            Finaloutput = [element for sublist in datos for element in sublist]
        return Finaloutput
    except requests.exceptions.HTTPError as HttpError:
        print(f"Error HTTP: {HttpError}")
    except requests.exceptions.ConnectionError as CNTError:
        print(f"Error Conexion: {HttpError}")
    except requests.exceptions.Timeout as TMError:
        print(f"Respuesta no encontrada: {TMError}")    
    except requests.exceptions.RequestException as RQSError:
        print(f"Please review following error: {TMError}")
    return None

if __name__ == "__main__":
    app.run(debug=True)
    app.run(port=5001, debug=True)