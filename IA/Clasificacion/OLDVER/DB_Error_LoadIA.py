import pandas as pd
import mysql.connector
from Clasificador_infotipo import predecir_infotipo

def New_Error(Sel, mesage):    
    conexion = mysql.connector.connect(
    host="ballast.proxy.rlwy.net", 
    user="root",
    password="orcwRrgSqSXVXQvheWbdQuysdWbIEzxO",
    database="railway",
    port=36227
    )
    mycursor = conexion.cursor()

    # Obtener mensajes ya existentes para evitar duplicados
    mycursor.execute("SELECT Error_Message FROM errors")
    errores_existentes = set(row[0] for row in mycursor.fetchall())

    # Insertar nuevos errores
    insertados = 0
    if Sel ==1:
        df = pd.read_csv('WD2SAP_COMMON_ERRORS_HR_V2.csv', encoding="ISO-8859-1")
        for index, row in df.iterrows():
            mensaje = row['Error_Message']
            
            if mensaje in errores_existentes:
                continue  # ya existe

            id_infotipo = predecir_infotipo(mensaje)
            consulta = "INSERT INTO errors (Error_Message, ID_infotype) VALUES (%s, %s)"
            datos = (mensaje,int(id_infotipo))
            
            mycursor.execute(consulta, datos)
            conexion.commit()
            insertados += 1
    else:
        id_infotipo = predecir_infotipo(mesage)
        consulta = "INSERT INTO errors (Error_Message, ID_infotype) VALUES (%s, %s)"
        datos = (mesage,int(id_infotipo))
            
        mycursor.execute(consulta, datos)
        conexion.commit()
        insertados += 1
    
    print(f"✅ {insertados} errores nuevos insertados correctamente.")

    mycursor.close()
    conexion.close()
    
    return 0
    
New_Error(1, 0)