# from Clasificador_infotipo import predecir_infotipo
from Clasificador_infotipo import predecir_infotipo
from typing import List, Dict, Any, Callable, Tuple, Union

# if __name__ == "__main__":
#     DB_data = GetErros_FromAPI()
#     if DB_data:
#         print("Informacion recibida")
#         # print(type(DB_data))
#         # print(json.dumps(DB_data, indent=1))
#     # for item in DB_data:
#     #     print(item['Error_Message'])

# def Processing_NewErrors(ErrorsFromFN, ErrorsFromDB):
#     to_insert = []
#     insertados = 0
#     for Item in ErrorsFromFN:
#         mensaje = Item['Error_Message']
            
#         if mensaje in ErrorsFromDB:
#             continue  # ya existe
#         id_infotipo = predecir_infotipo(mensaje)
#         insertados += 1
#         to_insert.append({"Error_Message": mensaje, "ID_infotype": int(id_infotipo)})
#     return to_insert, insertados

# ---------- Helpers de normalización ----------
def _normalize(s: str) -> str:
    return (s or "").strip().lower()

def _get_msg(item: Dict[str, Any]) -> str:
    return (item.get("Error Message")
            or item.get("Error_Message")
            or item.get("Error_message")
            or item.get("Error")
            or "")

def _build_messages_set(ErrorsFromDB: Union[List[Dict[str, Any]], List[str], set]) -> set:
    """
    Acepta:
      - lista de dicts con campo de mensaje (Error_Message / Error Message / Error)
      - lista de strings
      - set de strings
    Devuelve un set de mensajes normalizados.
    """
    if isinstance(ErrorsFromDB, set):
        return {_normalize(x) for x in ErrorsFromDB}
    if not ErrorsFromDB:
        return set()
    first = ErrorsFromDB[0]
    if isinstance(first, dict):
        msgs = []
        for row in ErrorsFromDB:
            msg = (row.get("Error_Message") or row.get("Error Message")
                   or row.get("Error_message") or row.get("Error") or "")
            if msg:
                msgs.append(_normalize(msg))
        return set(msgs)
    else:
        # lista de strings
        return {_normalize(x) for x in ErrorsFromDB}

def build_db_lookup_by_message(ErrorsCatalog: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Construye mapping mensaje_normalizado -> IDX usando el catálogo 'errors'.
    Espera campos: IDX y alguno de Error_Message / Error Message / Error.
    """
    lookup = {}
    for row in ErrorsCatalog:
        idx = row.get("IDX") or row.get("Id") or row.get("ID") or row.get("id")
        msg = (row.get("Error_Message") or row.get("Error Message")
               or row.get("Error_message") or row.get("Error") or "")
        if idx is not None and msg:
            lookup[_normalize(msg)] = int(idx)
    return lookup

# ---------- 1) SOLO detectar nuevos y (opcional) predecir ----------
def collect_new_errors(
    ErrorsFromFN: List[Dict[str, Any]],
    ErrorsFromDB: Union[List[Dict[str, Any]], List[str], set],
    predecir_infotipo: Callable[[str], Any] = None
) -> List[Dict[str, Any]]:
    existing = _build_messages_set(ErrorsFromDB)
    seen_batch = set()
    nuevos = []

    for item in ErrorsFromFN:
        mensaje = _get_msg(item)
        key = _normalize(mensaje)
        if not key:
            continue
        if key in existing or key in seen_batch:
            continue
        seen_batch.add(key)

        payload = {"Error_Message": mensaje}
        if predecir_infotipo is not None:
            try:
                payload["ID_infotype"] = int(predecir_infotipo(mensaje)) #PPredciccion
            except Exception:
                payload["ID_infotype"] = None
        nuevos.append(payload)
    return nuevos

def map_titles_to_idx(
    new_errors: List[Dict[str, Any]],
    ErrorsCatalog: List[Dict[str, Any]],
    get_or_create_error_idx: Callable[[str], int] = None,
    allow_create_missing: bool = True,
    remove_title: bool = True
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Toma la lista de 'new_errors' (con 'Error_Message') y devuelve otra lista donde
    ese campo se reemplaza por 'ID_Error' (IDX de la tabla 'errors').

    Returns:
      (final_list, nuevos_en_catalogo)
    """
    lookup = build_db_lookup_by_message(ErrorsCatalog)
    final_list = []
    nuevos_en_catalogo = 0

    for item in new_errors:
        msg = item.get("Error_Message") or item.get("Error") or ""
        key = _normalize(msg)
        if not key:
            continue

        idx = lookup.get(key)
        if idx is None:
            if allow_create_missing and get_or_create_error_idx is not None:
                idx = int(get_or_create_error_idx(msg))
                lookup[key] = idx
                nuevos_en_catalogo += 1
            else:
                # Si no permites crear, lo saltamos
                continue

        # armamos el registro final
        new_item = {**item}
        new_item["ID_Error"] = int(idx)
        if remove_title:
            new_item.pop("Error_Message", None)  # ya no guardes el texto en la tabla relacional
        final_list.append(new_item)

    return final_list, nuevos_en_catalogo


