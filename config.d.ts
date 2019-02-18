
import { MediaManagerPluginEntry } from 'mmir-lib';

/**
 * (optional) entry "asrNuanceXhr" in main configuration.json
 * for settings of webasrNuanceImpl module.
 *
 * Some of these settings can also be specified by using the options argument
 * in the ASR functions of {@link MediaManagerWebInput}, e.g.
 * {@link MediaManagerWebInput#recognize} or {@link MediaManagerWebInput#startRecord}
 * (if specified via the options, values will override configuration settings).
 */
export interface TTSSpeakJSConfigEntry {
  ttsSpeakjs?: TTSSpeakJSConfig;
}


// `voice` (or `language`): STRING one of `'en-us'` | `'de'` (DEFAULT: `'en-us'`)
//
// and non-standard options:
//
// `amplitude`: NUMBER How loud the voice will be (DEFAULT: 100)
// `pitch`: NUMBER The voice pitch (DEFAULT: 50)
// `speed`: NUMBER The speed at which to talk (words per minute) (DEFAULT: 175)
// `wordgap`: NUMBER Additional gap between words in 10 ms units, i.e. `1` corresponds to a 10 ms duration (DEFAULT: 0)


export interface TTSSpeakJSConfig extends MediaManagerPluginEntry {
  /** OPTIONAL
   * @see #voice
   * @default "en-us" */
  language?: 'en-us' | 'de'; // TODO support more languages?
  /** OPTIONAL
   * @see #language
   * @default "en-us" */
  voice?: 'en-us' | 'de'; // TODO support more languages?

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
