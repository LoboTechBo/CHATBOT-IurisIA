# modules/modelo.py
from transformers import BertModel, BertTokenizer

def cargar_modelo(nombre_modelo):
    """Carga el modelo BERT y el tokenizador especificados."""
    tokenizador = BertTokenizer.from_pretrained(nombre_modelo, do_lower_case=False)
    modelo = BertModel.from_pretrained(nombre_modelo)
    return tokenizador, modelo

def generar_representacion(oracion, tokenizador, modelo):
    """Genera una representación (embedding) de una oración usando el modelo BERT."""
    entradas = tokenizador(oracion, return_tensors="pt")
    salidas = modelo(**entradas)
    return salidas.pooler_output.detach().numpy().squeeze()