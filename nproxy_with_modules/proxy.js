const HttpProxy = require('http-proxy');

class Proxy {
	constructor(logger, params) {
		this._logger = logger;
		this._proxy = HttpProxy.createProxyServer(params.options);

		console.log('New proxy connection : ' + params.name + ' localhost : ' + params.port);
		let self = this;

		this._proxy.on('open', function (proxySocket) {
			// listen for messages coming FROM the target here
			self._logger.log('New proxy connection : ' + params.name + ' localhost : ' + params.port);
		debugger;
			proxySocket.on('data', (sd, req, res) => {
			debugger;
				console.log(sd);
			});
		});

		this._proxy.on('proxyReq', function (proxyReq, req, res) {
			let msg = '--- REQUEST ---\nMethod: ' + proxyReq.method + '\nPath: ' + proxyReq.path
				+ (proxyReq._headers ? '\nHeaders: ' + JSON.stringify(proxyReq._headers) : '');
			self._logger.log(msg);

			req.on('data', chunk => {
				let body = chunk.toString('utf8');
				self._logger.log('Body: ' + body);
			});
		});

		this._proxy.on('proxyRes', function (proxyRes, req, res) {
			let msg = '--- RESPONSE ---\nHeaders: ' + JSON.stringify(proxyRes.headers);
			self._logger.log(msg);
			proxyRes.on('data', chunk => {
				let body = chunk.toString('utf8');
				self._logger.log('Body: ' + body);
			});
		});

		this._proxy.listen(params.port);
	}
}
module.exports = Proxy;