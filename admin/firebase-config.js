/**
 * Newon HQ — Firebase Web App public config (newon-hq).
 * Public web config only. No service accounts, private keys, or Admin SDK.
 */
(function (global) {
  "use strict";

  /** @type {Record<string, string>} */
  var config = {
    apiKey: "AIzaSyD1kLxjKMJGgQwMFUgug6rAcdlvkyt4U7k",
    authDomain: "newon-hq.firebaseapp.com",
    projectId: "newon-hq",
    storageBucket: "newon-hq.firebasestorage.app",
    messagingSenderId: "227188651506",
    appId: "1:227188651506:web:bc89feb7e8154a34c4676b",
    measurementId: "G-4Y8WN7PQKX",
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
