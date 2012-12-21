var app = app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , usernames = []
  , temp_name = null
  , id = 1;

app.listen(1337);

function handler(req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

// Avoid injections
function htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Connection
io.sockets.on('connection', function (socket) {
  socket.emit('connected', 'Connected');
  
  // New user/client
  socket.on('new_username', function (message) {
    message = htmlEntities(message);
    // If the user does not specify a name, or if it is already taken, create a default name
    if(message === null || message === "" || message === usernames[message]) {
      temp_name = 'Anonymous'+id;
      id++;
    }
    else {
      temp_name = message;
    }
    usernames.push(temp_name);
    socket.username = temp_name;

    socket.emit('new_message', temp_name+'(you) connected');
    socket.broadcast.emit('new_message', temp_name+' connected');
  });

  // Chat message is received
  socket.on('chat', function (message) {
     message = htmlEntities(message);

    if(socket.username && message) {
      // Foward the message to all clients
      io.sockets.emit('new_message', '@'+socket.username+': '+message);
    }
  });

  // Disconnect
  socket.on('disconnect', function () {
    if(socket.username) {
      // Remove the client from the global list
      usernames.splice(usernames.indexOf(socket.username), 1);
      // Let all the remaining clients know of the disconnect
      io.sockets.emit('new_message', socket.username+' disconnected');
    }
  });
});