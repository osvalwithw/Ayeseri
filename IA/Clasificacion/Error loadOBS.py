import pandas as pd
import mysql.connector

test = 'WD2SAP_COMMON_ERRORS_HR.csv'

df = pd.read_csv(test, encoding="ISO-8859-1")

conexion = mysql.connector.connect(
    host="192.168.18.254",  # Cambia a la IP del servidor si es remoto
    user="Inserter",
    password="!G00gl3!",
    database="dev_base"
)

#Insertar datos
mycursor = conexion.cursor()
for index, row in df.iterrows():
    consulta = "INSERT INTO errors (IDX, Error_Message) VALUES (%s, %s)"
    datos = (row['Employee ID'], row['Error Message'])
    mycursor.execute(consulta, datos)
    conexion.commit()  # Guarda los cambios en la base
    datos=()
    # print(index, row['Employee ID'], row['Error Message'])

print("Datos insertados correctamente")

mycursor.close()
conexion.close()