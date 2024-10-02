# app.py
from flask import Flask, render_template, request, jsonify
from modules.modelo import cargar_modelo
from modules.representacion import buscar_respuesta
from modules.database import cargar_datos_mongodb

# Carga del modelo y el tokenizador
modelo_beto = "dccuchile/bert-base-spanish-wwm-cased"
tokenizador, modelo = cargar_modelo(modelo_beto)

# Carga de datos desde MongoDB y precálculo de representaciones
datos=cargar_datos_mongodb(tokenizador, modelo)


# Configuración de la aplicación Flask
app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def principal():
    if request.method == "GET":
        return render_template("index.html")
    elif request.method == "POST":
        mensaje_usuario = request.json["message"]
        respuesta = buscar_respuesta(mensaje_usuario, datos, tokenizador, modelo)

        # Prepara la respuesta para la plantilla HTML
        mensaje_usuario_html = f'<div class="d-flex justify-content-end mb-4"><div class="msg_cotainer_send">{mensaje_usuario}</div></div>'
        respuesta_bot_html = f'<div class="d-flex justify-content-start mb-4"><div class="msg_cotainer">{respuesta}</div></div>'
        
        return jsonify({"mensaje_usuario": mensaje_usuario_html, "respuesta_bot": respuesta_bot_html, "respuesta_hablada": respuesta})

if __name__ == "__main__":
    app.run()