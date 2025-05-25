# app.py
from flask import Flask, render_template, request, jsonify
from modules.modelo import cargar_modelo
from modules.representacion import buscar_respuesta
from modules.database import cargar_datos_mongodb, cargar_calificaciones, cargar_reportes
from bson import ObjectId

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

#Función calificaciones

@app.route('/submit-rating', methods=['POST'])
def submit_rating():
    # Crea un nuevo ObjectId para este documento
    new_id = ObjectId()
    calificaciones = cargar_calificaciones()
    # Prepara el documento para insertar
    rating_doc = {
        "_id": new_id,
        "nombre": request.form.get('name'),
        "puntuacion": int(request.form.get('star_rating')),
        "comentario": request.form.get('comentario')
    }
    
    # Inserta el documento en la colección
    result = calificaciones.insert_one(rating_doc)
    
    if result.inserted_id:
        return jsonify({"message": "Calificación guardada exitosamente", "id": str(new_id)}), 200
    else:
        return jsonify({"message": "Error al guardar la calificación"}), 500
#Función de preguntas no respondidas
@app.route('/submit-qna', methods=['POST'])
def submit_qna():
    # Crea un nuevo ObjectId para este documento
    new_id = ObjectId()
    reportes = cargar_reportes()
    report_doc = {
        "_id": new_id,
        "nombre": request.form.get('user_noanswerd'),
        "correo": request.form.get('email'),
        "consulta": request.form.get('quest_noanswerd')
    }
      # Inserta el documento en la colección
    result = reportes.insert_one(report_doc)
    
    if result.inserted_id:
        return jsonify({"message": "Calificación guardada exitosamente", "id": str(new_id)}), 200
    else:
        return jsonify({"message": "Error al guardar la calificación"}), 500
"""if __name__ == '__main__':
    app.run(debug=True)"""

if __name__ == "__main__":
    app.run()