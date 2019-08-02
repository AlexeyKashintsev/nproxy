const WebSocket = require('ws');
const fs = require('fs');
const myLogger = require("./logger.js");
const Proxy = require("./proxy.js");

class Configurator{
	constructor(){

		let opt = require('node-getopt').create([
			['f' , '='                    , 'filename'],
			[''  , 'no-comment'],
			['h' , 'help'                , 'display this help']
		])
			.bindHelp()
			.parseSystem(); // parse command line



		let rawdata = fs.readFileSync(opt.options.f);
		let params = JSON.parse(rawdata);


		this._logger;

		this._proxys;

		for (let i = 0; i< params.length; i++) {
			let wss = new WebSocket.Server({port : params[i].ws});
			this._logger = new myLogger();
			this._proxys = [new Proxy(new myLogger(params[i], wss), params[i])];
		}
	}
	get_proxy(){
		return this._proxys;
	}
}
module.exports = Configurator;