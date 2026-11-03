(function () {
  "use strict";

  // Örnek ürün verisi (fiyatlar temsilidir)
  var products = [
    { id: 1, name: "Nemlendirici Yüz Kremi 50 ml", brand: "Hydra", cat: "cilt", emoji: "🧴", old: 249.9, now: 179.9 },
    { id: 2, name: "Sivilce Karşıtı Temizleme Jeli", brand: "ClearSkin", cat: "cilt", emoji: "🫧", old: 169.9, now: 119.9 },
    { id: 3, name: "Güneş Koruyucu SPF 50", brand: "SunSafe", cat: "cilt", emoji: "☀️", old: 289.9, now: 214.9 },
    { id: 4, name: "Mat Ruj Pembe Dokunuş", brand: "Rosé", cat: "makyaj", emoji: "💄", old: 199.9, now: 139.9 },
    { id: 5, name: "Hacim Veren Maskara", brand: "LashUp", cat: "makyaj", emoji: "👁️", old: 229.9, now: 159.9 },
    { id: 6, name: "Mini Far Paleti 12 Renk", brand: "Pinkie", cat: "makyaj", emoji: "🎨", old: 349.9, now: 249.9 },
    { id: 7, name: "Onarıcı Şampuan 400 ml", brand: "SilkHair", cat: "sac", emoji: "🧼", old: 159.9, now: 109.9 },
    { id: 8, name: "Saç Maskesi Keratin", brand: "SilkHair", cat: "sac", emoji: "💆", old: 219.9, now: 154.9 },
    { id: 9, name: "Kuru Şampuan Sprey", brand: "QuickFresh", cat: "sac", emoji: "🌬️", old: 139.9, now: 99.9 },
    { id: 10, name: "Duş Jeli 3'lü Paket", brand: "FreshUp", cat: "kisisel", emoji: "🚿", old: 189.9, now: 129.9 },
    { id: 11, name: "Roll-on Deodorant 2'li", brand: "DryCare", cat: "kisisel", emoji: "🧊", old: 119.9, now: 84.9 },
    { id: 12, name: "El Kremi Hediye Seti", brand: "Softy", cat: "kisisel", emoji: "🎁", old: 179.9, now: 124.9 }
  ];

  // SVG ürün çizimleri (marka etiketli, parlama ve zemin gölgeli)
  var palettes = [
    { bg: "#ffe9f4", c: "#e6007e" },
    { bg: "#f1f1f3", c: "#141414" },
    { bg: "#fff4f9", c: "#ff4fa3" },
    { bg: "#f7e6ee", c: "#b8005f" }
  ];
  var shapeOf = { 1: "jar", 2: "tube", 3: "tube", 4: "lipstick", 5: "tube", 6: "jar", 7: "bottle", 8: "jar", 9: "bottle", 10: "bottle", 11: "bottle", 12: "jar" };
  function shape(kind, c, label) {
    var shadow = '<ellipse cx="50" cy="91" rx="24" ry="3.6" fill="#000" opacity=".13"/>';
    var gloss = function (x, y, w, h, r) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="#fff" opacity=".22"/>'; };
    var text = function (y) { return '<text x="50" y="' + y + '" text-anchor="middle" font-size="6.4" font-weight="700" fill="#fff" font-family="sans-serif">' + label + '</text>'; };
    if (kind === "tube") return shadow + '<rect x="37" y="10" width="26" height="13" rx="3" fill="#111"/><path d="M32 23h36l-5 66H37z" fill="' + c + '"/><path d="M36 26h6l-3 60h-4z" fill="#fff" opacity=".2"/>' + text(62);
    if (kind === "bottle") return shadow + '<rect x="41" y="8" width="18" height="11" rx="2.5" fill="#111"/><rect x="45" y="19" width="10" height="9" fill="#2a2a2a"/><rect x="28" y="28" width="44" height="61" rx="12" fill="' + c + '"/>' + gloss(33, 33, 6, 50, 3) + '<rect x="34" y="50" width="32" height="22" rx="4" fill="#fff" opacity=".16"/>' + text(64);
    if (kind === "jar") return shadow + '<rect x="24" y="36" width="52" height="14" rx="5" fill="#111"/><rect x="26" y="50" width="48" height="39" rx="10" fill="' + c + '"/>' + gloss(31, 54, 5, 30, 2.5) + text(74);
    return shadow + '<rect x="39" y="50" width="22" height="39" rx="4" fill="#111"/><rect x="41" y="33" width="18" height="17" fill="' + c + '"/><path d="M41 33l9-17 9 17z" fill="' + c + '"/>' + gloss(43, 36, 4, 12, 2) + '<rect x="39" y="62" width="22" height="3" fill="' + c + '"/>';
  }
  function art(p) {
    var pal = palettes[p.id % palettes.length];
    return '<div class="card-visual" style="background:' + pal.bg + '"><svg viewBox="0 0 100 100" aria-hidden="true">' + shape(shapeOf[p.id], pal.c, p.brand) + '</svg>';
  }

  var state = { cat: "hepsi", query: "", cart: 0 };

  var grid = document.getElementById("productGrid");
  var emptyMsg = document.getElementById("emptyMsg");
  var resultInfo = document.getElementById("resultInfo");
  var cartCount = document.getElementById("cartCount");
  var toastEl = document.getElementById("toast");
  var toastTimer;

  function money(n) {
    return n.toFixed(2).replace(".", ",") + " ₺";
  }

  function normalize(s) {
    return s.toLocaleLowerCase("tr-TR").trim();
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  function render() {
    var q = normalize(state.query);
    var list = products.filter(function (p) {
      var catOk = state.cat === "hepsi" || p.cat === state.cat;
      var textOk = !q || normalize(p.name + " " + p.brand).indexOf(q) !== -1;
      return catOk && textOk;
    });

    grid.innerHTML = list.map(function (p) {
      var off = Math.round((1 - p.now / p.old) * 100);
      return (
        '<article class="card">' +
          art(p) + '<span class="badge">%' + off + '</span></div>' +
          '<div class="card-body">' +
            '<p class="brand">' + p.brand + '</p>' +
            '<h3>' + p.name + '</h3>' +
            '<div class="prices"><span class="old">' + money(p.old) + '</span><span class="new">' + money(p.now) + '</span></div>' +
            '<button class="btn btn-pink" data-id="' + p.id + '">Fırsatı Yakala</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");

    emptyMsg.hidden = list.length !== 0;
    resultInfo.textContent = list.length + " ürün listeleniyor";
  }

  // Kategori filtresi
  document.getElementById("chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
    chip.classList.add("active");
    state.cat = chip.dataset.cat;
    render();
  });

  // Arama
  var searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function () {
    state.query = searchInput.value;
    render();
  });
  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    state.query = searchInput.value;
    render();
    document.getElementById("kou-firsatlari").scrollIntoView({ behavior: "smooth" });
  });

  // Fırsatı Yakala
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-id]");
    if (!btn) return;
    var p = products.find(function (x) { return x.id === Number(btn.dataset.id); });
    state.cart += 1;
    cartCount.textContent = state.cart;
    cartCount.classList.remove("bump");
    void cartCount.offsetWidth;
    cartCount.classList.add("bump");
    showToast(p.name + " sepete eklendi");
  });

  document.getElementById("cartBtn").addEventListener("click", function () {
    showToast(state.cart ? state.cart + " ürün sepetinde (örnek site)" : "Sepetin henüz boş");
  });

  // Mobil menü
  var menuToggle = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");
  menuToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Aktif menü bağlantısı (kaydırmaya göre)
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var i = targets.indexOf(en.target);
          links.forEach(function (l) { l.classList.remove("active"); });
          if (i > -1) links[i].classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    targets.forEach(function (t) { if (t) io.observe(t); });
  }

  // Geri sayım (bugünden itibaren 14 gün sonrası; sabit tarih için aşağıyı düzenle)
  // Örnek sabit tarih: new Date("2026-12-31T23:59:59+03:00")
  var end = new Date();
  end.setDate(end.getDate() + 14);
  end.setHours(23, 59, 59, 0);

  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var diff = Math.max(0, end - new Date());
    document.getElementById("cdD").textContent = pad(Math.floor(diff / 86400000));
    document.getElementById("cdH").textContent = pad(Math.floor(diff / 3600000) % 24);
    document.getElementById("cdM").textContent = pad(Math.floor(diff / 60000) % 60);
    document.getElementById("cdS").textContent = pad(Math.floor(diff / 1000) % 60);
  }
  tick();
  setInterval(tick, 1000);

  // Kodu kopyala
  document.getElementById("copyBtn").addEventListener("click", function () {
    var code = document.getElementById("promoCode").textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(
        function () { showToast("Kod kopyalandı: " + code); },
        function () { showToast("Kopyalanamadı, kodu elle seç: " + code); }
      );
    } else {
      showToast("Kodu elle kopyala: " + code);
    }
  });

  // İletişim formu (sunucu yok; yalnızca arayüz geri bildirimi)
  document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("formMsg").textContent = "Mesajın alındı. Teşekkürler! (Örnek form, veri gönderilmez.)";
    e.target.reset();
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  render();
})();
