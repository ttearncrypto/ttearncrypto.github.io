(function () {
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

  var tabEarn = document.getElementById("tabEarn");
  var tabRefer = document.getElementById("tabRefer");
  var form = document.getElementById("requestForm");

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

  if (tabEarn && tabRefer && form) {
    tabEarn.addEventListener("click", function () {
      setPlan("earn");
    });
    tabRefer.addEventListener("click", function () {
      setPlan("refer");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var cta = form.querySelector("[data-cta]");
      cta.textContent = planMeta.active === "refer" ? "Copied — share away" : "All set — check your wallet";
    });
  }
})();