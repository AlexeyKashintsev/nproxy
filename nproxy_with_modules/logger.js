const fs = require('fs');

class myLogger{
	constructor (params, wss) {
		this._params = params;
		this._wss = wss;
	}
	log (data) {
		if (this._params.console) {
			console.log(data);
		}
		if (this._params.file) {

			let today = new Date();
			let dd = String(today.getDate()).padStart(2, '0');
			let mm = String(today.getMonth() + 1).padStart(2, '0');
			let yyyy = today.getFullYear();

			today = dd + '_' + mm + '_' + yyyy + '_';

			if (fs.existsSync(this._params.name)) {
				fs.appendFileSync('./' + this._params.name + '/' + today + this._params.log_file, data);
			} else {
				fs.mkdirSync(this._params.name);
				fs.appendFileSync('./' + this._params.name + '/' + today + this._params.log_file, data);
			}
		}
		if (this._params.ws_console) {
			this._wss.clients.forEach(function each(client) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(data);
				}
			});
		}
	}
}

module.exports = myLogger;