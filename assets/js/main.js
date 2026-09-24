/*
  F9XR's TTEarnCrypto - z-depth deck engine
*/

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- mobile menu ---------- */
  var mobileMenu = document.getElementById("mobileMenu");
  var menuToggle = document.getElementById("menuToggle");
  var menuClose = document.getElementById("menuClose");

  function setMenu(open) {
    if (open) {
      mobileMenu.setAttribute("open", "");
    } else {
      mobileMenu.removeAttribute("open");
    }
    mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      menuClose.focus();
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      setMenu(mobileMenu.getAttribute("open") !== null);
    });
    menuClose.addEventListener("click", function () {
      setMenu(false);
      menuToggle.focus();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.getAttribute("open") !== null) {
        setMenu(false);
        menuToggle.focus();
      }
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
  }

  /* ---------- request form: earn / refer plans ---------- */
  var tabEarn = document.getElementById("tabEarn");
  var tabRefer = document.getElementById("tabRefer");
  var form = document.getElementById("requestForm");
  var success = document.getElementById("requestSuccess");
  var copyNote = document.getElementById("copyNote");
  var resetBtn = document.getElementById("requestReset");

  var planMeta = {
    earn: {
      wallet: ["Your wallet", "0x1a2b ···· 4f8c"],
      style: ["How you'll earn", "Faucets, airdrops, dashboards"],
      when: ["When you'll start", "Today"],
      cta: "Start earning"
    },
    refer: {
      wallet: ["Your code", "TTEarn-10x"],
      style: ["Who gets paid", "You + your friend"],
      when: ["On their payout", "First one out"],
      cta: "Copy your link"
    }
  };

  function setPlan(name) {
    var meta = planMeta[name];
    form.querySelectorAll("[data-label]").forEach(function (label) {
      var key = label.getAttribute("data-label");
      var value = label.parentNode.querySelector("input");
      label.textContent = meta[key][0];
      if (value) {
        value.value = meta[key][1];
        value.setAttribute("aria-label", meta[key][0]);
      }
    });
    planMeta.active = name;
    form.querySelector("[data-cta]").textContent = meta.cta;
    tabEarn.setAttribute("aria-selected", name === "earn" ? "true" : "false");
    tabRefer.setAttribute("aria-selected", name === "refer" ? "true" : "false");
  }

  function showSuccess() {
    form.classList.add("is-hidden");
    success.hidden = false;
    if (resetBtn) {
      resetBtn.focus();
    }
  }

  function hideSuccess() {
    success.hidden = true;
    form.classList.remove("is-hidden");
    if (copyNote) {
      copyNote.hidden = true;
    }
  }

  function copied() {
    var cta = form.querySelector("[data-cta]");
    cta.textContent = "Copied - share away";
    if (copyNote) {
      copyNote.hidden = false;
    }
  }

  function legacyCopy(url) {
    var ta = document.createElement("textarea");
    ta.value = url;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      copied();
    } catch (err) {
      var cta = form.querySelector("[data-cta]");
      cta.textContent = planMeta.refer.cta;
    }
    document.body.removeChild(ta);
  }

  function copyReferral() {
    var url = "https://ttearncrypto.f9xr.org/?ref=" + encodeURIComponent(planMeta.refer.wallet[1]);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(copied).catch(function () {
        legacyCopy(url);
      });
    } else {
      legacyCopy(url);
    }
  }

  if (tabEarn && tabRefer && form) {
    tabEarn.addEventListener("click", function () {
      hideSuccess();
      setPlan("earn");
    });
    tabRefer.addEventListener("click", function () {
      hideSuccess();
      setPlan("refer");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (planMeta.active === "refer") {
        copyReferral();
      } else {
        showSuccess();
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        hideSuccess();
        tabEarn.focus();
      });
    }
  }

  /* ---------- sticky mobile CTA ---------- */
  var stickyCta = document.querySelector(".sticky-cta");
  if (stickyCta) {
    var tail = document.querySelector(".tail");
    if ("IntersectionObserver" in window && tail) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          stickyCta.classList.toggle("visible", !entry.isIntersecting);
        });
      }, { rootMargin: "0px 0px -10% 0px" });
      observer.observe(tail);
    } else {
      window.addEventListener("scroll", function () {
        stickyCta.classList.toggle("visible", window.scrollY > window.innerHeight * 3);
      });
    }
  }

  /* ---------- z-depth escalator engine ---------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll(".zcard"));
  var hasDeck = cards.length > 0;
  var hudFill = document.getElementById("hudFill");
  var hudPct = document.getElementById("hudPct");
  var navUp = document.getElementById("navUp");
  var navDown = document.getElementById("navDown");

  var vh = window.innerHeight;
  var ticking = false;

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function renderEngine() {
    if (!hasDeck) { return; }
    var y = window.scrollY || window.pageYOffset || 0;
    var i, entry, recede, scale, ty;

    for (i = 0; i < cards.length; i++) {
      entry = i === 0 ? 1 : clamp01((y - (i - 1) * vh) / vh);
      recede = clamp01((y - i * vh) / vh);
      scale = 1 - 0.1 * recede;
      ty = (1 - entry) * 100;
      cards[i].style.transform = "translateY(" + ty + "%) scale(" + scale + ")";
      cards[i].style.opacity = String(1 - 0.6 * recede);
      cards[i].classList.toggle("is-gone", recede >= 0.999);
    }
  }

  function renderProgress() {
    if (!hudFill) { return; }
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    var p = clamp01((window.scrollY || window.pageYOffset || 0) / max);
    hudFill.style.width = (p * 100) + "%";
    if (hudPct) {
      hudPct.textContent = String(Math.round(p * 100)).padStart(3, "0") + "%";
    }
    if (navUp) {
      navUp.disabled = p <= 0.001;
    }
    if (navDown) {
      navDown.disabled = p >= 0.999;
    }
  }

  function onFrame() {
    if (!reduceMotion) { renderEngine(); }
    renderProgress();
    ticking = false;
  }

  function requestRender() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onFrame);
    }
  }

  window.addEventListener("scroll", requestRender, { passive: true });

  window.addEventListener("resize", function () {
    vh = window.innerHeight;
    requestRender();
  });

  setTimeout(requestRender, 3000);
  requestRender();

  function gotoCard(index) {
    if (!hasDeck) { return; }
    var i = Math.max(0, Math.min(cards.length - 1, index));
    var top;

    if (reduceMotion) {
      top = cards[i].getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      window.scrollTo(0, top);
    } else {
      window.scrollTo({ top: i * vh, behavior: "smooth" });
    }
  }

  if (navUp) {
    navUp.addEventListener("click", function () {
      var y = window.scrollY || window.pageYOffset || 0;
      gotoCard(Math.ceil(y / vh - 0.001) - 1);
    });
  }

  if (navDown) {
    navDown.addEventListener("click", function () {
      var y = window.scrollY || window.pageYOffset || 0;
      gotoCard(Math.floor(y / vh + 0.001) + 1);
    });
  }

  /* ---------- FAQ accordion ---------- */
  var faq = document.getElementById("faq");
  if (faq) {
    var faqDetails = Array.prototype.slice.call(faq.querySelectorAll("details"));
    faqDetails.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (item.open) {
          faqDetails.forEach(function (other) {
            if (other !== item) { other.open = false; }
          });
        }
      });
    });
  }

  /* ---------- kinetic accordion ---------- */
  var accordion = document.getElementById("accordion");
  var slices = accordion ? Array.prototype.slice.call(accordion.querySelectorAll(".slice")) : [];

  function setActiveSlice(target) {
    slices.forEach(function (s) {
      var on = s === target;
      s.classList.toggle("active", on);
      s.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }

  slices.forEach(function (slice) {
    if (hoverCapable) {
      slice.addEventListener("mouseenter", function () { setActiveSlice(slice); });
    }
    slice.addEventListener("focus", function () { setActiveSlice(slice); });
    slice.addEventListener("click", function () {
      if (slice.classList.contains("active") && !hoverCapable) {
        setActiveSlice(null);
      } else {
        setActiveSlice(slice);
      }
    });
    slice.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        slice.click();
      }
    });
  });

  if (hoverCapable && accordion) {
    accordion.addEventListener("mouseleave", function () { setActiveSlice(null); });
  }

  /* ---------- matrix tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".matrix-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".matrix-img"));
  var caption = document.getElementById("matrixCaption");

  var captions = {
    daily: "FIG. 01 / DAILY",
    listing: "FIG. 02 / ON LISTING",
    weekly: "FIG. 03 / WEEKLY",
    dashboards: "FIG. 04 / DASHBOARDS"
  };

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-goto");

      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });

      panels.forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-panel") === key);
      });

      caption.textContent = captions[key];
    });
  });
})();