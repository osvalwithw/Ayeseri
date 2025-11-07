import requests

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

def GetIT_FromAPI():
    ITfromDB = []
    url = f"https://ayeseri.onrender.com/Getinfotypes"
    try:
        response = requests.get(url)
        response.raise_for_status()
        datos = response.json()
        if isinstance(datos, list) and datos and isinstance(datos[0], list):
            ITfromDB = [element for sublist in datos for element in sublist]
        else:
            ITfromDB = datos
        return ITfromDB
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
    # print('Uploading list to BD...')
    # print(ListToUpload)
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

def EEDB_Load(ListToUpload, Userwhouploads):
    url = f"https://ayeseri.onrender.com/EEInsertErrors/{Userwhouploads}"
    print('user who uploads:', Userwhouploads)
    try:
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