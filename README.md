# mmir-plugin-tts-speakjs

Cordova plugin for the MMIR framework that adds Text To Speech (TTS) synthesis via `speak.js` library

## TODO

* options/parameters
  * amplitude
  * pitch
  * speed
  * word gap
  
* add fallback for non-WebWorker env
* support error handler
* support cancel? (i.e. during generation)
* compile version with more languages? en, fr, de, spa, rus ...?

## speak.js

The plugin uses the `speak.js` library (License GPL-3.0, see [resources/license-speakjs.txt][1]): 
[github.com/logue/speak.js][2].

`speak.js` is compiled from [eSpeak][3] to javascript using `emscripten`.


[1]: resources/license-speakjs.txt
[2]: https://github.com/logue/speak.js
[3]: https://sourceforge.net/projects/espeak/
