from datetime import datetime
from Classify_Method import predecir_infotipo
from API_requests import GetErros_FromAPI, UploadErrorList, GetIT_FromAPI, EEDB_Load

errorheaders = [
    'Error_Message', 'Error Message', 'Error', 'Errors',
    'ErrorMessages', 'Error Messages', 'Error_Messages',
    'Mensaje_de_Error', 'Mensajes_de_Error', 'error_msg',
    'error message', 'error messages'
]

EEheader = [
    'Employee_ID', 'Employee ID', 'EE_ID',
    'ID_Empleado', 'ID Empleado', 'Empleado_ID',
    'employeeid', 'employee id', 'ee_id'
]

errorhd, EEhd = None, None

def DinamicHeaderDetection(File, errorheaders, EEheader):
    FileHeaders = File[0].keys()
    detected_error_header = None
    detected_EE_header = None

    for header in FileHeaders:
        if header in errorheaders:
            detected_error_header = header
        if header in EEheader:
            detected_EE_header = header
        if detected_error_header and detected_EE_header:
            break

    if detected_error_header is None:
        raise ValueError("No se encontró una columna de mensajes de error válida en el archivo.")
    if detected_EE_header is None:
        raise ValueError("No se encontró una columna de ID de empleado válida en el archivo.")

    return detected_error_header, detected_EE_header

def Processing_new_errors(ErrorsFromFN):
    standarErrorheader = 'Error_Message'
    standarEEHeader = 'Employee_ID'
    ErrorsFromDB = GetErros_FromAPI()
    ITfromDB = GetIT_FromAPI()
    onlynew = []
    not_processed = []
    errorhd, EEhd = DinamicHeaderDetection(ErrorsFromFN, errorheaders, EEheader)
    # print(f"Detected Error Header: {errorhd}, Detected EE Header: {EEhd}")
    existing_error_messages = {error['Error_Message'] for error in ErrorsFromDB}
    # print(existing_error_messages)

    for error in ErrorsFromFN:
        if error[errorhd] not in existing_error_messages:
            onlynew.append(error)
        else:
            not_processed.append(error[errorhd])
        error[standarErrorheader] = error.pop(errorhd)
        error[standarEEHeader] = error.pop(EEhd)

    for new_error in onlynew:
        code = predecir_infotipo(new_error)
        aux = None
        for it in ITfromDB:
            # print(it['ID_Infotype'], code)
            if str(it['ID_Infotype']).strip() == str(code).strip():
                aux = it['Infotype_IND']
        new_error['ID_Infotype'] = aux

    # print("TO process", onlynew)
    # print("Ignored due to existence: ", not_processed)
    if onlynew:
        # print(f"Uploading {len(onlynew)} new errors to the database...")
        # Agregarr tiempo de espera
        UploadErrorList(onlynew)
    else:
        print("No new errors to upload.")
    return errorhd

def UploadingEE_Errors(ErrorsFromFN, Userwhouploads):
    ErrorsFromDB = GetErros_FromAPI()
    system_date = datetime.now()
    actual_date = system_date.date()
    actual_hour = system_date.time()
    bs_date = actual_date.strftime('%Y-%m-%d')
    bs_hour = actual_hour.strftime('%H:%M:%S')
    error_lookup = {
        str(db_error['Error_Message']).strip(): db_error['ID_Error']
        for db_error in ErrorsFromDB
    }
    for error in ErrorsFromFN:
        # print("Processing EE Error:", error)
        error_message_key = str(error['Error_Message']).strip()
        if error_message_key in error_lookup:
            id_encontrado = error_lookup[error_message_key]
            # print(f"Coincidencia encontrada para '{error_message_key}'. Se asigna el ID: {id_encontrado}")
            error['Error_Message'] = id_encontrado
            error['Load_Date'] = bs_date
            error['Load_Hour'] = bs_hour
    print("Processed EE Errors:", ErrorsFromFN)
    EEDB_Load(ErrorsFromFN, Userwhouploads)
    return
