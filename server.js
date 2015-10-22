var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    path = require('path'),
    usernames = [],
    temp_name = null,
    id = 1;

app.listen(1337);

// Run a very simple HTTP server
function handler(request, response) {
    var filePath = '.' + request.url;
    if (filePath == './') {
        filePath = './index.html';
    }

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
    }

    fs.readFile(filePath,
        function(error, data) {
            if (error) {
                response.writeHead(500);
                return response.end('Error loading file');
            }
            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.end(data);
        });
}

function replaceHtmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Connection
io.sockets.on('connection', function(socket) {
    socket.emit('connected', 'Connected');

    // New user/client
    socket.on('new_username', function(message) {
        message = replaceHtmlEntities(message);
        // If the user does not specify a name, or if it is already taken, create a default name
        if (message === null || message === '' || message === usernames[message]) {
            temp_name = 'Anonymous' + id;
            id++;
        } else {
            temp_name = message;
        }
        usernames.push(temp_name);
        socket.username = temp_name;

        socket.emit('new_message', temp_name + '(you) connected');
        socket.broadcast.emit('new_message', temp_name + ' connected');
    });

    // Chat message is received
    socket.on('chat', function(message) {
        message = replaceHtmlEntities(message);

        if (socket.username && message) {
            // Foward the message to all clients
            io.sockets.emit('new_message', '@' + socket.username + ': ' + message);
        }
    });

    // Disconnect
    socket.on('disconnect', function() {
        if (socket.username) {
            // Remove the client from the global list
            usernames.splice(usernames.indexOf(socket.username), 1);
            // Let all the remaining clients know of the disconnect
            io.sockets.emit('new_message', socket.username + ' disconnected');
        }
    });
});