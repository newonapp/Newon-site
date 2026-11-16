/* Portfolio (ko): highlights accordion + email copy (contact-page behaviour, scoped to [data-pf-page]). */
(function () {
  "use strict";
  var page = document.querySelector("[data-pf-page]");
  if (!page) return;

  Array.prototype.forEach.call(page.querySelectorAll(".ct-faq__btn"), function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      panel.hidden = open;
    });
  });

  Array.prototype.forEach.call(page.querySelectorAll("[data-pf-copy]"), function (btn) {
    var status = btn.parentNode ? btn.parentNode.querySelector("[data-pf-copy-status]") : null;
    function say(msg) {
      if (!status) return;
      status.textContent = "";
      setTimeout(function () { status.textContent = msg; }, 30);
    }
    function legacy(text) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch (e) {
        return false;
      }
    }
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-pf-copy");
      var done = function (ok) { say(ok ? "이메일을 복사했습니다." : "복사하지 못했습니다. 직접 선택해 주세요."); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(legacy(text)); });
      } else {
        done(legacy(text));
      }
    });
  });
})();
