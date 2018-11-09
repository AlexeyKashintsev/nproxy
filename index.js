/*const express = req
uire('express');
const app = express();
const targetBaseUrl = 'http://localhost:8084';
function handleRedirect(req, res) {
  const targetUrl = targetBaseUrl + req.originalUrl;
  console.log('request: ' + req.originalUrl);
  console.log('body: ' + req.body);
  console.log('query: ' + Object.entries(req.query).join(';'));
  res.redirect(targetUrl);
}
app.get('*', handleRedirect);
const port = process.env.port || 8082;
app.listen(port);*/

/*var
    url = require('url'),
    http = require('http'),
    acceptor = http.createServer().listen(8082);

acceptor.on('request', function(request, response) {
    console.log('===================================================================');
	console.log('request ' + request.url);
	console.log('---=== body ===---');
	console.log(request.body);
	//request.headers.host = 'localhost:8084';
	//response.pipe(request);
    var options = {};
	//options.port = 8084;//'http:\\localhost:8084' +request.url;
    options.hostname = 'localhost';
	options.port = 8084;
	options.auth = request.auth;
	options.path = request.url;
	options.headers = request.headers;
	options.headers.host = 'localhost:8084';
    options.method = request.method;
    options.agent = request.agent;
	console.log('---=== options ===---');
	console.log(options);
	var connector = http.request(options, function(res) {
		response.writeHead(res.statusCode, res.headers);
		console.log('---=== res.headers ===---');
		console.log(res.headers);
		res.on('data', resp => response.write(resp));
		res.pipe(response, {end:false});//tell 'response' end=true
	});
	//connector.end();
	request.pipe(connector, {end:true});
//  connector.pipe(response); // doesn't work
//  connector.pipe(request); // doesn't work either
});*/

var net = require('net');
const colors = require("colors");

var server = net.createServer(function(socket) {
	//socket.write();
	
});

server.on('connection', socket => {
	console.log('\n---=== New connection ===---'.green);
	broadcast('---=== New connection ===---');
	var http = require('http');
	var client = new net.Socket();
	
	client.connect(8080,'transcard.4rp.org');
	//client.pipe(http);
	
	socket.pipe(client);
	socket.on('data', msg => {
		console.log('--- REQUEST ---'.green);
		console.log(msg.toString('utf8'));
		broadcast('--- REQUEST ---');
		broadcast(msg.toString('utf8'));
	});
	client.pipe(socket);
	client.on('data', msg => {
		console.log('--- RESPONSE ---'.green);
		console.log(msg.toString('utf8'));
		broadcast('--- RESPONSE ---');
		broadcast(msg.toString('utf8'));
	});
	
	client.on('error', (e) => {
		console.log(('Socked error: ' + e));
		socket.end();
	});
	
	socket.on('close', () => {
		console.log('---=== Client connection closed ===---'.green);
		broadcast('---=== Client connection closed ===---');
		client.end();
	})
});


server.on('error', (e) => {
	console.log('Conn err: ' +e);
});

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...".lightblue);
});

server.listen(8082, '192.168.0.10');
console.log('Listening on 8082');

var peers = [];
var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({port: 9000});
	
wss.on('connection', function (ws) {
	console.log('New WS connection');
	peers.push(ws);
	ws.on ('close', function () {
		peers.splice(peers.indexOf(ws), 1);
	});
});

function broadcast (message) {
	peers.forEach (function (ws, i) {
		try{
			ws.send (JSON.stringify ({
				type: 'message',
				message: message
			}));			
		} catch(e) {
			peers.splice(i, 1);
			console.log(e);
		}
	});
}
	
console.log('Listening websocket on 9000');
