/* T.C. Philathlos – kleine Helfer, ohne Bibliotheken */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* Fehlende Bilder ausblenden statt kaputte Symbole zu zeigen */
  document.querySelectorAll("img").forEach(function (img) {
    var fehlt = function () {
      img.classList.add("fehlt");
      var e = img.closest(".galerie li");
      if (e) { e.dataset.fehlt = "1"; e.hidden = true; }
    };
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fehlt();
    img.addEventListener("error", fehlt);
  });

  /* Mobiles Menü */
  var knopf = document.querySelector(".menue-knopf");
  function menue(offen) {
    document.body.classList.toggle("menue-offen", offen);
    knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    knopf.querySelector(".menue-knopf__text").textContent = offen ? "Schließen" : "Menü";
  }
  if (knopf) {
    knopf.addEventListener("click", function () { menue(knopf.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menue-offen")) { menue(false); knopf.focus(); }
    });
    window.matchMedia("(min-width: 60.01rem)").addEventListener("change", function (m) { if (m.matches) menue(false); });
  }

  /* Jahr in der Fußzeile */
  document.querySelectorAll("[data-jahr]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Galerie: Alben */
  var galerie = document.querySelector(".galerie");
  var albumKnoepfe = document.querySelectorAll("[data-album-wahl]");
  function zeigeAlbum(album) {
    albumKnoepfe.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.albumWahl === album ? "true" : "false"); });
    galerie.querySelectorAll("li").forEach(function (e) {
      e.hidden = e.dataset.fehlt === "1" || (album !== "alle" && e.dataset.album !== album);
    });
    var titel = document.querySelector("[data-album-titel]");
    var gewaehlt = document.querySelector('[data-album-wahl="' + album + '"]');
    if (titel && gewaehlt) titel.textContent = gewaehlt.dataset.name;
  }
  if (galerie) {
    albumKnoepfe.forEach(function (b) {
      b.addEventListener("click", function () {
        zeigeAlbum(b.dataset.albumWahl);
        if (b.closest(".alben")) document.getElementById("fotos").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    var start = location.hash.slice(1);
    if (start && document.querySelector('[data-album-wahl="' + start + '"]')) zeigeAlbum(start);
  }

  /* Galerie: Großansicht */
  var box = document.querySelector(".lightbox");
  if (galerie && box && typeof box.showModal === "function") {
    var bild = box.querySelector(".lightbox__buehne img");
    var text = box.querySelector(".lightbox__text");
    var zahl = box.querySelector(".lightbox__zahl");
    var liste = [], pos = 0, ausloeser = null;
    var zeige = function (i) {
      pos = (i + liste.length) % liste.length;
      var b = liste[pos].querySelector("img");
      bild.src = b.currentSrc || b.src; bild.alt = b.alt;
      text.textContent = b.alt;
      zahl.textContent = (pos + 1) + " / " + liste.length;
    };
    galerie.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      liste = Array.prototype.slice.call(galerie.querySelectorAll("li:not([hidden])"));
      ausloeser = btn;
      zeige(liste.indexOf(btn.closest("li")));
      box.showModal();
    });
    box.querySelector(".lightbox__zu").addEventListener("click", function () { box.close(); });
    box.querySelector(".lightbox__vor").addEventListener("click", function () { zeige(pos + 1); });
    box.querySelector(".lightbox__zurueck").addEventListener("click", function () { zeige(pos - 1); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") zeige(pos + 1);
      if (e.key === "ArrowLeft") zeige(pos - 1);
    });
    box.addEventListener("click", function (e) { if (e.target === box || e.target.classList.contains("lightbox__buehne")) box.close(); });
    box.addEventListener("close", function () { if (ausloeser) ausloeser.focus(); });
    var startX = null;
    box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) zeige(pos + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }
})();
