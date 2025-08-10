import pandas as pd
import mysql.connector
from datetime import datetime
from Error_load_V2 import New_Error

conexion = mysql.connector.connect(
    host="192.168.18.254",  # Cambia a la IP del servidor si es remoto
    user="Inserter",
    password="!G00gl3!",
    database="dev_base"
)

errors_obtain = conexion.cursor()

# para ver todos los errores disponibles

sql = "SELECT * FROM errors"
errors_obtain.execute(sql)
res = errors_obtain.fetchall()
# conexion.close()
errors_obtain.close()

errores_db = {(file[1], file[0]) for file in res}


test = 'C:\\Users\\osval\\OneDrive\\Escritorio\\Testeo\\WD2SAP_Error_3309711.csv'

df = pd.read_csv(test, encoding="ISO-8859-1")
df["Employee ID"] = df["Employee ID"].astype(str).apply(lambda x: x.replace(".0", ""))

Id_error_tba = {}

for index, row in df.iterrows():
    error_message = row["Error Message"]
    employee_id = row["Employee ID"]

    # Buscar directamente en el conjunto de errores
    file_entry = next((file[0] for file in res if file[1] == error_message), None)

    if file_entry:
        if employee_id not in Id_error_tba:
            Id_error_tba[employee_id] = []
        Id_error_tba[employee_id].append(file_entry)
    else:
        insert_error = New_Error(2, error_message)
        if employee_id not in Id_error_tba:
            Id_error_tba[employee_id] = []
        Id_error_tba[employee_id].append(error_message)

EE_errors_load = conexion.cursor()

# para ver todos los errores disponibles

insert = ()

system_date = datetime.now()

actual_date = system_date.date()
actual_hour = system_date.time()

bs_date = actual_date.strftime('%Y-%m-%d')
bs_hour = actual_hour.strftime('%H:%M:%S')

for employee_id, errors in Id_error_tba.items():
    for error in errors:
        print(employee_id, error, bs_date, bs_hour)
        
        insert = (employee_id, error, bs_date, bs_hour)        
        sql = "INSERT INTO employee_errors (ID_EE, ID_Error, Load_Date, Load_hour) VALUES (%s, %s, %s, %s)"
        EE_errors_load.execute(sql, insert)

conexion.commit()

EE_errors_load.close()
conexion.close()