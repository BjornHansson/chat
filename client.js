$(document).ready(function() {
  'use strict';

  var socket = null,
      url = 'ws://localhost:1337',
      username = null,
      output = $('#output');

  $('#connect_url').val(url); // Display the default url in form field for the user to change

  // Event handler to create the websocket connection
  $('#connect').on('click', function(event) {
    url = $('#connect_url').val(); // Get url
    socket = io.connect(url); // Create the websocket

    // On connection
    socket.on('connected', function (message) {
      username = $('#username').val();
      socket.emit('new_username', username); // Create username

      // Hide div with settings and show the log
      $("#settings").hide();
      $("#log").show();

      // When a new message is sent from the server, output in the log
      socket.on('new_message', function (message) {
        outputLog(message);
      });
    });
  });

  // Send a message to the server
  function sendMessage(message) {
    if(socket === null) {
      //console.log('The socket is not connected to a server.');
    } else {
      socket.emit('chat', message);
      $('#message').val('');
    }
  }

  // Event handlers to send message
  $('#send_message').on('click', function(event) {
    var msg = $('#message').val();
    sendMessage(msg);
  });
  $('#message').keydown(function(event) {
      // On enter
      if (event.keyCode === 13) {
          var msg = $('#message').val();
          sendMessage(msg);
          return false;
       }
  });

  // Add the message to the log
  function outputLog(message) {
    var now = new Date();
    $(output).append('<em>'+now.toLocaleTimeString() + '</em> ' + message + '<br />').scrollTop(output[0].scrollHeight);
  }

  // Close the connection to the server
  $('#close').on('click', function() {
    socket.emit('disconnect');
    socket.close;
    location.reload();
  });

  // Start by hiding the log
  $("#log").hide();
});