/**
 * OX MONTH Web — product Firebase (newon-oxmonth) client config.
 *
 * NEVER use HQ (newon-hq) here.
 * NEVER put service-account / private keys in this file.
 *
 * Client-side Web firebaseConfig only (no service account).
 */
(function (global) {
  "use strict";

  var config = {
    apiKey: "AIzaSyBAQK17T1l9bRmrJa9f_i1pU12Ib2gvRNY",
    authDomain: "newon-oxmonth.firebaseapp.com",
    projectId: "newon-oxmonth",
    storageBucket: "newon-oxmonth.firebasestorage.app",
    messagingSenderId: "18017911133",
    appId: "1:18017911133:web:0ba6a268ba2484e1a1a8b4",
  };

  /** True only when Web apiKey + Web appId are filled for newon-oxmonth. */
  function isConfigured() {
    return Boolean(
      config.apiKey &&
        config.appId &&
        config.projectId === "newon-oxmonth" &&
        String(config.appId).includes(":web:") &&
        !String(config.appId).includes(":android:") &&
        !String(config.appId).includes(":ios:"),
    );
  }

  global.OX_MONTH_FIREBASE = config;
  global.OX_MONTH_FIREBASE_IS_CONFIGURED = isConfigured;
})(typeof window !== "undefined" ? window : globalThis);
