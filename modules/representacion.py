import torch
import random
from modules.modelo import generar_representacion
import re 

def buscar_respuesta(texto_entrada, datos, tokenizador, modelo, umbral=0.50):
    """Busca la mejor respuesta en función de la similitud del coseno usando PyTorch."""
    
    if datos is None:
        print("Error: 'datos' es None. Verifica cómo se está cargando o pasando.")
        return "Lo siento, ocurrió un error al buscar la respuesta. Por favor, inténtalo de nuevo más tarde."

    # Validar si la entrada es válida (por ejemplo, no está vacía y no contiene solo símbolos)
    if not texto_entrada.strip() or not re.search(r'\w+', texto_entrada):
        return "No entiendo tu mensaje. ¿Podrías ser más claro?"
    if not texto_entrada.strip() or not re.search(r'[a-zA-ZñÑáéíóúÁÉÍÓÚ]', texto_entrada):
        return "No entiendo tu mensaje. ¿Podrías ser más claro?"
    try:
        # Genera la representación para la entrada del usuario
        representacion_entrada = generar_representacion(texto_entrada, tokenizador, modelo)
        representacion_entrada = torch.tensor(representacion_entrada).unsqueeze(0)
        
        similitud_maxima = -1
        mejor_respuesta = "Lo siento, no tengo una respuesta para esa pregunta. Intenta reformularla o pregunta otra cosa."
        
        # Compara la representación de la entrada con las representaciones pre-calculadas
        for intento in datos:
            for representacion_pregunta in intento["pregunta_representaciones"]:
                representacion_pregunta = torch.tensor(representacion_pregunta).unsqueeze(0)
                similitud = torch.nn.functional.cosine_similarity(representacion_entrada, representacion_pregunta).item()
                
                if similitud > similitud_maxima:
                    similitud_maxima = similitud
                    mejor_respuesta = random.choice(intento["respuesta"])
        
        # Si la similitud máxima no alcanza el umbral, devuelve una respuesta predeterminada
        if similitud_maxima < umbral:
            mejor_respuesta = "Lo siento, no tengo una respuesta para esa pregunta. Intenta reformularla o pregunta otra cosa."
        
        return mejor_respuesta

    except Exception as e:
        print(f"Error en buscar_respuesta: {e}")
        return "Lo siento, ocurrió un error al procesar tu pregunta. Por favor, inténtalo de nuevo."
