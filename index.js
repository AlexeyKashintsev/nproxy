const HttpProxy = require('http-proxy');
const fs = require('fs');
const WebSocket = require('ws');

class myLogger{
	constructor () {

	}
	log (params, wss, data) {
		if (params.console) {
			console.log(data);
		}
		if (params.file) {

			let today = new Date();
			let dd = String(today.getDate()).padStart(2, '0');
			let mm = String(today.getMonth() + 1).padStart(2, '0');
			let yyyy = today.getFullYear();

			today = dd + '_' + mm + '_' + yyyy + '_';

			if (fs.existsSync(params.name)) {
				fs.appendFileSync('./' + params.name + '/' + today + params.log_file, data);
			} else {
				fs.mkdirSync(params.name);
				fs.appendFileSync('./' + params.name + '/' + today + params.log_file, data);
			}
		}
		if (params.ws_console) {
			wss.clients.forEach(function each(client) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(data);
				}
			});
		}
	}
}
class Сonfigurator{
	constructor(logger){

		let opt = require('node-getopt').create([
			['f' , '='                    , 'filename'],
			[''  , 'no-comment'],
			['h' , 'help'                , 'display this help']
		])
			.bindHelp()
			.parseSystem(); // parse command line



		let rawdata = fs.readFileSync(opt.options.f);
		let params = JSON.parse(rawdata);


		this._logger = logger;

		this._proxys;

		for (let i = 0; i< params.length; i++) {
			this._proxys = [new Proxy(this._logger, params[i])];
		}
	}
	get_proxy(){
		return this._proxys;
	}
}
class Proxy {
	constructor(logger, params) {
		this._logger = logger;
		this._proxy = HttpProxy.createProxyServer(params.options);
		let wss = new WebSocket.Server({port : params.ws});
		console.log('New proxy connection : ' + params.name + ' localhost : ' + params.port);
		let self = this;

		this._proxy.on('open', function (proxySocket) {
			// listen for messages coming FROM the target here
			self._logger.log(params, wss, 'New proxy connection : ' + params.name + ' localhost : ' + params.port);
		debugger;
			proxySocket.on('data', (sd, req, res) => {
			debugger;
				console.log(sd);
			});
		});

		this._proxy.on('proxyReq', function (proxyReq, req, res) {
			let msg = '--- REQUEST ---\nMethod: ' + proxyReq.method + '\nPath: ' + proxyReq.path
				+ (proxyReq._headers ? '\nHeaders: ' + JSON.stringify(proxyReq._headers) : '');
			self._logger.log(params, wss, msg);

			req.on('data', chunk => {
				let body = chunk.toString('utf8');
				self._logger.log(params, wss,'Body: ' + body);
			});
		});

		this._proxy.on('proxyRes', function (proxyRes, req, res) {
			let msg = '--- RESPONSE ---\nHeaders: ' + JSON.stringify(proxyRes.headers);
			self._logger.log(params, wss, msg);
			proxyRes.on('data', chunk => {
				let body = chunk.toString('utf8');
				self._logger.log(params, wss,'Body: ' + body);
			});
		});

		this._proxy.listen(params.port);
	}
}
class Programm{
	constructor(){

		this._logger = new myLogger();
		this._configurator = new Сonfigurator(this._logger);
		this._proxys = this._configurator.get_proxy();
	}
}

new Programm();