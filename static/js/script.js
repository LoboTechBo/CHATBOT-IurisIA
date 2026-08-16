// Función modal
const btnCalificar = document.querySelector("#eval");
const btnNoQuest = document.querySelector("#no-quest");
const descriptions = {
    1: "Nada útil",
    2: "Poco útil",
    3: "Regularmente útil",
    4: "Útil",
    5: "Muy útil"
};
const btnCerrar = document.querySelector("#cerrar-modal");
const btnCerrarMQNA = document.querySelector("#cerrar-modalQNA");
const modal = document.querySelector("#modal-likert");
const modalNQA = document.querySelector("#modal-nqa");

//Jaja pense que era # como comentario
//Boton Pregunta no atendida
btnNoQuest.addEventListener("click",()=>{
    modalNQA.showModal();
})
btnCerrarMQNA.addEventListener("click",()=>{
    modalNQA.close();
})
//Botón Calificar
btnCalificar.addEventListener("click",()=>{
    modal.showModal();
})
btnCerrar.addEventListener("click",()=>{
    modal.close();
})
//Obtener la voz
function getSpanishMaleVoice() {
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        
        if (voices.length !== 0) {
            let maleVoice = voices.find(voice => 
                voice.lang.startsWith('es') && 
                (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('hombre'))
            );

            resolve(maleVoice || voices.find(voice => voice.lang.startsWith('es')) || null);
            return;
        }

        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            let maleVoice = voices.find(voice => 
                voice.lang.startsWith('es') && 
                (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('hombre'))
            );

            resolve(maleVoice || voices.find(voice => voice.lang.startsWith('es')) || null);
        };
    });
}
function cleanHTML(text) {
    // Elimina etiquetas HTML
    let cleanText = text.replace(/<\/?[^>]+(>|$)/g, " ");
    return cleanText.trim(); 
}
function speakBotResponse(text) {
    if (!('speechSynthesis' in window)) {
        console.log('La síntesis de voz no es soportada en este navegador.');
        return;
    }

    let cleanText = cleanHTML(text); // Limpia etiquetas HTML
    let maxLength = 200; // Evitar cortes por límite del sintetizador

    let parts = cleanText.match(new RegExp('.{1,' + maxLength + '}(\\s|$)', 'g'));

    function speakPart(index) {
        if (index >= parts.length) return;

        let utterance = new SpeechSynthesisUtterance(parts[index]);

        // Obtener la voz masculina en español
        let voices = window.speechSynthesis.getVoices();
        let spanishVoice = voices.find(voice => voice.lang.includes('es') && voice.name.toLowerCase().includes('male'));

        if (!spanishVoice) {
            spanishVoice = voices.find(voice => voice.lang.includes('es'));
        }

        utterance.voice = spanishVoice;
        utterance.lang = 'es-ES';
        utterance.rate = 0.9; // Reducir la velocidad para que suene más natural
        utterance.pitch = 0.8; // Hacer la voz un poco más grave

        utterance.onend = () => speakPart(index + 1); // Reproducir la siguiente parte si hay más

        window.speechSynthesis.speak(utterance);
    }

    speakPart(0); // Comenzar la reproducción
}
// Función para desplazar el chat hacia el final
function scrollToBottom() {
    var chatContainer = $('#messageFormeight'); // Contenedor del chat
    var lastMessage = chatContainer.find('.msg_cotainer, .msg_cotainer_send').last(); // Último mensaje enviado o recibido

    if (lastMessage.length) {
        chatContainer.animate({
            scrollTop: lastMessage.offset().top - chatContainer.offset().top + chatContainer.scrollTop()
        }, 500); // Desplazamiento suave en 500ms
    }
}
// Función madre
$(document).ready(function() {
    let recognition;
    let isRecording = false;
    let botResponseCount = 0; // Contador para las respuestas del bot

    // Inicializar reconocimiento de voz
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            $("#text").val(transcript); // Llena el campo de texto con lo transcrito
            updateButtonState(); // Cambia el botón a "Enviar" si se ha transcrito algo
        };

        recognition.onend = () => {
            isRecording = false;
            updateButtonState(); // Cambia a "Micrófono" o "Enviar" dependiendo de si hay texto
        };
    } else {
        console.log('El reconocimiento de voz no está soportado en este navegador.');
    }

    // Función para actualizar el estado del botón
    function updateButtonState() {
        if ($("#text").val()) {
            $("#send").html('<i class="fa fa-paper-plane"></i>'); // Botón de "Enviar" si hay texto
        } else if (isRecording) {
            $("#send").html('<i class="fas fa-stop"></i>'); // Botón de "Detener" si está grabando
        } else {
            $("#send").html('<i class="fas fa-microphone"></i>'); // Botón de "Micrófono" si no hay texto
        }
    }
    // Función para manejar la lógica del envío de mensajes
    function sendMessage() {
        var message = $("#text").val();
        if (!message) return; // No hace nada si no hay mensaje

        $.ajax({
            type: "POST",
            url: "/",
            data: JSON.stringify({ message: message }),
            contentType: "application/json",
            success: function(response) {
                var userMessage = response.mensaje_usuario;
                var botResponse = response.respuesta_bot;
                $("#messageFormeight").append(userMessage);
                $("#messageFormeight").append(botResponse);
                // Llama a la función para que el bot hable
                speakBotResponse(response.respuesta_hablada);
                // Desplaza automáticamente hacia el pie de página
                scrollToBottom();
                // Limpia el input del mensaje
                $("#text").val('');

                // Incrementa el contador de respuestas del bot
                botResponseCount++;
                
                // Si el bot ha dado 3 respuestas, habilitar el botón de envío
                if (botResponseCount >= 3) {
                    $("#eval").prop('disabled', false);
                }
                if (botResponseCount >= 1) {
                    $("#no-quest").prop('disabled', false);
                }
                updateButtonState(); // Actualiza el estado del botón
            }
        });
    }

    // Manejar el evento de enviar con el botón
    $("#send").on("click", function(event) {
        event.preventDefault();
        if ($("#text").val()) {
            sendMessage(); // Envía el mensaje si hay texto
            if (isRecording) {
                recognition.stop(); // Detiene la grabación si está en curso
                isRecording = false;
            }
        } else {
            if (isRecording) {
                recognition.stop(); // Detener la grabación si ya está grabando
                isRecording = false;
            } else {
                recognition.start(); // Iniciar grabación si no está grabando
                isRecording = true;
            }
        }
        updateButtonState(); // Actualiza el estado del botón después de hacer clic
    });

    // Manejar el envío del formulario
    $("#messageArea").on("submit", function(event) {
        event.preventDefault();
        sendMessage();
    });

    // Detectar cambios en el input para actualizar el estado del botón
    $("#text").on('input', updateButtonState);

    // Inicializar el estado del botón en "Micrófono"
    updateButtonState();
});
document.getElementById('ratingForm').addEventListener('submit', function(event) {
    var inputField = document.getElementById('name-user');
    
    // Si el input está vacío, asignar el valor del placeholder
    if (inputField.value.trim() === '') {
        inputField.value = "Anónimo";
    }
});
//Código formulario enviar stars
$("form[name=ratingForm]").submit(function(e){
    var $form = $(this);
    var $error = $form.find(".error");
    var data = $form.serialize();
    
    $.ajax({
        url: "/submit-rating",
        type: "POST",
        data: data,
        dataType: "json",
        success: function(resp) {
            window.location.href = "/";
        },
        error: function(resp) {
            if (resp.responseJSON && resp.responseJSON.error) {
                $error.text(resp.responseJSON.error).removeClass("error--hidden");
            } else {
                // Handle generic error (e.g., network error, server error)
                $error.text("Ocurrió un error al calificar").removeClass("error--hidden");
            }
        }
    });

    e.preventDefault();
});
//Función letras modal-likert
const descriptionElement = document.getElementById('rating-description');
function updateDescription(event) {
    const ratingValue = event.target.value; // Obtiene el valor del radio seleccionado
    descriptionElement.textContent = descriptions[ratingValue];
}
document.querySelectorAll('.star').forEach((radio) => {
    radio.addEventListener('change', updateDescription);
});

//Formulario de Consultas no atendidas
$("form[name=answerForm]").submit(function(e){
    var $form = $(this);
    var $error = $form.find(".error");
    var data = $form.serialize();
    
    $.ajax({
        url: "/submit-qna",
        type: "POST",
        data: data,
        dataType: "json",
        success: function(resp) {
            window.location.href = "/";
        },
        error: function(resp) {
            if (resp.responseJSON && resp.responseJSON.error) {
                $error.text(resp.responseJSON.error).removeClass("error--hidden");
            } else {
                // Handle generic error (e.g., network error, server error)
                $error.text("Ocurrió un error al calificar").removeClass("error--hidden");
            }
        }
    });

    e.preventDefault();
});