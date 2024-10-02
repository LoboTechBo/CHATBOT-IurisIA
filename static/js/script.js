$(document).ready(function() {
  $("#messageArea").on("submit", function(event) {
      event.preventDefault();
      var message = $("#text").val();
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
              $("#text").val('');
          }
      });
  });
});