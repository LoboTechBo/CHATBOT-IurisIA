// Funcion para la voz del bot
function speakBotResponse(text) {
    // Verifica si el navegador soporta la síntesis de voz
    if ('speechSynthesis' in window) {
        // Obtiene las voces disponibles
        let voices = window.speechSynthesis.getVoices();

        // Filtra para obtener una voz masculina en español (Latinoamérica)
        let spanishVoice = voices.find(voice => 
            voice.lang === 'es-MX' || voice.lang === 'es-US' || 
            (voice.lang.startsWith('es') && voice.name.includes('male'))
        );

        if (!spanishVoice) {
            // Si no se encuentra la voz específica, usa una en español por defecto
            spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
        }

        // Crea un nuevo objeto SpeechSynthesisUtterance con el texto
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = spanishVoice;
        utterance.lang = 'es-ES'; // Configura el lenguaje a español
        utterance.rate = 1; // Velocidad normal de la voz
        utterance.pitch = 1; // Tono de voz normal

        // Habla el texto
        window.speechSynthesis.speak(utterance);
    } else {
        console.log('La síntesis de voz no es soportada en este navegador.');
    }
}
// Función para desplazar el chat hacia el final
function scrollToBottom() {
    var chatContainer = $('#messageFormeight');
    chatContainer.scrollTop(chatContainer[0].scrollHeight);
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
