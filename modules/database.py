import os
from pymongo import MongoClient
from modules.modelo import generar_representacion

"""Establece la conexión con MongoDB y devuelve la colección de intentos."""

"""MONGO_URI = os.environ.get("MONGO_URI")  # Render tomará esta variable del entorno"""
cliente = MongoClient("mongodb+srv://GabrielCarmeloMorales:$Carmelo20022611$@cluster0.a1kle.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  # Modifica esto según tu configuración
base_datos = cliente["CarmeloChatbotDB"]

def conectar_mongodb():
    coleccion = base_datos["QA"]
    return coleccion

def cargar_datos_mongodb(tokenizador, modelo):
    """Carga datos desde MongoDB y pre-calcula embeddings de preguntas."""
    coleccion = conectar_mongodb()
    datos = list(coleccion.find({}))

    print(f"[INFO] Cargando {len(datos)} intentos desde MongoDB...")

    for intento in datos:
        intento["pregunta_representaciones"] = []
        for pregunta in intento["pregunta"]:
            emb = generar_representacion(pregunta, tokenizador, modelo)
            intento["pregunta_representaciones"].append(emb)

    print("[INFO] Embeddings pre-calculados correctamente.")
    return datos

def cargar_calificaciones():
    coleccion_cal = base_datos["Calificaciones"]
    return coleccion_cal

def cargar_reportes():
    coleccion_rep = base_datos["Reportes"]
    return coleccion_rep