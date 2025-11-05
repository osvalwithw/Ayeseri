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













# # -*- coding: utf-8 -*-
# """
# error_mapper.py
# - Toma errores del frontend (con texto)
# - Los mapea a IDX en la tabla `errors` (catálogo). Si no existen, los crea.
# - (Opcional) Llama a un clasificador para predecir ID_infotype.
# - Devuelve payloads listos para insertar en employee_errors (u otra tabla).
# """

# from typing import List, Dict, Any, Callable, Tuple

# # ----------------- Normalización & helpers -----------------
# def _norm(s: str) -> str:
#     return (s or "").strip().lower()

# def _get_msg(d: Dict[str, Any]) -> str:
#     return (d.get("Error Message")
#             or d.get("Error_Message")
#             or d.get("Error_message")
#             or d.get("Error")
#             or "")

# def build_lookup_by_message(errors_catalog: List[Dict[str, Any]]) -> Dict[str, int]:
#     """
#     Construye un dict mensaje_normalizado -> IDX a partir del catálogo `errors`.
#     Espera campos: IDX y alguno de Error_Message / Error Message / Error.
#     """
#     lookup = {}
#     for row in errors_catalog or []:
#         idx = row.get("IDX") or row.get("Id") or row.get("ID") or row.get("id")
#         msg = (row.get("Error_Message") or row.get("Error Message")
#                or row.get("Error_message") or row.get("Error") or "")
#         if idx is not None and msg:
#             lookup[_norm(msg)] = int(idx)
#     return lookup

# # ----------------- Núcleo: procesamiento -----------------
# def process_errors_to_payload(
#     errors_from_front: List[Dict[str, Any]],
#     errors_catalog_db: List[Dict[str, Any]],
#     create_error_idx: Callable[[str], int],
#     predict_infotype: Callable[[str], int] | None = None,
#     keep_title: bool = False
# ) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
#     """
#     - Si el mensaje existe en el catálogo 'errors' -> usa su IDX.
#     - Si no existe -> lo crea con create_error_idx(msg) y usa ese IDX.
#     - (Opcional) predice el infotipo con predict_infotype(msg).
#     Devuelve:
#       payloads:  [{ "ID_Error": int, "ID_infotype": int|None, (opt) "Error_Message": str }, ...]
#       stats:     { "existentes": X, "creados": Y, "procesados": N, "saltados": Z }
#     """
#     lookup = build_lookup_by_message(errors_catalog_db)
#     payloads: List[Dict[str, Any]] = []
#     stats = {"existentes": 0, "creados": 0, "procesados": 0, "saltados": 0}

#     seen = set()  # evita duplicados en el mismo batch

#     for it in errors_from_front or []:
#         raw_msg = _get_msg(it)
#         key = _norm(raw_msg)
#         if not key or key in seen:
#             continue
#         seen.add(key)

#         # 1) Resolver IDX
#         idx = lookup.get(key)
#         if idx is None:
#             try:
#                 idx = int(create_error_idx(raw_msg))  # <-- crea en `errors` y devuelve IDX
#                 lookup[key] = idx
#                 stats["creados"] += 1
#             except Exception:
#                 stats["saltados"] += 1
#                 continue
#         else:
#             stats["existentes"] += 1

#         # 2) (Opcional) predecir infotipo
#         id_it = None
#         if predict_infotype is not None:
#             try:
#                 id_it = int(predict_infotype(raw_msg))
#             except Exception:
#                 id_it = None  # si falla el modelo, no rompemos el flujo

#         # 3) Armar payload final
#         item = {"ID_Error": idx, "ID_infotype": id_it}
#         if keep_title:
#             item["Error_Message"] = raw_msg
#         payloads.append(item)
#         stats["procesados"] += 1

#     return payloads, stats

# # # ----------------- Ejemplo de integración -----------------
# # if __name__ == "__main__":
# #     # Estos son ejemplos stub. Sustituye por tus funciones reales.
# #     def GetErrorsCatalog_FromAPI() -> List[Dict[str, Any]]:
# #         # Ej: SELECT IDX, Error_Message FROM errors
# #         return [
# #             {"IDX": 101, "Error_Message": "Formatting error in the field P0001-ANSVH"},
# #             {"IDX": 202, "Error_Message": "Address missing in IT0006"},
# #         ]

# #     def create_error_idx(msg: str) -> int:
# #         # TODO: Implementa con tu API Node/Express o acceso directo a DB.
# #         # Debe insertar en `errors` (si no existe) y regresar el IDX.
# #         # Aquí simulo que cada nuevo obtiene 999+.
# #         print(f"[demo] creando en catálogo: {msg}")
# #         return 999

# #     # Opcional: conecta con tu clasificador del archivo classifier.py
# #     try:
# #         from classifier import predecir_infotipo
# #     except Exception:
# #         predecir_infotipo = None

# #     errors_front = [
# #         {"Error Message": "Formatting error in the field P0001-ANSVH"},
# #         {"Error Message": "New unseen error from WD to SAP mapping"}
# #     ]

# #     catalog = GetErrorsCatalog_FromAPI()
# #     payloads, stats = process_errors_to_payload(
# #         errors_from_front=errors_front,
# #         errors_catalog_db=catalog,
# #         create_error_idx=create_error_idx,
# #         predict_infotype=predecir_infotipo,  # o None si no quieres clasificar aquí
# #         keep_title=False
# #     )

# #     print("Payloads:", payloads)
# #     print("Stats:", stats)
