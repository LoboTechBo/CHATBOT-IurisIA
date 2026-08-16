from sentence_transformers import SentenceTransformer
import unicodedata
import re

def cargar_modelo(nombre_modelo="paraphrase-multilingual-MiniLM-L12-v2"):
    """Carga un modelo de sentence-transformers optimizado para similitud semántica."""
    modelo = SentenceTransformer(nombre_modelo)
    return None, modelo  # retorna None como tokenizador para mantener compatibilidad

def normalizar_texto(texto):
    """
    Normaliza el texto: minúsculas, elimina acentos opcionales,
    colapsa espacios y limpia caracteres raros.
    """
    texto = texto.lower().strip()
    # Normalizar caracteres unicode (ej: á → a) para tolerar errores de tilde
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    # Eliminar caracteres que no sean letras, números o espacios
    texto = re.sub(r"[^\w\s]", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto

def generar_representacion(oracion, tokenizador=None, modelo=None):
    """
    Genera un embedding semántico usando sentence-transformers.
    El parámetro tokenizador se ignora (compatibilidad con código existente).
    """
    oracion_normalizada = normalizar_texto(oracion)
    embedding = modelo.encode(oracion_normalizada, normalize_embeddings=True)
    return embedding