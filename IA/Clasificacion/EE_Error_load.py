from datetime import datetime

# test = 'C:\\Users\\osval\\OneDrive\\Escritorio\\Testeo\\WD2SAP_Error_3309711.csv'

# df = pd.read_csv(test, encoding="ISO-8859-1")
# df["Employee ID"] = df["Employee ID"].astype(str).apply(lambda x: x.replace(".0", ""))

# Id_error_tba = {}

# for index, row in df.iterrows():
#     error_message = row["Error Message"]
#     employee_id = row["Employee ID"]

#     # Buscar directamente en el conjunto de errores
#     file_entry = next((file[0] for file in res if file[1] == error_message), None)

#     if file_entry:
#         if employee_id not in Id_error_tba:
#             Id_error_tba[employee_id] = []
#         Id_error_tba[employee_id].append(file_entry)

# para ver todos los errores disponibles

# def EEDB_Load():
#     insert = ()
#     url = f"https://ayeseri.onrender.com/EEInsertErrors"
#     system_date = datetime.now()
#     actual_date = system_date.date()
#     actual_hour = system_date.time()
#     bs_date = actual_date.strftime('%Y-%m-%d')
#     bs_hour = actual_hour.strftime('%H:%M:%S')

#     for employee_id, errors in Id_error_tba.items():
        
#         for error in errors:
#             print(employee_id, error, bs_date, bs_hour)
#             insert = (employee_id, error, bs_date, bs_hour)
#             try:
#                 response = requests.post(url, json=insert)
#                 response.raise_for_status()
#                 print(f"Error insertado correctamente para Employee ID {employee_id}: {error}")
        
