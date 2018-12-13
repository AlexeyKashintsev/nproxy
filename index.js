//Локальный порт
const LOCAL_PORT = 8000;
//Настройка мониторинга
const USE_CONSOLE = true;
const USE_WS = true;
const WS_PORT = 9000;
//Настройки проксирования
const options = {
	target : 'http://localhost:8080',//<url string to be parsed with the url module>
//	forward: //<url string to be parsed with the url module>
//	agent  : //<object to be passed to http(s).request>
//	ssl    : //<object to be passed to https.createServer()>
//	ws     : //<true/false, if you want to proxy websockets>
//	xfwd   : //<true/false, adds x-forward headers>
//	secure : //<true/false, verify SSL certificate>
//	toProxy: //<true/false, explicitly specify if we are proxying to another proxy>
//	prependPath: //<true/false, Default: true - specify whether you want to prepend the target's path to the proxy path>
//	ignorePath: //<true/false, Default: false - specify whether you want to ignore the proxy path of the incoming request>
//	localAddress : //<Local interface string to bind for outgoing connections>
//	changeOrigin: //<true/false, Default: false - changes the origin of the host header to the target URL>
//	preserveHeaderKeyCase: //<true/false, Default: false - specify whether you want to keep letter case of response header key >
//	auth   : //Basic authentication i.e. 'user:password' to compute an Authorization header.
//	hostRewrite: //rewrites the location hostname on (301/302/307/308) redirects, Default: null.
	autoRewrite: true//rewrites the location host/port on (301/302/307/308) redirects based on requested host/port. Default: false.
//	protocolRewrite: //rewrites the location protocol on (301/302/307/308) redirects to 'http' or 'https'. Default: null.
}

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer(options);
console.log("listening on port " + LOCAL_PORT);
proxy.listen(LOCAL_PORT);

var broadcast = function() {};

//
// Listen for the `open` event on `proxy`.
//
proxy.on('open', function (proxySocket) {
  // listen for messages coming FROM the target here
	if (USE_CONSOLE)
		console.log('New proxy connection');
	debugger
	proxySocket.on('data', (sd, req, res) => {
		debugger
		console.log(sd);
	});
});

proxy.on('proxyReq', function (proxyReq, req, res) {
	var msg = '--- REQUEST ---\nMethod: ' + proxyReq.method + '\nPath: ' + proxyReq.path
		+ (proxyReq._headers ? '\nHeaders: ' + JSON.stringify(proxyReq._headers) : '');
	if (USE_CONSOLE) {
		console.log(msg);
	}
	if (USE_WS) {
		broadcast(msg);
	}
	
	req.on('data', chunk => {
		var body = chunk.toString('utf8')
		if (USE_CONSOLE)
			console.log('Body: ' + body);
		if (USE_WS)
			broadcast('Body: ' + body);
	});
})

//
// Listen for the `proxyRes` event on `proxy`.
//
proxy.on('proxyRes', function (proxyRes, req, res) {
  //console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
	var msg = '--- RESPONSE ---\nHeaders: ' + JSON.stringify(proxyRes.headers);
	if (USE_CONSOLE) {
		console.log(msg);
	}
	if (USE_WS) {
		broadcast(msg);
	}
	proxyRes.on('data', chunk => {
		var body = chunk.toString('utf8')
		if (USE_CONSOLE)
			console.log('Body: ' + body);
		if (USE_WS)
			broadcast('Body: ' + body);
	});
});

if (USE_WS) {
	const WebSocket = require('ws');
 
	const wss = new WebSocket.Server({ port: WS_PORT });
	
	broadcast = function(data) {
		wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data);
			}
		});
	};
}