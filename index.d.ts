
export * from './config';

/// <reference types="mmir-lib" />
import { TTSOnError, TTSOnComplete, TTSOnReady, MediaManager, TTSOptions } from 'mmir-lib';

declare interface ASRNuanceXHROptions extends TTSOptions {
  /**
   * [supported option]
   * set language/country for ASR
   */
  language?: 'en-us' | 'de';

  /** [supported option]
   * NOTE this is the same as setting `language`, i.e. there is
   *      only one voice per language; for variation use custom options
   * @see #language
   * @default "en-us" */
  voice?: 'en-us' | 'de'; // TODO support more languages?

  /**
   * [custom option]
   * How loud the voice will be
   * @default 100
   */
  amplitude?: number;

  /**
   * [custom option]
   * The voice pitch
   * @default 50
   */
  pitch?: number;

  /**
   * [custom option]
   * The speed at which to talk (words per minute)
   * @default 175
   */
  speed?: number;

  /**
   * [custom option]
   * NUMBER Additional gap between words in 10 ms units, i.e. `1` corresponds to a 10 ms duration
   * @default 0
   */
  wordgap?: number;
}

declare interface MediaManagerTTSSpeakJS extends MediaManager {
  tts: (options: string | string[] | TTSOptions, successCallback?: TTSOnComplete, failureCallback?: TTSOnError, onInit?: TTSOnReady, ...args: any[]) => void;
}
