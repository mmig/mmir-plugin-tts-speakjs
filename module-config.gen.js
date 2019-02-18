
/*********************************************************************
 * This file is automatically generated by mmir-plugins-export tools *
 *         Do not modify: ANY CHANGES WILL GET DISCARED              *
 *********************************************************************/

module.exports = {
  pluginName: "ttsSpeakjs",
  config: [
    /** OPTIONAL
     * [custom option]
     * NUMBER Additional gap between words in 10 ms units, i.e. `1` corresponds to a 10 ms duration
     * @default 0
     */
    "wordgap",
    /** OPTIONAL
     * [custom option]
     * The speed at which to talk (words per minute)
     * @default 175
     */
    "speed",
    /** OPTIONAL
     * [custom option]
     * The voice pitch
     * @default 50
     */
    "pitch",
    /** OPTIONAL
     * [custom option]
     * How loud the voice will be
     * @default 100
     */
    "amplitude",
    /** OPTIONAL
     * @see #language
     * @default "en-us" */
    "voice",
    /** OPTIONAL
     * @see #voice
     * @default "en-us" */
    "language"
  ]
};
