import numpy as np
import random
import re
from modules.modelo import normalizar_texto, generar_representacion

# Umbral más alto porque sentence-transformers da cosenos más precisos
UMBRAL_SIMILITUD = 0.60

def buscar_respuesta(texto_entrada, datos, tokenizador, modelo, umbral=UMBRAL_SIMILITUD):
    """
    Busca la mejor respuesta usando similitud coseno con sentence-transformers.
    Con embeddings ya normalizados, el coseno = producto punto.
    """

    if datos is None:
        return "Lo siento, ocurrió un error al cargar los datos. Inténtalo más tarde."

    # Validar entrada: debe tener al menos una letra
    texto_limpio = texto_entrada.strip()
    if not texto_limpio or not re.search(r'[a-zA-ZñÑáéíóúÁÉÍÓÚ]', texto_limpio):
        return "No entiendo tu mensaje. ¿Podrías escribir tu consulta con palabras?"

    # Longitud mínima razonable
    if len(texto_limpio) < 3:
        return "Tu mensaje es muy corto. ¿Puedes describir mejor tu consulta?"

    try:
        # Generar embedding de la entrada (ya normalizado a norma 1)
        emb_entrada = generar_representacion(texto_entrada, tokenizador, modelo)

        similitud_maxima = -1
        mejor_respuesta = None
        segundo_mejor = None

        for intento in datos:
            for emb_pregunta in intento["pregunta_representaciones"]:
                # Con normalize_embeddings=True, coseno = producto punto
                similitud = float(np.dot(emb_entrada, emb_pregunta))

                if similitud > similitud_maxima:
                    similitud_maxima = similitud
                    segundo_mejor = mejor_respuesta
                    mejor_respuesta = random.choice(intento["respuesta"])

        print(f"[DEBUG] Similitud máxima: {similitud_maxima:.4f}")  # Útil para ajustar umbral

        if similitud_maxima < umbral:
            return (
                "Lo siento, no tengo información sobre esa consulta. "
                "Intenta reformularla o usa el formulario de preguntas no respondidas "
                "para que podamos ayudarte mejor."
            )

        return mejor_respuesta

    except Exception as e:
        print(f"Error en buscar_respuesta: {e}")
        return "Ocurrió un error al procesar tu consulta. Por favor, inténtalo de nuevo."