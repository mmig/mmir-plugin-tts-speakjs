
/* plugin config definition: used by mmir-plugin-exports to generate module-config.gen.js */

import { MediaManagerPluginEntry, SpeechConfigPluginEntry } from 'mmir-lib';

/**
 * (optional) entry "ttsSpeakjs" in main configuration.json
 * for settings of ttsSpeakjs module.
 *
 * Some of these settings can also be specified by using the options argument
 * in the TTS functions of {@link MediaManagerWebInput}, e.g.
 * {@link MediaManagerWebInput#recognize} or {@link MediaManagerWebInput#startRecord}
 * (if specified via the options, values will override configuration settings).
 */
export interface PluginConfig {
  ttsSpeakjs?: PluginConfigEntry | PluginSpeechConfigEntry;
}

export interface PluginSpeechConfigEntry extends SpeechConfigPluginEntry {
  /** OPTIONAL
   * @see #voice */
  language?: 'en-us' | 'de'; // TODO support more languages?
  /** OPTIONAL
   * NOTE there is only one voice per language, so voice and language are synonymous
   * @see #language */
  voice?: 'en-us' | 'de'; // TODO support more languages?
}

export interface PluginConfigEntry extends MediaManagerPluginEntry {

  /** the plugin/module which which will load/use this specific TTS implementation
   * @default mmir-plugin-tts-core-xhr.js
   */
  mod: 'mmir-plugin-tts-core-xhr.js';
  /**
   * the plugin type
   * @default "tts"
   */
  type: 'tts';

  /** OPTIONAL
   * [custom option]
   * How loud the voice will be
   * @default 100
   */
  amplitude?: number;

  /** OPTIONAL
   * [custom option]
   * The voice pitch
   * @default 50
   */
  pitch?: number;

  /** OPTIONAL
   * [custom option]
   * The speed at which to talk (words per minute)
   * @default 175
   */
  speed?: number;

  /** OPTIONAL
   * [custom option]
   * NUMBER Additional gap between words in 10 ms units, i.e. `1` corresponds to a 10 ms duration
   * @default 0
   */
  wordgap?: number;
}
