const Configurator = require("./configurator.js");

class Programm{
	constructor(){
		this._configurator = new Configurator();
		this._proxys = this._configurator.get_proxy();
	}
}

new Programm();