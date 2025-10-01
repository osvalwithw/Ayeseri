# from Clasificador_infotipo import predecir_infotipo
from Clasificador_infotipo import predecir_infotipo

# if __name__ == "__main__":
#     DB_data = GetErros_FromAPI()
#     if DB_data:
#         print("Informacion recibida")
#         # print(type(DB_data))
#         # print(json.dumps(DB_data, indent=1))
#     # for item in DB_data:
#     #     print(item['Error_Message'])

def Processing_NewErrors(ErrorsFromFN, ErrorsFromDB):
    to_insert = []
    insertados = 0
    for Item in ErrorsFromFN:
        mensaje = Item['Error Message']
            
        if mensaje in ErrorsFromDB:
            continue  # ya existe
        id_infotipo = predecir_infotipo(mensaje)
        insertados += 1
        to_insert.append({"Error_Message": mensaje, "ID_infotype": int(id_infotipo)})
    return to_insert, insertados