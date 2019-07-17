// examples/help.js
// Works with help
opt = require('node-getopt').create([
	['s' , ''                    , 'short option.'],
	[''  , 'long'                , 'long option.'],
	['S' , 'short-with-arg=ARG'  , 'option with argument', 'S'],
	['L' , 'long-with-arg=ARG'   , 'long option with argument'],
	[''  , 'color[=COLOR]'       , 'COLOR is optional'],
	['m' , 'multi-with-arg=ARG+' , 'multiple option with argument'],
	[''  , 'no-comment'],
	['h' , 'help'                , 'display this help'],
	['v' , 'version'             , 'show version']
])
	.bindHelp()
	.parseSystem(); // parse command line

/*if(argv.length == 0){
	console.log("Error");
	return;
}
if(opt.s){

}
if(opt.f){

}
*/

//console.info({argv: opt.argv, options: opt.options});
//console.log(opt);
