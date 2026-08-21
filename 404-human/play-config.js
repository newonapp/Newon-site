/**
 * 404: HUMAN — project / play config
 *
 * PLAY_GAME_URL: set to the live Flutter Web URL when ready.
 * STATUS: "IN DEVELOPMENT" | "RELEASED" (shown in hero meta)
 * SHOWCASE: add image paths to reveal the GAMEPLAY PREVIEW section
 */
window.NEWON_404_HUMAN_PLAY = {
  /** @type {string} e.g. "https://play.newon.app/404-human/" */
  PLAY_GAME_URL: "",

  /** @type {"IN DEVELOPMENT" | "RELEASED"} */
  STATUS: "IN DEVELOPMENT",

  /**
   * Gameplay preview shots — leave empty to keep the section hidden.
   * When all three have a non-empty `src`, the section becomes visible.
   * @type {{ id: string, src: string, alt: string, caption: string }[]}
   */
  SHOWCASE: [
    { id: "interrogation", src: "", alt: "AI interrogation screen", caption: "01 / INTERROGATION" },
    { id: "detection", src: "", alt: "HUMAN DETECTION meter screen", caption: "02 / DETECTION" },
    { id: "escape", src: "", alt: "Escape sector screen", caption: "03 / ESCAPE" },
  ],
};
