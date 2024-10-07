# modules/database.py
from pymongo import MongoClient
from modules.modelo import generar_representacion

"""Establece la conexión con MongoDB y devuelve la colección de intentos."""
cliente = MongoClient("mongodb+srv://GabrielCarmeloMorales:$Carmelo20022611$@cluster0.a1kle.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  # Modifica esto según tu configuración
base_datos = cliente["CarmeloChatbotDB"]

def conectar_mongodb():
    coleccion = base_datos["QA"]
    return coleccion

def cargar_datos_mongodb(tokenizador, modelo):
    """Carga los datos desde MongoDB y genera las representaciones de las preguntas."""
    coleccion = conectar_mongodb()
    datos = list(coleccion.find({}))  # Cargar todos los documentos de la colección
    # Para cada documento, genera las representaciones de las preguntas
    for intento in datos:
        intento["pregunta_representaciones"] = []
        for pregunta in intento["pregunta"]:
            representacion = generar_representacion(pregunta, tokenizador, modelo)
            intento["pregunta_representaciones"].append(representacion)
    
    return datos  # Asegúrate de retornar los datos

def cargar_calificaciones():
    coleccion_cal = base_datos["Calificaciones"]
    return coleccion_cal