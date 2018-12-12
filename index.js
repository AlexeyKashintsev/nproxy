var net = require('net');
const colors = require("colors");

//Настройка входящего подключения
const LOCAL_IP = '192.168.0.110';
const LOCAL_PORT = 8084;
//Настройка прокси
const REMOTE_ADR = 'localhost';
const REMOTE_PORT = 8080;
//Настройка мониторинга
const USE_CONSOLE = false;
const USE_WS = true;
const WS_PORT = 9000;

var server = net.createServer(function(socket) {
	//socket.write();
	
});

server.on('connection', socket => {
	if (USE_CONSOLE)
		console.log('\n---=== New connection ===---'.green);
	var http = require('http');
	var client = new net.Socket();
	
	client.connect(REMOTE_PORT, REMOTE_ADR);
	//client.pipe(http);
	
	socket.pipe(client);
	socket.on('data', msg => {
		if (USE_CONSOLE) {
			console.log('--- REQUEST ---'.green);
			console.log(msg.toString('utf8'));
		}
		if (USE_WS) {
			broadcast('--- REQUEST ---');
			broadcast(msg.toString('utf8'));
		}

	});
	client.pipe(socket);
	client.on('data', msg => {
		if (USE_CONSOLE) {
			console.log('--- RESPONSE ---'.green);
			console.log(msg.toString('utf8'));
		}
		if (USE_WS) {
			broadcast('--- RESPONSE ---');
			broadcast(msg.toString('utf8'));
		}
	});
	
	client.on('error', (e) => {
		if (USE_CONSOLE)
			console.log(('Socked error: ' + e));
		socket.end();
	});
	
	socket.on('close', () => {
		if (USE_CONSOLE)
			console.log('---=== Client connection closed ===---'.green);
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

server.listen(LOCAL_PORT, LOCAL_IP);
console.log('Listening on ' + LOCAL_IP + ':' + LOCAL_PORT);

if (USE_WS) {
	var peers = [];
	var WebSocketServer = require('ws').Server,
		wss = new WebSocketServer({port: WS_PORT});
		
	wss.on('connection', function (ws) {
		console.log('New WS connection');
		peers.push(ws);
		ws.on ('close', function () {
			peers.exterminate(ws);
		});
	});

	function broadcast (message) {
		peers.forEach (function (ws) {
			ws.send (JSON.stringify ({
				type: 'message',
				message: message
			}));
		});
	}
		
	console.log('Listening websocket on ' + WS_PORT);
}
