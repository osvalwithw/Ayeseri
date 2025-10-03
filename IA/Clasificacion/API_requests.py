import requests
from datetime import datetime

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

def UploadErrorList(ListToUpload):
    print('Uploading list to BD...')
    print(ListToUpload)
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