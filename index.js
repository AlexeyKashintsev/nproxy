const HttpProxy = require('http-proxy');
const fs = require('fs');

class myLogger{
	constructor () {

	}
	console_log(msg){
		console.log(msg);
	}
	file_log (directory, log_file, data) {
		let today = new Date();
		let dd = String(today.getDate()).padStart(2, '0');
		let mm = String(today.getMonth() + 1).padStart(2, '0');
		let yyyy = today.getFullYear();

		today = dd + '_' + mm + '_' + yyyy + '_';

		if (fs.existsSync(directory)) {
			fs.appendFileSync('./'+directory+'/'+ today + log_file, data);
		} else {
			fs.mkdirSync(directory);
			fs.appendFileSync('./'+directory+'/'+ today + log_file, data);
		}
	}
}
class Сonfigurator{
	constructor(logger){

		let opt = require('node-getopt').create([
			['f' , '='                    , 'filename.'],
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
		console.log('New proxy connection : ' + params.name + ' localhost : ' + params.port);
		let self = this;
		this._proxy.on('open', function (proxySocket) {
			// listen for messages coming FROM the target here

			if (params.console){
				self._logger.console_log('New proxy connection' + params.port);
			}
			else {
				self._logger.file_log(params.logfile, 'New proxy connection' + params.name);
			}
		debugger;
			proxySocket.on('data', (sd, req, res) => {
			debugger;
				self._logger.console_log(sd);
			});
		});

		//this.broadcast = function () {
		//};

		this._proxy.on('proxyReq', function (proxyReq, req, res) {
			let msg = '--- REQUEST ---\nMethod: ' + proxyReq.method + '\nPath: ' + proxyReq.path
				+ (proxyReq._headers ? '\nHeaders: ' + JSON.stringify(proxyReq._headers) : '');
			if (params.console) {
				console.log(this._logger);
				self._logger.console_log(msg);
			} else {
				self._logger.file_log(params.name,params.logfile, msg);
			}
			if (params.ws_console) {
				//this.broadcast(msg);
			}

			req.on('data', chunk => {
				let body = chunk.toString('utf8');
				if (params.console) {
					self._logger.console_log('Body: ' + body);
				} else {
					self._logger.file_log(params.name,params.logfile, 'Body: ' + body);
				}
				if (params.ws_console) {
					//this.broadcast('Body: ' + body);
				}
			});
		});
		this._proxy.on('proxyRes', function (proxyRes, req, res) {
			let msg = '--- RESPONSE ---\nHeaders: ' + JSON.stringify(proxyRes.headers);
			if (params.console) {
				self._logger.console_log(msg);
			} else {
				self._logger.file_log(params.name,params.logfile, msg);
			}
			if (params.ws_console) {
				//this.broadcast(msg);
			}
			proxyRes.on('data', chunk => {
				let body = chunk.toString('utf8');
				if (params.console) {
					self._logger.console_log('Body: ' + body);
				} else {
					self._logger.file_log(params.name,params.logfile, 'Body: ' + body);
				}
				if (params.ws_console) {
					//this.broadcast('Body: ' + body);
				}
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