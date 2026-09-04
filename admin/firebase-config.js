/**
 * Newon HQ — Firebase Web App public config (newon-hq).
 *
 * Fill empty fields from Firebase Console → Project settings → Your apps → Web app "Newon HQ".
 * Do NOT put service accounts, private keys, or Admin SDK credentials here.
 *
 * Public web config is safe to ship in frontend; security is Auth + Firestore Rules.
 */
(function (global) {
  "use strict";

  /** @type {Record<string, string>} */
  var config = {
    apiKey: "",
    authDomain: "newon-hq.firebaseapp.com",
    projectId: "newon-hq",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  };

  var required = ["apiKey", "authDomain", "projectId", "appId"];

  function missingKeys() {
    return required.filter(function (k) {
      return !config[k] || !String(config[k]).trim();
    });
  }

  global.NEWON_HQ_FIREBASE = {
    config: config,
    isConfigured: function () {
      return missingKeys().length === 0;
    },
    missingKeys: missingKeys,
  };
})(typeof window !== "undefined" ? window : globalThis);
