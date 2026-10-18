/* BABYLOG corporate site — progressive enhancement only.
 * Reveals the Contact page e-mail copy button (hidden without JS) and copies the address on click. */
(function () {
  var btns = document.querySelectorAll("#lifestage-detail[data-story='babylog'] [data-bl-copy]");
  if (!btns.length || !navigator.clipboard) return;
  Array.prototype.forEach.call(btns, function (b) {
    var label = b.textContent;
    b.hidden = false;
    b.addEventListener("click", function () {
      navigator.clipboard.writeText(b.getAttribute("data-bl-copy")).then(function () {
        b.textContent = b.getAttribute("data-bl-copied") || label;
        b.setAttribute("aria-live", "polite");
        setTimeout(function () { b.textContent = label; }, 2000);
      });
    });
  });
})();
