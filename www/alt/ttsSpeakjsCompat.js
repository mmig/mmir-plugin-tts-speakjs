;(function (root, factory) {

	//mmir legacy mode: use pre-v4 API of mmir-lib
	var _isLegacyMode3 = true;// v3 or below
	var _isLegacyMode4 = true;// v4 or below
	var _isLegacyMode6 = true;// v6 or below
	var mmirName = typeof MMIR_CORE_NAME === 'string'? MMIR_CORE_NAME : 'mmir';
	var _mmir = root[mmirName];
	if(_mmir){
		//set legacy-mode if version is < v4, or < v5, or < v7 (isVersion() is available since v4)
		_isLegacyMode3 = _mmir.isVersion? _mmir.isVersion(4, '<') : true;
		_isLegacyMode4 = _mmir.isVersion? _mmir.isVersion(5, '<') : true;
		_isLegacyMode6 = _mmir.isVersion? _mmir.isVersion(7, '<') : true;
	}
	var _req = _mmir? _mmir.require : require;

	var isArray = _req((_isLegacyMode3? '': 'mmirf/') + 'util/isArray');
	var getId;
	if(_isLegacyMode4){
		// HELPER: backwards compatibility v4 for module IDs
		getId = function(ids){
			if(isArray(ids)){
				return ids.map(function(id){ return getId(id);});
			}
			return ids? ids.replace(/\bresources$/, 'constants') : ids;
		};
		var __req = _req;
		_req = function(deps, success, error, completed){
			var args = [getId(deps), success, error, completed];
			return __req.apply(null, args);
		};
	} else if(!_isLegacyMode3) {
		getId = function(ids){ return ids; };
	}

	if(_isLegacyMode3){
		// HELPER: backwards compatibility v3 for module IDs
		var __getId = getId;
		getId = function(ids){
			if(isArray(ids)) return __getId(ids);
			return ids? __getId(ids).replace(/^mmirf\//, '') : ids;
		};
	}

	var extend, replacedMod;
	if(_isLegacyMode6) {
		extend = _req('mmirf/util/extend');
		//upgrage mmir < v7:
		// proxy require calls from within the wrapped module to replaced
		// implementations if necessary (i.e. isolated changed modules)
		replacedMod = {};
		var ___req = _req;
		_req = function(deps, success, error, completed){
			if(typeof deps === 'string' && replacedMod[getId(deps)]) return replacedMod[getId(deps)];
			if(success){
				var _success = success;
				success = function(){
					deps = getId(deps);
					for(var i=deps.length-1; i >= 0; --i){
						if(deps[i]==='require') arguments[i] = _req;
						else if(replacedMod[deps[i]]) arguments[i] = replacedMod[deps[i]];
					}
					_success.apply(null, arguments);
				};
			}
			return ___req.apply(null, [deps, success, error, completed]);
		}
	}

	if(_isLegacyMode3){
		//HELPER: backwards compatibility v3 for configurationManager.get():
		var config = _req('mmirf/configurationManager');
		if(!config.__get){
			config = extend({}, config);
			replacedMod[getId('mmirf/configurationManager')] = config;
			config.__get = config.get;
			config.get = function(propertyName, useSafeAccess, defaultValue){
				return this.__get(propertyName, defaultValue, useSafeAccess);
			};
		}
	}

	if(_isLegacyMode6) {
		//upgrage mmir < v7: add impl. for mediaManager.loadPlugin()
		var mediaManager = _req('mmirf/mediaManager');
		if(!mediaManager.loadPlugin && mediaManager.loadFile){
			mediaManager.loadPlugin = mediaManager.loadFile;
		}
		//patch changed interpretation of 3rd parameter in mmir.config.get(paht, defaultValue, boolean):
		var config = _req('mmirf/configurationManager');
		if(!config.___get){
			config = extend({}, config);
			replacedMod[getId('mmirf/configurationManager')] = config;
			config.___get = config.get;
			config.get = function(name, defaultValue, setDefaultIfUnset){
				var res = this.___get(isArray(name) ? name.slice() : name);
				if(typeof res === 'undefined' && defaultValue !== 'undefined'){
					res = defaultValue;
					if(setDefaultIfUnset){
						this.set(isArray(name) ? name.slice() : name, defaultValue);
					}
				}
				return res;
			};
		}
	}

	if(_isLegacyMode4){

		//backwards compatibility v3 and v4:
		// plugin instance is "exported" to global var newMediaPlugin
		root['newWebAudioTtsImpl'] = factory(_req);

	} else {

		if (typeof define === 'function' && define.amd) {
			// AMD. Register as an anonymous module.
			define(['require'], function (require) {
				//replace with modified require if necessary;
				if(__req) __req = require;
				else if(___req) ___req = require;
				return factory(_req);
			});
		} else if (typeof module === 'object' && module.exports) {
			// Node. Does not work with strict CommonJS, but
			// only CommonJS-like environments that support module.exports,
			// like Node.
			module.exports = factory(_req);
		}
	}

}(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : this, function (require) {

	
/**
 * Media Module: Implementation for Text-To-Speech via speak.js library
 *
 * @requires WebWorkers support
 * @requires typed Arrays supports
 * @requires CSP allowing blob: protocal as media-source, e.g. "media-src blob:" or "default-src blob:"
 *
 */

	
  var mediaManager = require('mmirf/mediaManager');
  var consts = require('mmirf/resources');
  var lang = require('mmirf/languageManager');
  var config = require('mmirf/configurationManager');

  
    var exported = (function(){
      {

		/**  @memberOf SpeakJsWebAudioTTSImpl# */
		var _pluginName = 'ttsSpeakjs';

		/**
		 * separator char for language- / country-code (specific to Nuance language config / codes)
		 *
		 * @memberOf SpeakJsWebAudioTTSImpl#
		 */
		var _langSeparator = '-';

		/**
		 * list of supported languages (and voice-names)
		 * TODO update speakjs library & retrieve from speakjs instead of hardcoding!
		 */
		var _langList = ['de', 'en'];
		/**
		 * details-list of supported voices
		 * TODO update speakjs library & retrieve from speakjs instead of hardcoding!
		 */
		var _voiceList = _langList.map(function(l){
			return {
				name: l,
				language: l,
				gender: 'male'
			};
		});

		/** @memberOf SpeakJsWebAudioTTSImpl# */
		var _getLangParam;
		/** @memberOf SpeakJsWebAudioTTSImpl# */
		var _getVoiceParam;

		/**
		 * HELPER retrieve language setting and apply impl. specific corrections/adjustments
		 * (i.e. deal with Nuance specific quirks for language/country codes)
		 *
		 * @memberOf SpeakJsWebAudioTTSImpl#
		 */
		var _getFixedLang = function(options){

			var locale = _getLangParam(options, _langSeparator);

			return lang.fixLang('speakjs', locale);
		};

		/**  @memberOf SpeakJsWebAudioTTSImpl# */
		var _setNumOpt = function(name, source, target){

			var val = (source && source[name]) || config.get(_pluginName, name);
			if(typeof val === 'string'){
				val = parseFloat(val);
			}
			if(isFinite(val)){
				target[name] = val;
			}

		};

		/** @memberOf SpeakJsWebAudioTTSImpl#
		 * @see mmir.MediaManager#getSpeechLanguages
		 */
		var getLanguageList = function(callback, _onerror){

			if(callback) setTimeout(function(){callback(_langList)}, 0);
		};


		/** @memberOf SpeakJsWebAudioTTSImpl#
		 * @see mmir.MediaManager#getVoices
		 */
		var getVoiceList = function(options, callback, _onerror){

			var lang = options && (options.language || '').replace(/[-_]\w+$/, '');
			var voices = options && options.details? _voiceList : _langList;
			if(callback) setTimeout(function(){callback(!lang? voices : voices.filter(function(v){return v.language? v.language === lang : v === lang;}))}, 0);
		};

		/**  @memberOf SpeakJsWebAudioTTSImpl# */
		var getTTSOptions = function(options){

//			args['amplitude'] ? String(args['amplitude']) : '100',
//		    args['wordgap'] ? String(args['wordgap']) : '0', // wordgap: Additional gap between words in 10 ms units (default: 0)
//		    args['pitch'] ? String(args['pitch']) : '50',
//		    args['speed'] ? String(args['speed']) : '175',
//		    args['voice'] ? String(args['voice']) : 'en-us',

			var opts = {};

			var voice = _getVoiceParam(options);
			if(/^(fe)?male$/i.test(voice)){

				if(voice === 'female' && typeof options.pitch === 'undefined'){
					//FIXME if no pitch is set, try the best to make voice sound more female by setting maximal pitch
					//TODO remove this when speakjs lib supports voices
					options.pitch = 100;
				}

				//auto-correct feature selection: current speakjs lib does not support gender for voices
				voice = void(0);

			}
			if(!voice){
				voice = _getFixedLang(options);
			}
			if(voice){
				opts.voice = voice;
			}

			_setNumOpt('amplitude', options, opts);
			_setNumOpt('wordgap', options, opts);
			_setNumOpt('pitch', options, opts);
			_setNumOpt('speed', options, opts);

			return opts;
		};

		/**  @memberOf SpeakJsWebAudioTTSImpl# */
		var createAudio = function(sentence, options, onend, onerror, oninit){

			var emptyAudio = mediaManager.createEmptyAudio();

			sendRequest(sentence, emptyAudio, getTTSOptions(options), onend, onerror, oninit);

			return emptyAudio;

		};

		/**  @memberOf SpeakJsWebAudioTTSImpl# */
		var sendRequest = function(currSentence, audioObj, options, onend, onerror, oninit){

			/**
			 * Callback that handles the raw, generated WAV data
			 *
			 * @param {Array} data
			 * 				WAV data (incl. header):
			 * 				mono (1 channel), 32bit float, sample rate 22050 Hz
			 */
			var onSuccess = function(data){

				//console.log(oReq.response);

//				audioObj.req = null;

				//do not preceed, if audio was already canceled
				if(!audioObj.isEnabled()){
					return;///////////////// EARLY EXIT //////////////
				}

				var buffer;
				if(data instanceof ArrayBuffer){
					buffer = data;
				} else {
					//convert number-array to binary
					buffer=new ArrayBuffer(data.length);
					new Uint8Array(buffer).set(data);
				}

				var wavBlob = new Blob( [new DataView(buffer)] );

//				Recorder.forceDownload(wavBlob);//debug: trigger download for wav-file

				mediaManager.getWAVAsAudio(wavBlob,
						null,//<- do not need on-created callback, since we already loaded the audio-data at this point
						onend, onerror, oninit,
						audioObj
				);


			};

			var id = '' + (++_idCounter);//FIXME handle overflow!
			var args = {
				id: id,
				text: currSentence,
				options: options
			}

			_pending[id] = {success: onSuccess, error: onerror};

			//TODO add timeout handling -> invokes onerror

			_worker.postMessage(args);
		};

		var _pending = {};
		var _idCounter = 0;

		var workerPath = consts.getWorkerPath() + 'speakWorkerExt.js';
		var _worker = typeof WEBPACK_BUILD !== 'undefined' && WEBPACK_BUILD? require('./webworker/speakWorkerExt.js')() : new Worker(workerPath);
		/**
		 * @memberOf SpeakJsWebAudioTTSImpl.worker
		 */
		_worker.onmessage = function(event) {

			var msg = event.data;
			var id = msg.id;
			var handler, data;

			if(_pending[id]){

				if(msg.error){
					handler = _pending[id].error;
					data = msg.message;
				} else {
					handler = _pending[id].success;
					data = msg.data;
				}

				delete _pending[id];
				handler(data);

			} else {
				mediaManager._log.error('Error: callback for audio ['+id+'] cannot be found!');
			}
	    };

		/**  @memberOf SpeakJsWebAudioTTSImpl# */
		return {
			/**
			 * @public
			 * @memberOf SpeakJsWebAudioTTSImpl.prototype
			 */
			getPluginName: function(){
				return _pluginName;
			},
			/**
			 * @public
			 * @memberOf SpeakJsWebAudioTTSImpl.prototype
			 */
			getCreateAudioFunc: function(){
				return createAudio;
			},
			/**
			 * @public
			 * @memberOf SpeakJsWebAudioTTSImpl.prototype
			 */
			getLanguageListFunc: function(){
				return getLanguageList;
			},
			/**
			 * @public
			 * @memberOf SpeakJsWebAudioTTSImpl.prototype
			 */
			getVoiceListFunc: function(){
				return getVoiceList;
			},
			/**
			 * @public
			 * @memberOf SpeakJsWebAudioTTSImpl.prototype
			 */
			setLangParamFunc: function(getLangParamFunc){
				_getLangParam = getLangParamFunc;
			},
			/**
			 * @public
			 * @memberOf SpeakJsWebAudioTTSImpl.prototype
			 */
			setVoiceParamFunc: function(getVoiceParamFunc){
				_getVoiceParam = getVoiceParamFunc;
			}
		};//END: return { ...

}
    })();
    
    // already set var(s): exported
    if(typeof exported === 'function'){
      var expArgsLen = exported.length;
      if(expArgsLen > 0){

        if(expArgsLen > 1){
          console.warn('unknown plugin factory function parameters: expected 0 to 1 parameters, but got ' + expArgsLen);
        }
        exported = exported(require('mmirf/logger').create());

      } else {
        exported = exported();
      }
    }

    return exported;
;


	//END: define(...


}));
