
if(typeof WEBPACK_BUILD !== 'undefined' && WEBPACK_BUILD){
	/*
	 * based on speakWorker.js from:
	 *
	 * speak.js
	 * https://github.com/logue/speak.js
	 * License: GPL-3.0
	 */
	require('../speakGenerator.js');
} else {
	/*
	 * based on speakWorker.js from:
	 *
	 * speak.js
	 * https://github.com/logue/speak.js
	 * License: GPL-3.0
	 */
	importScripts('speakGenerator.js');
}

;(function(global){

global.onmessage = function(event) {

	var msg = event.data;
	var id = msg.id;

	try {
		var audioData = global.generateSpeech(msg.text, msg.options)
		global.postMessage({id: id, data: audioData});
	} catch(ex){
		global.postMessage({id: id, error: true, message: ex.stack? ex.stack : ex.toString()});
	}

};

})(typeof window !== 'undefined'? window : typeof self !== 'undefined'? self : typeof global !== 'undefined'? global : this);
