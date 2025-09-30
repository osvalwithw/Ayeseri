# from Clasificador_infotipo import predecir_infotipo
from API_connection import GetErros_FromAPI, ObtainErrors

# if __name__ == "__main__":
#     DB_data = GetErros_FromAPI()
#     if DB_data:
#         print("Informacion recibida")
#         # print(type(DB_data))
#         # print(json.dumps(DB_data, indent=1))
#     # for item in DB_data:
#     #     print(item['Error_Message'])

def New_Error(ErrorFromFN, ErrorsFromDB):    
    # Insertar nuevos errores
    insertados = 0
    for Item in ErrorFromFN:
        mensaje = Item['Error_Message']
            
        if mensaje in ErrorsFromDB:
            continue  # ya existe

        # id_infotipo = predecir_infotipo(mensaje)
        # consulta = "INSERT INTO errors (Error_Message, ID_infotype) VALUES (%s, %s)"
        # datos = (mensaje,int(id_infotipo))
            
        insertados += 1
        # else:
        # id_infotipo = predecir_infotipo(mesage)
        # consulta = "INSERT INTO errors (Error_Message, ID_infotype) VALUES (%s, %s)"
        # datos = (mesage,int(id_infotipo))
            

        # insertados += 1
    
    print(f"{insertados} errores nuevos insertados correctamente.")
    
    return 0

# def New_Error(Sel, mesage):    
#     # Insertar nuevos errores
#     insertados = 0
#     if Sel ==1:
#         for index, row in df.iterrows():
#             mensaje = row['Error_Message']
            
#             if mensaje in DB_data:
#                 continue  # ya existe

#             id_infotipo = predecir_infotipo(mensaje)
#             consulta = "INSERT INTO errors (Error_Message, ID_infotype) VALUES (%s, %s)"
#             datos = (mensaje,int(id_infotipo))
            
#             insertados += 1
#     else:
#         id_infotipo = predecir_infotipo(mesage)
#         consulta = "INSERT INTO errors (Error_Message, ID_infotype) VALUES (%s, %s)"
#         datos = (mesage,int(id_infotipo))
            

#         insertados += 1
    
#     print(f"✅ {insertados} errores nuevos insertados correctamente.")
    
#     return 0
    
# New_Error(1, 0)
