from datetime import datetime
from Classify_Method import predecir_infotipo
from API_requests import GetErros_FromAPI, UploadErrorList, GetIT_FromAPI, EEDB_Load

def Processing_new_errors(ErrorsFromFN):
    ErrorsFromDB = GetErros_FromAPI()
    ITfromDB = GetIT_FromAPI()
    onlynew = []
    not_processed = []
    existing_error_messages = {error['Error_Message'] for error in ErrorsFromDB}

    for error in ErrorsFromFN:
        if error['Error_Message'] not in existing_error_messages:
            onlynew.append(error)
        else:
            not_processed.append(error['Error_Message'])

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
        UploadErrorList(onlynew)
    else:
        print("No new errors to upload.")
    return

def UploadingEE_Errors(ErrorsFromFN):
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
        error_message_key = str(error['Error_Message']).strip()
        if error_message_key in error_lookup:
            id_encontrado = error_lookup[error_message_key]
            # print(f"Coincidencia encontrada para '{error_message_key}'. Se asigna el ID: {id_encontrado}")
            error['Error_Message'] = id_encontrado
            error['Load_Date'] = bs_date
            error['Load_Hour'] = bs_hour
    print("Processed EE Errors:", ErrorsFromFN)
    EEDB_Load(ErrorsFromFN)
    return
