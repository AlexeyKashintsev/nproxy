let nodePath = process.argv[0];
let appPath = process.argv[1];
let arr = [];
//Локальный порт
arr[0] = process.argv[2]; // = 8000;
//Настройка мониторинга
/*arr[1] = process.argv[3];
arr[2] = process.argv[4];
arr[3] = process.argv[5];*/



//help
/*Getopt = require('node-getopt');

getopt = new Getopt([
	['f' , ''                    , 'name opened file']
]);

// Use custom help template instead of default help
// [[OPTIONS]] is the placeholder for options list
getopt.setHelp("[[OPTIONS]]");

if (~arr[0].indexOf("help")) {getopt.showHelp();}
*/


//парсим json конфигурацию
const fs = require('fs');
let rawdata = fs.readFileSync('conf.json');
let params = JSON.parse(rawdata);

/*
process.argv.map(a => console.log(a));
//Настройки проксирования
let options = {
	target : 'http://ispu.ru',//<url string to be parsed with the url module>
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
}*/

/*
let LOCAL_PORT;
let params[i].console;
let params[i].wsconsole;
let WS_PORT;


process.argv.map(a => {
		let t = /\w/;
		let p = a.split('=');
		switch (p[0]) {
			case 'p':
				LOCAL_PORT = p[1];
				console.log(LOCAL_PORT);
				break;
			case 'c':
				//let uct = /\bTrue\b/i;
				//let uc = arr1[i].match(uct);
				if ((p[1] == 'True') || (p[1] == 'true') ) {
					params[i].console = true;
				} else {params[i].console = false;}
				break;
			case 'ws':
				//let uwst = /\bTrue\b/i;
				//let uws = arr1[i].match(uwst);
				if ((p[1] == 'True') || (p[1] == 'true') ) {
					params[i].wsconsole = true;
				} else {params[i].wsconsole = false;}
				break;
			case 'wp':
				WS_PORT = p[1];
				break;
		}
});
*/
let i = 0;
while (i < params.length) {

	let httpProxy = require('http-proxy');
	let proxy = httpProxy.createProxyServer(params[i].options);
	console.log("listening on port " + params[i].port);
	proxy.listen(params[i].port);

	let broadcast = function () {
	};

//
// Listen for the `open` event on `proxy`.
//
	proxy.on('open', function (proxySocket) {
		// listen for messages coming FROM the target here
		if (params[i].console)
			console.log('New proxy connection');
		debugger
		proxySocket.on('data', (sd, req, res) => {
			debugger
			console.log(sd);
		});
	});

	proxy.on('proxyReq', function (proxyReq, req, res) {
		let msg = '--- REQUEST ---\nMethod: ' + proxyReq.method + '\nPath: ' + proxyReq.path
			+ (proxyReq._headers ? '\nHeaders: ' + JSON.stringify(proxyReq._headers) : '');
		if (params[i].console) {
			console.log(msg);
		}
		if (params[i].wsconsole) {
			broadcast(msg);
		}

		req.on('data', chunk => {
			let body = chunk.toString('utf8');
			if (params[i].console)
				console.log('Body: ' + body);
			if (params[i].wsconsole)
				broadcast('Body: ' + body);
		});
	});

//
// Listen for the `proxyRes` event on `proxy`.
//
	proxy.on('proxyRes', function (proxyRes, req, res) {
		//console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
		let msg = '--- RESPONSE ---\nHeaders: ' + JSON.stringify(proxyRes.headers);
		if (params[i].console) {
			console.log(msg);
		}
		if (params[i].wsconsole) {
			broadcast(msg);
		}
		proxyRes.on('data', chunk => {
			let body = chunk.toString('utf8');
			if (params[i].console)
				console.log('Body: ' + body);
			if (params[i].wsconsole)
				broadcast('Body: ' + body);
		});
	});

	/*
	if (params[i].wsconsole) {
		const WebSocket = require('ws');

		const wss = new WebSocket.Server(params[i].ws);

		broadcast = function (data) {
			wss.clients.forEach(function each(client) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(data);
				}
			});
		};
	} */

	process.on('uncaughtException', (err) => {
		console.log(1, `Caught exception: ${err}`);
	});

	i++;
}