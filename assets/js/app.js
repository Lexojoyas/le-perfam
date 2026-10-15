/* ==========================================================================
   LE PERFAM · Lógica del sitio
   Catálogo (marca, género, búsqueda y orden), encargo y pedido por WhatsApp.
   Los datos se editan en assets/js/catalogo.js: este archivo no hace falta tocarlo.
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.LE_PERFAM;
  if (!DATA || !DATA.marcas) return;

  var CONTACTO = DATA.contacto || {};
  var TIENDA = DATA.tienda || {};
  var KEY_CART = "leperfam-encargo-v1";
  var KEY_DATOS = "leperfam-datos-v1";
  var KEY_FAVS = "leperfam-favoritos-v1";
  var NOTAS = window.LE_PERFAM_NOTAS || {};
  var ESTILOS = [
    ["Dulce", "vainilla, caramelo, gourmand"],
    ["Frutal", "frutas, tropical"],
    ["Floral", "flores, rosa, jazmín"],
    ["Fresco", "cítricos, aromáticos, acuáticos"],
    ["Amaderado", "maderas, cuero, oud"],
    ["Oriental", "ámbar, especias cálidas"]
  ];
  var DIA = ["Fresco", "Frutal", "Floral"], NOCHE = ["Oriental", "Amaderado", "Dulce"];
  var FOTO_DIR = "assets/img/perfumes/";
  var MAX_QTY = 20;
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- Utilidades ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function norm(str) {
    return String(str)
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/['’`]/g, "").replace(/\s+/g, " ").trim();
  }

  function slug(str) { return norm(str).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  function money(n) { return "$" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  function waUrl(text) {
    return "https://wa.me/" + (CONTACTO.whatsapp || "") + "?text=" + encodeURIComponent(text);
  }

  function storeGet(key) {
    try { var raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function storeSet(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sin almacenamiento: sigue funcionando en esta visita */ }
  }

  /* ---------- Íconos ---------- */
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C12.9 7.6 16.4 11.1 24 12 16.4 12.9 12.9 16.4 12 24 11.1 16.4 7.6 12.9 0 12 7.6 11.1 11.1 7.6 12 0Z"/></svg>';
  var ICON = {
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5"/></svg>',
    photos: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="13" rx="2.5"/><circle cx="12" cy="12.5" r="3.2"/><path d="M9 6l1.2-2h3.6L15 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.6-4.6-9.2-9.2C1.7 7.8 3.9 4.6 7.2 4.6c2 0 3.5 1.1 4.8 2.8 1.3-1.7 2.8-2.8 4.8-2.8 3.3 0 5.5 3.2 4.4 6.5-1.6 4.6-9.2 9.2-9.2 9.2Z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z"/></svg>',
    label: '<svg class="label__frame" viewBox="0 0 100 125" aria-hidden="true">' +
      '<path class="o" d="M9 0H91A9 9 0 0 0 100 9V116A9 9 0 0 0 91 125H9A9 9 0 0 0 0 116V9A9 9 0 0 0 9 0Z"/>' +
      '<path class="i" d="M11 5H89A6 6 0 0 0 95 11V114A6 6 0 0 0 89 120H11A6 6 0 0 0 5 114V11A6 6 0 0 0 11 5Z"/></svg>'
  };

  /* ---------- Catálogo plano ---------- */
  var PRODUCTS = [];
  var BY_ID = {};
  var BRANDS = [];
  var STOP = ["de", "del", "la", "le", "el", "the", "of", "for", "pour", "and", "y", "eau", "edp", "con"];

  function initials(nombre) {
    var words = nombre.replace(/[()"'’]/g, "").split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    if (/\d/.test(words[0])) return words[0].slice(0, 3).toUpperCase();
    var sig = words.filter(function (w) { return STOP.indexOf(w.toLowerCase()) === -1; });
    if (!sig.length) sig = words;
    if (sig.length === 1) return sig[0].charAt(0).toUpperCase();
    return (sig[0].charAt(0) + sig[1].charAt(0)).toUpperCase();
  }

  // De día: estilos frescos, frutales o florales. De noche: orientales, amaderados o dulces.
  function momentoDe(estilos) {
    if (!estilos.length) return "";
    var d = estilos.some(function (e) { return DIA.indexOf(e) !== -1; });
    var n = estilos.some(function (e) { return NOCHE.indexOf(e) !== -1; });
    return d && n ? "ambos" : d ? "dia" : "noche";
  }

  function fotoPath(foto, id) {
    if (!foto) return "";
    if (foto === true) return FOTO_DIR + id + ".jpg";
    return String(foto).indexOf("/") === -1 ? FOTO_DIR + foto : String(foto);
  }

  DATA.marcas.forEach(function (grupo, gi) {
    var brandId = slug(grupo.marca);
    BRANDS.push({ id: brandId, nombre: grupo.marca, total: grupo.perfumes.length, otras: norm(grupo.marca) === "otras" });
    grupo.perfumes.forEach(function (p) {
      var id = slug(grupo.marca + " " + p.nombre);
      var precio = Number(p.precio) || 0;
      var antes = Number(p.antes) > precio ? Number(p.antes) : 0;
      var item = {
        id: id, index: PRODUCTS.length,
        marca: grupo.marca, marcaId: brandId,
        nombre: p.nombre,
        genero: p.genero || "Unisex",
        precio: precio, antes: antes,
        descripcion: p.descripcion || "",
        enStock: !!p.enStock, agotado: !!p.agotado, nuevo: !!p.nuevo,
        foto: fotoPath(p.foto, id),
        extras: p.foto ? (p.fotosExtra || []).map(function (f) { return fotoPath(f, id); }).filter(Boolean) : [],
        ini: initials(p.nombre)
      };
      var nt = NOTAS[id] || null;
      item.notas = nt;
      item.estilos = nt && nt.estilos ? nt.estilos.slice(0, 2) : [];
      item.momento = momentoDe(item.estilos);
      var notasTxt = nt ? [nt.familia || ""].concat(nt.salida || [], nt.corazon || [], nt.fondo || [], nt.notas || []).join(" ") : "";
      item.search = norm([item.marca, item.nombre, item.genero, item.descripcion, item.estilos.join(" "), notasTxt].join(" "));
      PRODUCTS.push(item);
      BY_ID[id] = item;
    });
  });

  // Marcas en orden alfabético ("Otras" al final)
  BRANDS.sort(function (a, b) {
    if (a.otras !== b.otras) return a.otras ? 1 : -1;
    return a.nombre.localeCompare(b.nombre, "es");
  });
  var BRAND_BY_ID = {};
  BRANDS.forEach(function (b) { BRAND_BY_ID[b.id] = b; });

  function find(ref) { return ref ? BY_ID[slug(ref.marca + " " + ref.nombre)] || null : null; }

  /* ---------- Estado del encargo ---------- */
  var cart = {};

  (function loadCart() {
    var saved = storeGet(KEY_CART) || {};
    Object.keys(saved).forEach(function (id) {
      var q = parseInt(saved[id], 10);
      if (BY_ID[id] && !BY_ID[id].agotado && q > 0) cart[id] = Math.min(q, MAX_QTY);
    });
  })();

  function qty(id) { return cart[id] || 0; }
  function count() { return Object.keys(cart).reduce(function (s, id) { return s + cart[id]; }, 0); }
  function total() { return Object.keys(cart).reduce(function (s, id) { return s + BY_ID[id].precio * cart[id]; }, 0); }

  function setQty(id, q) {
    if (!BY_ID[id] || BY_ID[id].agotado) return;
    q = Math.max(0, Math.min(MAX_QTY, q));
    if (q === 0) delete cart[id]; else cart[id] = q;
    storeSet(KEY_CART, cart);
    refreshCtrls(id);
    renderCart();
  }

  /* ---------- Favoritos ---------- */
  var favs = {};
  (function loadFavs() {
    var saved = storeGet(KEY_FAVS) || [];
    if (Array.isArray(saved)) saved.forEach(function (id) { if (BY_ID[id]) favs[id] = 1; });
  })();
  function isFav(id) { return !!favs[id]; }
  function favList() { return PRODUCTS.filter(function (p) { return favs[p.id]; }); }
  function toggleFav(id) {
    if (!BY_ID[id]) return;
    if (favs[id]) delete favs[id]; else favs[id] = 1;
    storeSet(KEY_FAVS, Object.keys(favs));
    var on = isFav(id);
    $$('[data-fav="' + id + '"]').forEach(function (b) {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.classList.remove("is-pop"); void b.offsetWidth; if (on) b.classList.add("is-pop");
    });
    renderFavCount();
    track(on ? "favorito/" + id : "favorito-quitado/" + id);
    if (filters.fav) renderCatalog();
    else renderFilters(null);
  }
  function renderFavCount() {
    var n = Object.keys(favs).length;
    $$("[data-fav-count]").forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    var b = $("[data-fav-open]");
    if (b) b.setAttribute("aria-label", n ? "Ver tus favoritos (" + n + ")" : "Ver tus favoritos");
  }
  function favMessage() {
    var lines = ["Hola Le Perfam! Estos son mis perfumes favoritos de la web:", ""];
    favList().forEach(function (p, i) { lines.push((i + 1) + ". " + p.nombre + " (" + p.marca + ") · " + money(p.precio)); });
    lines.push("", "¿Me pasan disponibilidad?");
    return lines.join("\n");
  }

  /* ---------- Contador de visitas (opcional) ---------- */
  function track(path) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: path, title: path, event: true }); } catch (e) { /* sin contador */ }
  }
  (function loadCounter() {
    var code = String(TIENDA.contadorVisitas || "").replace(/[^a-z0-9-]/gi, "");
    if (!code) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + code + ".goatcounter.com/count");
    document.head.appendChild(s);
  })();

  /* ---------- Plantillas ---------- */
  function ctrlHTML(p) {
    if (p.agotado) {
      return '<button type="button" class="add" disabled>No disponible</button>';
    }
    var q = qty(p.id);
    if (!q) {
      return '<button type="button" class="add" data-add="' + p.id + '" aria-label="Agregar ' + esc(p.nombre) + ' al encargo">' + ICON.plus + "Agregar</button>";
    }
    return '<div class="stepper" role="group" aria-label="' + esc(p.nombre) + ' en tu encargo">' +
      '<button type="button" data-dec="' + p.id + '" aria-label="Quitar uno">−</button>' +
      '<output aria-live="polite"><span class="n">' + q + '</span><span class="lbl"> en tu encargo</span></output>' +
      '<button type="button" data-inc="' + p.id + '" aria-label="Sumar uno"' + (q >= MAX_QTY ? " disabled" : "") + ">+</button>" +
      "</div>";
  }

  function consultUrl(p) {
    return waUrl("Hola Le Perfam! Quería consultar por " + p.nombre + " de " + p.marca + " (" + money(p.precio) + ").");
  }

  function labelHTML(p) {
    return '<div class="label" aria-hidden="true"><span class="label__tag">' + ICON.label +
      '<span class="label__brand">' + esc(p.marca) + "</span>" +
      '<span class="label__mono">' + esc(p.ini) + "</span>" +
      "<span>" + STAR.replace("<svg ", '<svg class="label__star" ') + "</span>" +
      '<span class="label__soon">Foto próximamente</span></span></div>';
  }

  function favBtnHTML(p) {
    var on = isFav(p.id);
    return '<button type="button" class="fav" data-fav="' + p.id + '" aria-pressed="' + on + '" aria-label="Guardar ' + esc(p.nombre) + ' en favoritos" title="Favoritos">' + ICON.heart + "</button>";
  }

  function estilosTxt(p) { return p.estilos.length ? p.estilos.join(" · ") : ""; }

  function mediaHTML(p, opts) {
    var badges = "";
    if (opts.top) badges += '<span class="badge badge--top">Más vendido</span>';
    if (p.nuevo) badges += '<span class="badge badge--new">Nuevo</span>';
    if (p.antes) badges += '<span class="badge badge--promo">Promo −' + Math.round((1 - p.precio / p.antes) * 100) + "%</span>";
    var inner;
    if (p.foto) {
      var n = 1 + p.extras.length;
      inner = '<button type="button" class="pcard__zoom" data-open="' + p.id + '" aria-label="Ver la ficha de ' + esc(p.nombre) + '">' +
        '<img src="' + esc(p.foto) + '" data-pid="' + p.id + '" alt="' + esc(p.nombre + " de " + p.marca) + '" width="800" height="800" loading="lazy" decoding="async">' +
        (p.extras.length ? '<img class="pcard__alt" src="' + esc(p.extras[0]) + '" data-alt alt="" width="800" height="800" loading="lazy" decoding="async">' : "") +
        "</button>" +
        (n > 1 ? '<span class="pcard__zoom-ico" aria-hidden="true">' + ICON.photos + "<span>" + n + "</span></span>" : "");
    } else {
      inner = '<button type="button" class="pcard__zoom pcard__zoom--label" data-open="' + p.id + '" aria-label="Ver la ficha de ' + esc(p.nombre) + '">' + labelHTML(p) + "</button>";
    }
    return '<div class="pcard__media">' + inner + favBtnHTML(p) + (badges ? '<div class="pcard__badges">' + badges + "</div>" : "") + "</div>";
  }

  function cardHTML(p, opts) {
    opts = opts || {};
    var h = opts.h || "h4";
    var meta = esc(p.genero);
    if (p.estilos.length) meta += " · " + esc(estilosTxt(p));
    if (p.agotado) meta += ' · <span class="no">No disponible por ahora</span>';
    else if (p.enStock) meta += ' · <span class="ok">Entrega inmediata</span>';
    return '<article class="pcard' + (opts.reveal ? " reveal" : "") + '" data-g="' + esc(p.genero) + '" data-card="' + p.id + '" style="--i:' + (opts.i || 0) + ";--d:" + ((opts.i || 0) * 80) + 'ms">' +
      mediaHTML(p, opts) +
      '<div class="pcard__body">' +
      '<p class="pcard__brand">' + esc(p.marca) + "</p>" +
      "<" + h + ' class="pcard__name"><button type="button" class="pcard__link" data-open="' + p.id + '">' + esc(p.nombre) + "</button></" + h + ">" +
      (p.descripcion ? '<p class="pcard__desc">' + esc(p.descripcion) + "</p>" : "") +
      '<p class="pcard__meta">' + meta + "</p>" +
      '<p class="pcard__price">' +
      '<span class="price' + (p.antes ? " price--promo" : "") + '">' + (p.antes ? '<span class="visually-hidden">Ahora </span>' : "") + money(p.precio) + "</span>" +
      (p.antes ? '<s><span class="visually-hidden">Antes </span>' + money(p.antes) + "</s>" : "") +
      "</p>" +
      (opts.save && p.antes ? '<p class="pcard__save">Ahorrás ' + money(p.antes - p.precio) + "</p>" : "") +
      '<div class="pcard__actions"><div class="pcard__ctrl" data-ctrl="' + p.id + '" style="display:contents">' + ctrlHTML(p) + "</div>" +
      '<a class="consult" href="' + consultUrl(p) + '" target="_blank" rel="noopener" aria-label="Consultar ' + esc(p.nombre) + ' por WhatsApp" title="Consultar por WhatsApp">' + ICON.wa + "</a>" +
      "</div></div></article>";
  }

  function refreshCtrls(id) {
    var p = BY_ID[id];
    $$('[data-ctrl="' + id + '"]').forEach(function (el) { el.innerHTML = ctrlHTML(p); });
  }

  // Si una foto indicada en catalogo.js no existe, se muestra la etiqueta en su lugar
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG") return;
    var p = BY_ID[img.getAttribute("data-pid")];
    if (p) {
      var btn = img.closest(".pcard__zoom");
      var media = img.closest(".pcard__media");
      if (btn && media) {
        var ico = $(".pcard__zoom-ico", media);
        if (ico) ico.remove();
        btn.classList.add("pcard__zoom--label");
        btn.innerHTML = labelHTML(p);
      }
      return;
    }
    var vp = BY_ID[img.getAttribute("data-vt")];
    if (vp) {
      img.insertAdjacentHTML("afterend", labelHTML(vp));
      img.remove();
      return;
    }
    var fp = BY_ID[img.getAttribute("data-fimg")];
    if (fp) {
      var well = img.closest(".ficha__photo");
      if (well) { well.innerHTML = labelHTML(fp); well.removeAttribute("data-zoom"); }
      return;
    }
    if (img.hasAttribute("data-thumb") || img.hasAttribute("data-alt") || img.hasAttribute("data-fthumb")) {
      var t = img.closest(".ficha__thumb"); (t || img).remove();
    }
  }, true);

  /* ---------- Aparición al desplazarse ---------- */
  var observer = ("IntersectionObserver" in window && !reduceMotion) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); observer.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .08 }) : null;

  function observeReveal(root) {
    $$(".reveal:not(.is-visible)", root).forEach(function (el) {
      if (observer) observer.observe(el); else el.classList.add("is-visible");
    });
  }

  /* ---------- Portada, promo y más vendidos ---------- */
  var promoOn = !!(DATA.promo && DATA.promo.activa);
  var promoItems = promoOn ? (DATA.promo.items || []).map(find).filter(Boolean) : [];
  if (!promoItems.length) promoOn = false;

  function renderStatic() {
    $$('[data-stat="perfumes"]').forEach(function (el) { el.textContent = PRODUCTS.length; });
    $$('[data-stat="marcas"]').forEach(function (el) { el.textContent = BRANDS.length; });

    // Índice de marcas: las que más fragancias tienen
    var top = BRANDS.filter(function (b) { return !b.otras; }).slice().sort(function (a, b) {
      return b.total - a.total || a.nombre.localeCompare(b.nombre, "es");
    }).slice(0, 8);
    $("[data-brand-index]").innerHTML = top.map(function (b, i) {
      return '<li><a class="idx" href="#catalogo" data-brand-link="' + b.id + '" style="--i:' + i + '" aria-label="' + esc(b.nombre) + ", " + plural(b.total, "fragancia", "fragancias") + '">' +
        '<span class="idx__name">' + esc(b.nombre) + '</span><span class="idx__count">' + b.total + "</span></a></li>";
    }).join("");

    // Promo
    $$("[data-promo-only]").forEach(function (el) { el.hidden = !promoOn; });
    if (promoOn) {
      $("[data-promo-title]").textContent = DATA.promo.titulo || "Promo";
      $("[data-promo-text]").textContent = plural(promoItems.length, "fragancia", "fragancias") + " con precio especial. Sumalas a tu encargo.";
      $("[data-promo-grid]").innerHTML = promoItems.map(function (p, i) {
        return cardHTML(p, { h: "h3", save: true, reveal: true, i: i });
      }).join("");
      $("#promo").hidden = false;
      if (TIENDA.bannerPromo) {
        $("[data-announce-link]").textContent = TIENDA.bannerPromo;
        $("[data-announce]").hidden = false;
      }
    }

    // Más vendidos
    var best = (DATA.masVendidos || []).map(find).filter(Boolean);
    if (!best.length) {
      $("#mas-vendidos").hidden = true;
      $$('a[href="#mas-vendidos"]').forEach(function (a) { a.closest("li").hidden = true; });
    } else {
      $("[data-bestsellers]").innerHTML = best.map(function (p, i) {
        return cardHTML(p, { h: "h3", top: true, reveal: true, i: i });
      }).join("");
    }

    // Vitrina de la portada: los más vendidos, con su foto
    var vit = $("[data-vitrina]");
    if (vit) {
      if (!best.length) vit.closest(".vitrina").hidden = true;
      vit.innerHTML = best.slice(0, 3).map(function (p, i) {
        var cap = '<span class="vtile__cap"><span class="vtile__brand">' + esc(p.marca) + '</span><span class="vtile__name">' + esc(p.nombre) + '</span><span class="vtile__price">' + money(p.precio) + "</span></span>";
        if (p.foto) {
          return '<button type="button" class="vtile" data-open="' + p.id + '" style="--i:' + i + '" aria-label="Ver la ficha de ' + esc(p.nombre) + " de " + esc(p.marca) + '">' +
            '<img src="' + esc(p.foto) + '" data-vt="' + p.id + '" alt="" width="800" height="800"' + (i ? ' loading="lazy"' : "") + ' decoding="async">' + cap + "</button>";
        }
        return '<button type="button" class="vtile vtile--label" data-open="' + p.id + '" style="--i:' + i + '" aria-label="Ver la ficha de ' + esc(p.nombre) + '">' + labelHTML(p) + cap + "</button>";
      }).join("");
    }

    // Recién llegados (perfumes con nuevo: true)
    var nuevos = PRODUCTS.filter(function (p) { return p.nuevo; });
    $$("[data-nuevos-only]").forEach(function (el) { el.hidden = !nuevos.length; });
    if (nuevos.length) {
      $("[data-nuevos]").innerHTML = nuevos.slice(0, 6).map(function (p, i) { return cardHTML(p, { h: "h3", reveal: true, i: i }); }).join("");
      $("#nuevos").hidden = false;
    }

    // Preguntas frecuentes
    var faq = $("[data-faq]");
    var preguntas = DATA.preguntas || [];
    if (faq && preguntas.length) {
      faq.innerHTML = preguntas.map(function (q, i) {
        return '<details class="faq__item"' + (i === 0 ? " open" : "") + '><summary><span>' + esc(q.p) + '</span><span class="faq__icon" aria-hidden="true"></span></summary><p>' + esc(q.r) + "</p></details>";
      }).join("");
    } else if (faq) {
      $("#preguntas").hidden = true;
      $$('a[href="#preguntas"]').forEach(function (a) { var li = a.closest("li"); if (li) li.hidden = true; });
    }

    // Contacto
    var consulta = waUrl("Hola Le Perfam! Quería hacer una consulta.");
    $$("[data-wa-consult]").forEach(function (a) { a.href = consulta; });
    $$("[data-ig-link]").forEach(function (a) { if (CONTACTO.instagram) a.href = CONTACTO.instagram; });
    $$("[data-ig-user]").forEach(function (el) { if (CONTACTO.instagramUsuario) el.textContent = CONTACTO.instagramUsuario; });
    $$("[data-wa-visible]").forEach(function (el) { if (CONTACTO.whatsappVisible) el.textContent = CONTACTO.whatsappVisible; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- Catálogo ---------- */
  var SORTS = [
    ["destacados", "Destacados"],
    ["precio-asc", "Precio: menor a mayor"],
    ["precio-desc", "Precio: mayor a menor"],
    ["nombre", "Nombre (A–Z)"]
  ];
  var GENDERS = [["", "Todos"], ["Mujer", "Mujer"], ["Hombre", "Hombre"], ["Unisex", "Unisex"]];
  var filters = { marca: "", genero: "", estilo: "", fav: false, q: "", sort: "destacados" };
  var lastLimit = 0;

  function matches(p, ignore) {
    ignore = ignore || {};
    if (!ignore.marca && filters.marca && p.marcaId !== filters.marca) return false;
    if (!ignore.genero && filters.genero && p.genero !== filters.genero) return false;
    if (!ignore.estilo && filters.estilo && p.estilos.indexOf(filters.estilo) === -1) return false;
    if (!ignore.fav && filters.fav && !favs[p.id]) return false;
    var q = norm(filters.q);
    if (!q) return true;
    return q.split(" ").every(function (w) { return p.search.indexOf(w) !== -1; });
  }

  function sortItems(list) {
    var s = filters.sort;
    return list.slice().sort(function (a, b) {
      if (s === "precio-asc") return a.precio - b.precio || a.index - b.index;
      if (s === "precio-desc") return b.precio - a.precio || a.index - b.index;
      if (s === "nombre") return a.nombre.localeCompare(b.nombre, "es");
      return a.index - b.index;
    });
  }

  function previewLimit() {
    var w = window.innerWidth;
    if (w >= 1180) return 4;
    if (w >= 768) return 3;
    return 4;
  }

  function buildControls() {
    $$("[data-sort]").forEach(function (sel) {
      sel.innerHTML = SORTS.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + "</option>"; }).join("");
    });
    $$("[data-gender-group]").forEach(function (g) {
      g.innerHTML = GENDERS.map(function (x) {
        return '<button type="button" data-gender="' + x[0] + '" aria-pressed="false">' + x[1] + ' <small data-gcount="' + x[0] + '"></small></button>';
      }).join("");
    });
    $$("[data-style-group]").forEach(function (g) {
      g.innerHTML = '<button type="button" data-style="" aria-pressed="true">Todos</button>' + ESTILOS.map(function (x) {
        return '<button type="button" data-style="' + x[0] + '" aria-pressed="false" title="' + esc(x[1]) + '">' + x[0] + ' <small data-scount="' + x[0] + '"></small></button>';
      }).join("");
    });
  }

  function renderFilters(shown) {
    var gCounts = { "": 0, Mujer: 0, Hombre: 0, Unisex: 0 };
    var sCounts = {};
    var bCounts = {};
    var allForBrands = 0;
    PRODUCTS.forEach(function (p) {
      if (matches(p, { genero: true })) { gCounts[""]++; if (gCounts[p.genero] !== undefined) gCounts[p.genero]++; }
      if (matches(p, { estilo: true })) p.estilos.forEach(function (e) { sCounts[e] = (sCounts[e] || 0) + 1; });
      if (matches(p, { marca: true })) { bCounts[p.marcaId] = (bCounts[p.marcaId] || 0) + 1; allForBrands++; }
    });
    $$("[data-style]").forEach(function (b) {
      var st = b.getAttribute("data-style");
      b.setAttribute("aria-pressed", st === filters.estilo ? "true" : "false");
      if (st) b.disabled = !sCounts[st] && filters.estilo !== st;
    });
    $$("[data-scount]").forEach(function (el) { el.textContent = sCounts[el.getAttribute("data-scount")] || 0; });
    var nf = Object.keys(favs).length;
    $$("[data-fav-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", filters.fav ? "true" : "false");
      b.hidden = !nf && !filters.fav;
    });
    var favWa = $("[data-fav-wa]");
    if (favWa) {
      favWa.hidden = !(filters.fav && nf);
      if (nf) favWa.href = waUrl(favMessage());
    }

    $$("[data-gender]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-gender") === filters.genero ? "true" : "false");
    });
    $$("[data-gcount]").forEach(function (el) { el.textContent = gCounts[el.getAttribute("data-gcount")]; });
    $$("[data-sort]").forEach(function (sel) { sel.value = filters.sort; });

    // Lista lateral de marcas
    $("[data-brand-list]").innerHTML =
      '<li><button type="button" class="brand-opt" data-brand-set="" aria-pressed="' + (!filters.marca) + '"><span>Todas las marcas</span><span>' + allForBrands + "</span></button></li>" +
      BRANDS.map(function (b) {
        var n = bCounts[b.id] || 0;
        var active = filters.marca === b.id;
        return '<li><button type="button" class="brand-opt' + (n ? "" : " is-empty") + '" data-brand-set="' + b.id + '" aria-pressed="' + active + '"' + (n || active ? "" : " disabled") + ">" +
          "<span>" + esc(b.nombre) + "</span><span>" + n + "</span></button></li>";
      }).join("");

    // Selector de marca (celular y tablet)
    var sel = $("[data-brand-select]");
    var compact = window.innerWidth < 768;
    sel.innerHTML = '<option value="">' + (compact ? "Todas" : "Todas las marcas") + " (" + allForBrands + ")</option>" + BRANDS.map(function (b) {
      return '<option value="' + b.id + '">' + esc(b.nombre) + " (" + (bCounts[b.id] || 0) + ")</option>";
    }).join("");
    sel.value = filters.marca;

    $("[data-search-clear]").hidden = !filters.q;

    // Filtros activos
    var chips = [];
    if (filters.marca) chips.push('<button type="button" class="fchip" data-remove-filter="marca" aria-label="Quitar filtro de marca ' + esc(BRAND_BY_ID[filters.marca].nombre) + '">' + esc(BRAND_BY_ID[filters.marca].nombre) + "</button>");
    if (filters.genero) chips.push('<button type="button" class="fchip" data-remove-filter="genero" aria-label="Quitar filtro ' + filters.genero + '">' + filters.genero + "</button>");
    if (filters.estilo) chips.push('<button type="button" class="fchip" data-remove-filter="estilo" aria-label="Quitar filtro ' + filters.estilo + '">' + filters.estilo + "</button>");
    if (filters.fav) chips.push('<button type="button" class="fchip" data-remove-filter="fav" aria-label="Quitar filtro de favoritos">Favoritos</button>');
    if (filters.q) chips.push('<button type="button" class="fchip" data-remove-filter="q" aria-label="Quitar búsqueda">“' + esc(filters.q) + "”</button>");
    if (chips.length > 1) chips.push('<button type="button" class="link-btn" data-reset-filters>Limpiar todo</button>');
    $("[data-active-filters]").innerHTML = chips.join("");

    if (typeof shown !== "number") return;   // solo se actualizaron contadores
    var label;
    if (!shown) label = "Sin resultados";
    else if (!filters.marca && !filters.genero && !filters.estilo && !filters.fav && !filters.q) label = plural(shown, "fragancia", "fragancias") + " de " + plural(BRANDS.length, "marca", "marcas");
    else label = plural(shown, "resultado", "resultados");
    $("[data-result-count]").textContent = label;
  }

  function renderCatalog(opts) {
    opts = opts || {};
    var items = sortItems(PRODUCTS.filter(function (p) { return matches(p); }));
    var grouped = !filters.q && !filters.marca && !filters.fav && !filters.estilo && filters.sort === "destacados";
    var limit = previewLimit();
    lastLimit = limit;
    var html = "";
    var n = 0;

    function grid(list) {
      return '<div class="grid">' + list.map(function (p) { return cardHTML(p, { i: Math.min(n++, 12) }); }).join("") + "</div>";
    }

    if (grouped) {
      BRANDS.forEach(function (b) {
        var list = items.filter(function (p) { return p.marcaId === b.id; });
        if (!list.length) return;
        var show = list.length <= limit + 1 ? list : list.slice(0, limit);
        html += '<section class="bgroup" aria-labelledby="g-' + b.id + '">' +
          '<header class="bgroup__head"><div class="bgroup__title"><h3 id="g-' + b.id + '">' + esc(b.nombre) + "</h3><span>" + plural(list.length, "fragancia", "fragancias") + "</span></div>" +
          (show.length < list.length ? '<button type="button" class="link-arrow" data-brand-link="' + b.id + '">Ver las ' + list.length + "</button>" : "") +
          "</header>" + grid(show) + "</section>";
      });
    } else if (filters.marca && items.length) {
      var brand = BRAND_BY_ID[filters.marca];
      html = '<section class="bgroup" aria-labelledby="g-sel">' +
        '<button type="button" class="link-btn bgroup__back" data-brand-set="">← Todas las marcas</button>' +
        '<header class="bgroup__head"><div class="bgroup__title"><h3 id="g-sel">' + esc(brand.nombre) + "</h3><span>" + plural(items.length, "fragancia", "fragancias") + "</span></div></header>" +
        grid(items) + "</section>";
    } else if (items.length) {
      html = '<section class="bgroup" aria-label="Resultados">' + grid(items) + "</section>";
    }

    var results = $("[data-catalog]");
    results.innerHTML = html;
    if (opts.fresh && !reduceMotion) {
      results.classList.remove("is-fresh");
      void results.offsetWidth;
      results.classList.add("is-fresh");
    }

    var empty = $("[data-empty]");
    empty.hidden = items.length > 0;
    $("[data-empty-fav]").hidden = !(filters.fav && !Object.keys(favs).length);
    $("[data-empty-default]").hidden = !$("[data-empty-fav]").hidden;
    if (!items.length) {
      $("[data-empty-term]").textContent = filters.q ? "“" + filters.q + "”" : "perfumes con esos filtros";
      $("[data-empty-wa]").href = waUrl(filters.q
        ? 'Hola Le Perfam! Busco el perfume "' + filters.q + '". ¿Lo pueden conseguir?'
        : "Hola Le Perfam! Busco un perfume que no encontré en el catálogo.");
    }
    renderFilters(items.length);
  }

  function scrollToResults() {
    var target = $(".catalog__layout");
    var header = $("[data-header]").offsetHeight;
    var y = target.getBoundingClientRect().top + window.scrollY - header - 8;
    if (Math.abs(window.scrollY - y) > 40) window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function update(changes, opts) {
    Object.keys(changes).forEach(function (k) { filters[k] = changes[k]; });
    if (filters.marca && !BRAND_BY_ID[filters.marca]) filters.marca = "";
    syncUrl();
    renderCatalog({ fresh: true });
    if (opts && opts.scroll) scrollToResults();
  }

  function syncUrl() {
    try {
      var url = new URL(window.location.href);
      var map = { marca: filters.marca, buscar: filters.q, genero: filters.genero, estilo: filters.estilo, orden: filters.sort === "destacados" ? "" : filters.sort };
      Object.keys(map).forEach(function (k) { if (map[k]) url.searchParams.set(k, map[k]); else url.searchParams.delete(k); });
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) { /* algunos visores no permiten cambiar la dirección */ }
  }

  function readUrl() {
    var params;
    try { params = new URLSearchParams(window.location.search); } catch (e) { return false; }
    var changed = false;
    var marca = params.get("marca");
    if (marca && BRAND_BY_ID[slug(marca)]) { filters.marca = slug(marca); changed = true; }
    var q = params.get("buscar");
    if (q) { filters.q = q.slice(0, 60); $("[data-search]").value = filters.q; changed = true; }
    var g = params.get("genero");
    if (g) {
      var match = GENDERS.filter(function (x) { return x[0] && norm(x[0]) === norm(g); })[0];
      if (match) { filters.genero = match[0]; changed = true; }
    }
    var es = params.get("estilo");
    if (es) {
      var em = ESTILOS.filter(function (x) { return norm(x[0]) === norm(es); })[0];
      if (em) { filters.estilo = em[0]; changed = true; }
    }
    var o = params.get("orden");
    if (o && SORTS.some(function (s) { return s[0] === o; })) { filters.sort = o; changed = true; }
    return changed;
  }

  /* ---------- Aviso al agregar ---------- */
  var toastEl = $("[data-toast]");
  var toastTimer = null;
  function showToast(p) {
    $("[data-toast-title]").textContent = "Agregaste " + p.nombre;
    $("[data-toast-meta]").textContent = plural(count(), "perfume", "perfumes") + " en tu encargo · " + money(total());
    toastEl.hidden = false;
    toastEl.style.animation = "none"; void toastEl.offsetWidth; toastEl.style.animation = "";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4000);
  }
  function hideToast() { toastEl.hidden = true; }
  toastEl.addEventListener("mouseenter", function () { clearTimeout(toastTimer); });
  toastEl.addEventListener("mouseleave", function () { toastTimer = setTimeout(hideToast, 1800); });

  /* ---------- Panel del encargo ---------- */
  var drawer = $("[data-drawer]");
  var panel = $(".drawer__panel");
  var bagBtn = $(".bag-btn");
  var lastFocus = null;
  var closeTimer = null;

  function openCart() {
    clearTimeout(closeTimer);
    hideToast();
    closeMenu();
    if (!drawer.hidden && drawer.classList.contains("is-open")) return;
    lastFocus = document.activeElement;
    drawer.hidden = false;
    void drawer.offsetWidth;
    drawer.classList.add("is-open");
    document.documentElement.classList.add("no-scroll", "cart-open");
    bagBtn.setAttribute("aria-expanded", "true");
    setTimeout(function () { panel.focus({ preventScroll: true }); }, 60);
  }

  function closeCart(restoreFocus) {
    if (drawer.hidden) return false;
    drawer.classList.remove("is-open");
    document.documentElement.classList.remove("no-scroll", "cart-open");
    bagBtn.setAttribute("aria-expanded", "false");
    closeTimer = setTimeout(function () { drawer.hidden = true; }, reduceMotion ? 0 : 450);
    if (restoreFocus !== false && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    return true;
  }

  // Mantiene el foco dentro del panel mientras está abierto
  panel.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var focusables = $$('a[href], button:not([disabled]), input:not([type="hidden"]), textarea, select', panel)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  var form = $("[data-checkout]");
  var fNombre = $("#c-nombre");
  var fLocalidad = $("#c-localidad");
  var fNota = $("#c-nota");

  function zona() { var r = $('input[name="zona"]:checked', form); return r ? r.value : ""; }

  function loadDatos() {
    var d = storeGet(KEY_DATOS) || {};
    if (d.nombre) fNombre.value = String(d.nombre).slice(0, 80);
    if (d.localidad) fLocalidad.value = String(d.localidad).slice(0, 80);
    if (d.zona) { var r = $('input[name="zona"][value="' + d.zona.replace(/"/g, "") + '"]', form); if (r) r.checked = true; }
    toggleLocalidad();
  }

  function saveDatos() {
    storeSet(KEY_DATOS, { nombre: fNombre.value.trim(), zona: zona(), localidad: fLocalidad.value.trim() });
  }

  function toggleLocalidad() { $("[data-localidad-field]").hidden = zona() !== "otra"; }

  function setError(input, errId, on) {
    $("#" + errId).hidden = !on;
    if (input) input.setAttribute("aria-invalid", on ? "true" : "false");
  }

  function validate() {
    var bad = [];
    var okNombre = fNombre.value.trim().length >= 2;
    setError(fNombre, "c-nombre-err", !okNombre);
    if (!okNombre) bad.push(fNombre);
    var z = zona();
    $(".choices", form).classList.toggle("is-invalid", !z);
    $("#c-zona-err").hidden = !!z;
    if (!z) bad.push($('input[name="zona"]', form));
    if (z === "otra") {
      var okLoc = fLocalidad.value.trim().length >= 2;
      setError(fLocalidad, "c-localidad-err", !okLoc);
      if (!okLoc) bad.push(fLocalidad);
    } else {
      setError(fLocalidad, "c-localidad-err", false);
    }
    return bad;
  }

  function orderMessage() {
    var ids = Object.keys(cart);
    var lines = ["Hola Le Perfam! Quiero hacer este encargo:", ""];
    ids.forEach(function (id, i) {
      var p = BY_ID[id];
      lines.push((i + 1) + ". " + p.nombre + " (" + p.marca + ")");
      lines.push("   " + cart[id] + " x " + money(p.precio) + " = " + money(p.precio * cart[id]));
    });
    lines.push("", "*Total estimado: " + money(total()) + "* (" + plural(count(), "perfume", "perfumes") + ")", "");
    var nombre = fNombre.value.trim();
    var z = zona();
    var entrega = z === "otra" ? (fLocalidad.value.trim() || "otra localidad") + ", Córdoba" : z;
    if (nombre) lines.push("Nombre: " + nombre);
    if (entrega) lines.push("Lo recibo en: " + entrega);
    if (fNota.value.trim()) lines.push("Nota: " + fNota.value.trim());
    lines.push("", "Pedido armado en la web. Espero la confirmación de disponibilidad y precio.");
    return lines.join("\n");
  }

  function updateWaOrder() { $("[data-wa-order]").href = waUrl(orderMessage()); }

  function renderCart() {
    var ids = Object.keys(cart);
    var n = count();
    var list = $("[data-order-list]");
    list.innerHTML = ids.map(function (id) {
      var p = BY_ID[id];
      var thumb = "<span>" + esc(p.ini) + "</span>" + (p.foto ? '<img data-thumb src="' + esc(p.foto) + '" alt="" width="72" height="72" loading="lazy">' : "");
      return '<li class="order__item">' +
        '<div class="order__thumb" data-g="' + esc(p.genero) + '" aria-hidden="true">' + thumb + "</div>" +
        "<div>" +
        '<p class="order__brand">' + esc(p.marca) + "</p>" +
        '<p class="order__name">' + esc(p.nombre) + "</p>" +
        '<p class="order__unit">' + money(p.precio) + " c/u" + (p.antes ? " · promo" : "") + "</p>" +
        '<div class="order__row">' +
        '<div class="qty" role="group" aria-label="Cantidad de ' + esc(p.nombre) + '">' +
        '<button type="button" data-dec="' + id + '" aria-label="Quitar uno">−</button>' +
        '<span aria-live="polite">' + cart[id] + "</span>" +
        '<button type="button" data-inc="' + id + '" aria-label="Sumar uno"' + (cart[id] >= MAX_QTY ? " disabled" : "") + ">+</button></div>" +
        '<button type="button" class="link-btn order__remove" data-remove="' + id + '">Quitar</button>' +
        '<span class="order__sub">' + money(p.precio * cart[id]) + "</span>" +
        "</div></div></li>";
    }).join("");

    var hasItems = ids.length > 0;
    $("[data-order-empty]").hidden = hasItems;
    form.hidden = !hasItems;
    $("[data-order-foot]").hidden = !hasItems;
    $("[data-drawer-count]").textContent = n ? "(" + n + ")" : "";
    $("[data-summary-label]").textContent = plural(n, "perfume", "perfumes");
    $("[data-summary-sub]").textContent = money(total());
    $("[data-summary-total]").textContent = money(total());

    var badge = $("[data-cart-count]");
    badge.textContent = n;
    badge.hidden = n === 0;
    bagBtn.setAttribute("aria-label", n ? "Ver tu encargo, " + plural(n, "perfume", "perfumes") : "Ver tu encargo");

    var bar = $("[data-bagbar]");
    bar.hidden = n === 0;
    $("[data-bagbar-meta]").textContent = n ? plural(n, "perfume", "perfumes") + " · " + money(total()) : "";
    document.documentElement.classList.toggle("has-bagbar", n > 0);

    resetClear();
    updateWaOrder();
  }

  function bump() {
    var badge = $("[data-cart-count]");
    badge.classList.remove("is-bump"); void badge.offsetWidth; badge.classList.add("is-bump");
  }

  function resetClear() {
    $("[data-clear-ask]").hidden = false;
    $("[data-clear-confirm]").hidden = true;
  }

  form.addEventListener("input", function (e) {
    if (e.target === fNombre && fNombre.getAttribute("aria-invalid") === "true") setError(fNombre, "c-nombre-err", fNombre.value.trim().length < 2);
    if (e.target === fLocalidad && fLocalidad.getAttribute("aria-invalid") === "true") setError(fLocalidad, "c-localidad-err", fLocalidad.value.trim().length < 2);
    saveDatos();
    updateWaOrder();
  });
  form.addEventListener("change", function (e) {
    if (e.target.name === "zona") {
      toggleLocalidad();
      $(".choices", form).classList.remove("is-invalid");
      $("#c-zona-err").hidden = true;
    }
    saveDatos();
    updateWaOrder();
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  $("[data-wa-order]").addEventListener("click", function (e) {
    var bad = validate();
    if (bad.length) {
      e.preventDefault();
      bad[0].focus();
      bad[0].scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    updateWaOrder();
    track("encargo/enviar");
  });

  /* ---------- Foto ampliada ---------- */
  var lb = $("[data-lightbox]");
  var lbImg = $("[data-lb-img]");
  var gallery = null;
  var lbLastFocus = null;

  function showLb() {
    var p = gallery.product;
    lbImg.src = gallery.items[gallery.index];
    lbImg.alt = p.nombre + " de " + p.marca + (gallery.items.length > 1 ? ", foto " + (gallery.index + 1) : "");
    $("[data-lb-caption]").textContent = p.nombre + " · " + p.marca;
    var many = gallery.items.length > 1;
    $("[data-lb-prev]").hidden = !many;
    $("[data-lb-next]").hidden = !many;
    $("[data-lb-counter]").hidden = !many;
    $("[data-lb-counter]").textContent = (gallery.index + 1) + " / " + gallery.items.length;
  }

  // Muestra todas las fotos del perfume (principal + adicionales)
  function openLightbox(btn) {
    var p = BY_ID[btn.getAttribute("data-zoom")];
    if (!p || !p.foto) return;
    var items = [p.foto].concat(p.extras);
    var start = parseInt(btn.getAttribute("data-zoom-i"), 10) || 0;
    gallery = { product: p, items: items, index: start >= 0 && start < items.length ? start : 0 };
    lbLastFocus = btn;
    showLb();
    lb.hidden = false;
    document.documentElement.classList.add("no-scroll");
    $("[data-lb-close]").focus();
  }

  function stepLb(d) {
    if (!gallery || gallery.items.length < 2) return;
    gallery.index = (gallery.index + d + gallery.items.length) % gallery.items.length;
    showLb();
  }

  function closeLightbox() {
    if (lb.hidden) return false;
    lb.hidden = true;
    lbImg.src = "data:,";
    gallery = null;
    if (drawer.hidden && ficha.hidden && !nav.classList.contains("is-open")) document.documentElement.classList.remove("no-scroll");
    if (lbLastFocus && document.contains(lbLastFocus)) lbLastFocus.focus({ preventScroll: true });
    return true;
  }

  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lightbox__figure")) closeLightbox(); });
  var touchX = null;
  lb.addEventListener("touchstart", function (e) { touchX = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 45) stepLb(dx < 0 ? 1 : -1);
  });

  /* ---------- Ficha del perfume (se abre desde la tarjeta con un giro 3D) ---------- */
  var ficha = $("[data-ficha]");
  var fichaPanel = $(".ficha__panel");
  var fichaBody = $("[data-ficha-body]");
  var fichaLast = null, fichaTimer = null;

  function cap(t) { t = String(t || ""); return t.charAt(0).toUpperCase() + t.slice(1); }

  function notasHTML(p) {
    var n = p.notas;
    var rows = n ? [["Salida", n.salida, "Lo primero que se siente"], ["Corazón", n.corazon, "Aparece a los pocos minutos"], ["Fondo", n.fondo, "Lo que queda en la piel"]]
      .filter(function (r) { return r[1] && r[1].length; }) : [];
    var html;
    if (rows.length) {
      html = '<div class="pyramid">' + rows.map(function (r, i) {
        return '<div class="pyramid__row" style="--i:' + i + '"><p class="pyramid__label"><strong>' + r[0] + "</strong><span>" + r[2] + "</span></p>" +
          '<ul class="pyramid__notes">' + r[1].map(function (x) { return "<li>" + esc(cap(x)) + "</li>"; }).join("") + "</ul></div>";
      }).join("") + "</div>";
    } else if (n && n.notas && n.notas.length) {
      html = '<ul class="pyramid__notes pyramid__notes--flat">' + n.notas.map(function (x) { return "<li>" + esc(cap(x)) + "</li>"; }).join("") + "</ul>";
    } else {
      return '<p class="ficha__nonotes">Todavía no tenemos las notas de este perfume. Consultanos por WhatsApp y te contamos cómo es.</p>';
    }
    if (n.fuente) {
      var safeUrl = /^https:\/\//.test(n.url || "") ? n.url : "";
      html += '<p class="ficha__source">Notas según ' + (safeUrl ? '<a href="' + esc(safeUrl) + '" target="_blank" rel="noopener">' + esc(n.fuente) + "</a>" : esc(n.fuente)) + ".</p>";
    }
    return html;
  }

  function fichaHTML(p) {
    var photos = p.foto ? [p.foto].concat(p.extras) : [];
    var media = p.foto
      ? '<button type="button" class="ficha__photo" data-zoom="' + p.id + '" data-zoom-i="0" aria-label="Ampliar la foto de ' + esc(p.nombre) + '"><img src="' + esc(p.foto) + '" data-fimg="' + p.id + '" alt="' + esc(p.nombre + " de " + p.marca) + '" width="800" height="800"></button>'
      : '<div class="ficha__photo ficha__photo--label">' + labelHTML(p) + "</div>";
    var thumbs = photos.length > 1 ? '<div class="ficha__thumbs">' + photos.map(function (src, i) {
      return '<button type="button" class="ficha__thumb" data-fthumb-i="' + i + '" aria-label="Ver la foto ' + (i + 1) + ' de ' + photos.length + '" aria-pressed="' + (i === 0) + '"><img src="' + esc(src) + '" data-fthumb alt="" width="160" height="160" loading="lazy"></button>';
    }).join("") + "</div>" : "";
    var meta = [p.genero];
    if (p.notas && p.notas.familia) meta.push(p.notas.familia);
    var styles = p.estilos.length ? '<div class="ficha__styles"><span class="ficha__styles-label">Estilo</span>' + p.estilos.map(function (e) {
      return '<button type="button" class="stylechip" data-style-go="' + e + '" title="Ver todos los perfumes de estilo ' + e.toLowerCase() + '">' + e + "</button>";
    }).join("") + "</div>" : "";
    var badges = (p.antes ? '<span class="badge badge--promo">Promo −' + Math.round((1 - p.precio / p.antes) * 100) + "%</span>" : "") + (p.nuevo ? '<span class="badge badge--new">Nuevo</span>' : "");
    return '<div class="ficha__media">' + media + thumbs + "</div>" +
      '<div class="ficha__info">' +
      (badges ? '<div class="ficha__badges">' + badges + "</div>" : "") +
      '<p class="ficha__brand">' + esc(p.marca) + "</p>" +
      '<h2 class="ficha__title" id="ficha-title">' + esc(p.nombre) + "</h2>" +
      '<p class="ficha__meta">' + esc(meta.join(" · ")) + "</p>" +
      styles +
      '<p class="ficha__price"><span class="price' + (p.antes ? " price--promo" : "") + '">' + money(p.precio) + "</span>" + (p.antes ? "<s>" + money(p.antes) + "</s>" : "") + "</p>" +
      '<p class="ficha__fine">Por encargo · precio sujeto a cambio y a disponibilidad</p>' +
      '<div class="ficha__actions"><div data-ctrl="' + p.id + '" style="display:contents">' + ctrlHTML(p) + "</div>" + favBtnHTML(p) +
      '<a class="consult" href="' + consultUrl(p) + '" target="_blank" rel="noopener" aria-label="Consultar ' + esc(p.nombre) + ' por WhatsApp" title="Consultar por WhatsApp">' + ICON.wa + "</a></div>" +
      '<h3 class="ficha__h">Notas del perfume</h3>' + notasHTML(p) +
      "</div>";
  }

  function openFicha(id, origin) {
    var p = BY_ID[id];
    if (!p) return;
    clearTimeout(fichaTimer);
    hideToast();
    closeMenu();
    fichaBody.innerHTML = fichaHTML(p);
    fichaBody.scrollTop = 0;
    fichaLast = origin || document.activeElement;
    var from = origin && origin.closest ? origin.closest(".pcard, .vtile") : null;
    var a = from && !reduceMotion && fichaPanel.animate ? from.getBoundingClientRect() : null;
    if (from) resetTilt(from);
    ficha.hidden = false;
    document.documentElement.classList.add("no-scroll");
    var flip = !!(a && a.width && a.bottom > 0 && a.top < window.innerHeight);
    ficha.classList.toggle("is-flip", flip);
    ficha.classList.add("is-open");
    if (flip) {
      // La ficha sale de la tarjeta: se agranda girando sobre su eje vertical
      var b = fichaPanel.getBoundingClientRect();
      var dx = (a.left + a.width / 2) - (b.left + b.width / 2);
      var dy = (a.top + a.height / 2) - (b.top + b.height / 2);
      fichaPanel.animate([
        { transform: "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) scale(" + (a.width / b.width).toFixed(3) + "," + (a.height / b.height).toFixed(3) + ") rotateY(-75deg)", opacity: 0.2 },
        { transform: "translate(" + (dx * 0.22).toFixed(1) + "px," + (dy * 0.22).toFixed(1) + "px) scale(.93) rotateY(14deg)", opacity: 1, offset: 0.62 },
        { transform: "none", opacity: 1 }
      ], { duration: 760, easing: "cubic-bezier(.22,.61,.36,1)" });
    }
    setTimeout(function () { var c = $(".ficha__close"); if (c && !ficha.hidden) c.focus({ preventScroll: true }); }, 60);
    track("ficha/" + id);
  }

  function closeFicha(restore) {
    if (ficha.hidden) return false;
    ficha.classList.remove("is-open");
    fichaTimer = setTimeout(function () {
      ficha.hidden = true; fichaBody.innerHTML = "";
      if (drawer.hidden && !nav.classList.contains("is-open")) document.documentElement.classList.remove("no-scroll");
    }, reduceMotion ? 0 : 280);
    if (restore !== false && fichaLast && fichaLast.focus && document.contains(fichaLast)) fichaLast.focus({ preventScroll: true });
    return true;
  }

  function fichaThumb(i) {
    var photo = $(".ficha__photo", fichaBody);
    var img = photo && $("img", photo);
    var thumbs = $$(".ficha__thumb", fichaBody);
    var src = thumbs[i] && $("img", thumbs[i]);
    if (!img || !src) return;
    img.src = src.getAttribute("src");
    photo.setAttribute("data-zoom-i", i);
    thumbs.forEach(function (t, k) { t.setAttribute("aria-pressed", k === i ? "true" : "false"); });
  }

  // El foco queda dentro de la ficha mientras está abierta
  fichaPanel.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = $$('a[href], button:not([disabled])', fichaPanel).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  /* ---------- Test: ¿Qué perfume va con vos? ---------- */
  var quizEl = $("[data-quiz]");
  var quiz = { step: 0, para: "", aromas: [], momento: "", tope: 0 };
  var BUDGETS = (function () {
    var pr = PRODUCTS.map(function (p) { return p.precio; }).filter(Boolean).sort(function (a, b) { return a - b; });
    function up(n) { return Math.ceil(n / 5000) * 5000; }
    var a = up(pr[Math.floor(pr.length * 0.34)] || 0), b = up(pr[Math.floor(pr.length * 0.7)] || 0);
    var out = [];
    if (a) out.push([a, "Hasta " + money(a)]);
    if (b && b > a) out.push([b, "Hasta " + money(b)]);
    out.push([0, "Me da igual"]);
    return out;
  })();
  var QUIZ_STEPS = 4;

  function quizOption(attr, value, label, sub, pressed) {
    return '<button type="button" class="qopt" ' + attr + '="' + esc(value) + '" aria-pressed="' + (pressed ? "true" : "false") + '"><strong>' + esc(label) + "</strong>" + (sub ? "<span>" + esc(sub) + "</span>" : "") + "</button>";
  }

  function renderQuiz() {
    if (!quizEl) return;
    var s = quiz.step, html = "";
    var dots = '<ol class="quiz__dots" aria-label="Paso ' + Math.min(s + 1, QUIZ_STEPS) + ' de ' + QUIZ_STEPS + '">' + [0, 1, 2, 3].map(function (i) {
      return '<li class="' + (i < s ? "is-done" : i === s ? "is-now" : "") + '"></li>';
    }).join("") + "</ol>";
    if (s === 0) {
      html = '<p class="quiz__q">¿Para quién es?</p><div class="quiz__opts">' +
        quizOption("data-q-para", "Mujer", "Para mujer", "", quiz.para === "Mujer") +
        quizOption("data-q-para", "Hombre", "Para hombre", "", quiz.para === "Hombre") +
        quizOption("data-q-para", "Unisex", "Unisex", "", quiz.para === "Unisex") +
        quizOption("data-q-para", "todos", "Me da igual", "", quiz.para === "todos") + "</div>";
    } else if (s === 1) {
      html = '<p class="quiz__q">¿Qué aromas te gustan?</p><p class="quiz__hint">Elegí uno o dos.</p><div class="quiz__opts quiz__opts--grid">' +
        ESTILOS.map(function (x) { return quizOption("data-q-aroma", x[0], x[0], x[1], quiz.aromas.indexOf(x[0]) !== -1); }).join("") +
        '</div><div class="quiz__nav"><button type="button" class="link-btn" data-q-back>Volver</button><button type="button" class="btn btn--ink" data-q-next' + (quiz.aromas.length ? "" : " disabled") + ">Siguiente</button></div>";
    } else if (s === 2) {
      html = '<p class="quiz__q">¿Para cuándo lo querés?</p><div class="quiz__opts">' +
        quizOption("data-q-momento", "dia", "De día", "Trabajo, salidas de tarde", quiz.momento === "dia") +
        quizOption("data-q-momento", "noche", "De noche", "Cenas, salidas, ocasiones especiales", quiz.momento === "noche") +
        quizOption("data-q-momento", "todo", "Para todo momento", "", quiz.momento === "todo") +
        '</div><div class="quiz__nav"><button type="button" class="link-btn" data-q-back>Volver</button></div>';
    } else if (s === 3) {
      html = '<p class="quiz__q">¿Cuánto querés gastar?</p><div class="quiz__opts">' +
        BUDGETS.map(function (b) { return quizOption("data-q-tope", String(b[0]), b[1], "", quiz.tope === b[0] && quiz.step > 3); }).join("") +
        '</div><div class="quiz__nav"><button type="button" class="link-btn" data-q-back>Volver</button></div>';
    } else {
      html = quizResultsHTML();
    }
    quizEl.innerHTML = (s < QUIZ_STEPS ? dots : "") + '<div class="quiz__step" data-q-step>' + html + "</div>";
    observeReveal(quizEl);
  }

  function quizMatches(relax) {
    var list = PRODUCTS.filter(function (p) {
      if (p.agotado || !p.estilos.length) return false;
      if (quiz.para === "Mujer" && p.genero === "Hombre") return false;
      if (quiz.para === "Hombre" && p.genero === "Mujer") return false;
      if (quiz.para === "Unisex" && p.genero !== "Unisex") return false;
      if (!relax.precio && quiz.tope && p.precio > quiz.tope) return false;
      return true;
    }).map(function (p) {
      var sc = 0;
      if (quiz.aromas.indexOf(p.estilos[0]) !== -1) sc += 3;
      if (p.estilos[1] && quiz.aromas.indexOf(p.estilos[1]) !== -1) sc += 2;
      if (!sc) return null;
      if (!relax.momento && quiz.momento !== "todo") {
        if (p.momento === quiz.momento) sc += 1.5;
        else if (p.momento === "ambos") sc += 0.8;
      }
      if (p.foto) sc += 0.2;
      if (quiz.para === "Mujer" || quiz.para === "Hombre") { if (p.genero === quiz.para) sc += 0.3; }
      return { p: p, sc: sc };
    }).filter(Boolean);
    list.sort(function (a, b) { return b.sc - a.sc || a.p.index - b.p.index; });
    // Con dos aromas elegidos se alternan: primero los que tienen los dos, después uno de cada uno
    if (quiz.aromas.length === 2) {
      var both = [], g0 = [], g1 = [];
      list.forEach(function (x) {
        var has0 = x.p.estilos.indexOf(quiz.aromas[0]) !== -1, has1 = x.p.estilos.indexOf(quiz.aromas[1]) !== -1;
        (has0 && has1 ? both : has0 ? g0 : g1).push(x);
      });
      list = both;
      for (var i = 0; i < Math.max(g0.length, g1.length); i++) {
        if (g0[i]) list.push(g0[i]);
        if (g1[i]) list.push(g1[i]);
      }
    }
    return list.map(function (x) { return x.p; });
  }

  function quizResultsHTML() {
    var relaxed = false;
    var res = quizMatches({});
    if (res.length < 3) { var r2 = quizMatches({ precio: true }); if (r2.length > res.length) { res = r2; relaxed = true; } }
    res = res.slice(0, 6);
    var aromas = quiz.aromas.map(function (a) { return a.toLowerCase(); }).join(" y ");
    var para = quiz.para === "todos" ? "" : quiz.para === "Unisex" ? " unisex" : " para " + quiz.para.toLowerCase();
    var tope = quiz.tope ? ", hasta " + money(quiz.tope) : "";
    var head = res.length
      ? '<p class="quiz__q">Te pueden gustar</p><p class="quiz__hint">Perfumes de estilo ' + esc(aromas) + esc(para) + (relaxed ? "" : esc(tope)) + "." + (relaxed ? " En tu presupuesto había pocos, así que sumamos algunos que lo superan." : "") + ' Lo de día o de noche es una sugerencia según el estilo.</p>'
      : '<p class="quiz__q">No encontramos perfumes con esas respuestas</p><p class="quiz__hint">Escribinos por WhatsApp y te recomendamos uno por encargo.</p>';
    var msg = "Hola Le Perfam! Hice el test de la web. Busco un perfume" + (para || "") + ", de estilo " + aromas + ", " +
      (quiz.momento === "dia" ? "para el día" : quiz.momento === "noche" ? "para la noche" : "para todo momento") + (quiz.tope ? ", hasta " + money(quiz.tope) : "") + ". ¿Qué me recomiendan?";
    return head + (res.length ? '<div class="grid quiz__grid">' + res.map(function (p, i) { return cardHTML(p, { i: i }); }).join("") + "</div>" : "") +
      '<div class="quiz__nav quiz__nav--end"><button type="button" class="btn btn--glass" data-q-restart>Hacer el test de nuevo</button>' +
      (quiz.aromas.length === 1 ? '<button type="button" class="btn btn--glass" data-style-go="' + esc(quiz.aromas[0]) + '">Ver todos los ' + esc(aromas) + "s</button>" : "") +
      '<a class="btn btn--ink" href="' + waUrl(msg) + '" target="_blank" rel="noopener">' + ICON.wa.replace("<svg ", '<svg class="wa-glyph" ') + "Pedir una recomendación</a></div>";
  }

  function quizGo(step) {
    quiz.step = step;
    renderQuiz();
    if (step >= QUIZ_STEPS) track("test/resultado");
    var top = quizEl.getBoundingClientRect().top;
    if (top < 60 || top > window.innerHeight * 0.6) {
      var y = top + window.scrollY - $("[data-header]").offsetHeight - 24;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    }
    var first = $(".qopt, .quiz__grid .pcard__link", quizEl);
    if (first) first.focus({ preventScroll: true });
  }

  /* ---------- Cuenta regresiva de la promo ---------- */
  function initCountdown() {
    var P = DATA.promo || {};
    var el = $("[data-countdown]");
    if (!promoOn || !P.fecha || !el) return;
    var target = new Date(P.fecha + "T00:00:00-03:00");
    var hasta = P.encargarHasta ? new Date(P.encargarHasta + "T23:59:59-03:00") : null;
    if (isNaN(target)) return;
    var evento = String(P.evento || P.titulo || "").replace(/^promo\s+/i, "");
    var fmt = function (d) {
      try { return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Argentina/Cordoba" }); } catch (e) { return d.toLocaleDateString(); }
    };
    var ann = $("[data-announce-count]");
    function unit(n, one, many) { return '<span class="countdown__unit"><b>' + (n < 10 ? "0" : "") + n + "</b><small>" + (n === 1 ? one : many) + "</small></span>"; }
    function tick() {
      var ms = target - Date.now();
      if (ms <= 0) { el.hidden = true; if (ann) ann.hidden = true; return; }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
      el.innerHTML = '<p class="countdown__label">Faltan para el ' + esc(evento) + ' <span>(' + esc(fmt(target)) + ")</span></p>" +
        '<div class="countdown__units">' + unit(d, "día", "días") + unit(h, "hora", "horas") + unit(m, "minuto", "minutos") + "</div>" +
        (hasta && hasta > Date.now() ? '<p class="countdown__note">Encargá hasta el ' + esc(fmt(hasta)) + " para recibirlo a tiempo.</p>" : "");
      el.hidden = false;
      if (ann) { ann.textContent = d >= 1 ? " · faltan " + plural(d, "día", "días") : " · ¡faltan menos de 24 horas!"; ann.hidden = false; }
      setTimeout(tick, 30000);
    }
    tick();
  }

  /* ---------- El perfume vuela al encargo ---------- */
  function flyToBag(from) {
    var bag = $(".bag-btn");
    if (reduceMotion || !from || !bag || !document.body.animate) return false;
    var img = $(".pcard__zoom img, .ficha__photo img", from) || $(".label__tag", from);
    var r = (img || from).getBoundingClientRect(), d = bag.getBoundingClientRect();
    if (!r.width || !d.width || r.bottom < 0 || r.top > window.innerHeight) return false;
    var clone = img && img.tagName === "IMG" ? img.cloneNode() : document.createElement("div");
    clone.removeAttribute("data-pid"); clone.removeAttribute("data-fimg"); clone.removeAttribute("loading");
    clone.className = "fly";
    clone.setAttribute("aria-hidden", "true");
    var size = Math.min(r.width, r.height, 220);
    clone.style.cssText = "left:" + (r.left + r.width / 2 - size / 2) + "px;top:" + (r.top + r.height / 2 - size / 2) + "px;width:" + size + "px;height:" + size + "px";
    document.body.appendChild(clone);
    var dx = d.left + d.width / 2 - (r.left + r.width / 2), dy = d.top + d.height / 2 - (r.top + r.height / 2);
    var s = Math.max(0.12, 30 / size);
    var anim = clone.animate([
      { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
      { transform: "translate(" + (dx * 0.5) + "px," + (dy * 0.5 - 90) + "px) scale(" + Math.min(0.9, s * 3) + ") rotate(-10deg)", opacity: 1, offset: 0.55 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ") rotate(-18deg)", opacity: 0.4 }
    ], { duration: 820, easing: "cubic-bezier(.45,0,.25,1)" });
    var done = false;
    function land() { if (done) return; done = true; clone.remove(); bump(); }
    anim.onfinish = land;
    setTimeout(land, 1500);   // por si la pestaña quedó en segundo plano y la animación no terminó
    return true;
  }

  /* ---------- Tarjetas que se inclinan con el mouse ---------- */
  var finePointer = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  var tiltCard = null, tiltRaf = 0, tiltEv = null;
  function resetTilt(c) {
    if (!c) return;
    c.classList.remove("is-tilt");
    ["--rx", "--ry", "--gx", "--gy"].forEach(function (k) { c.style.removeProperty(k); });
    if (tiltCard === c) tiltCard = null;
  }
  if (finePointer && !reduceMotion) {
    document.addEventListener("pointermove", function (e) {
      tiltEv = e;
      if (tiltRaf) return;
      tiltRaf = requestAnimationFrame(function () {
        tiltRaf = 0;
        var t = tiltEv.target;
        var card = t && t.closest ? t.closest(".pcard") : null;
        if (card && card.closest(".ficha")) card = null;
        if (card !== tiltCard) { resetTilt(tiltCard); tiltCard = card; }
        if (!card) return;
        card.style.transitionDelay = "0s";
        var r = card.getBoundingClientRect();
        var x = clamp01((tiltEv.clientX - r.left) / r.width), y = clamp01((tiltEv.clientY - r.top) / r.height);
        card.style.setProperty("--rx", ((0.5 - y) * 9).toFixed(2) + "deg");
        card.style.setProperty("--ry", ((x - 0.5) * 11).toFixed(2) + "deg");
        card.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
        card.classList.add("is-tilt");
      });
    }, { passive: true });
    document.addEventListener("pointerleave", function () { resetTilt(tiltCard); });
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ---------- Modo noche ---------- */
  function applyTheme(night) {
    if (night) document.documentElement.setAttribute("data-tema", "noche");
    else document.documentElement.removeAttribute("data-tema");
    $$("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", night ? "true" : "false");
      if (b.title) b.title = night ? "Volver al modo día" : "Modo noche";
    });
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", night ? "#14100d" : "#efe7de");
  }
  applyTheme(document.documentElement.getAttribute("data-tema") === "noche");

  /* ---------- Menú ---------- */
  var nav = $("#site-nav");
  var menuBtn = $("[data-menu-toggle]");
  function closeMenu() {
    if (!nav.classList.contains("is-open")) return false;
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Abrir menú");
    document.documentElement.classList.remove("menu-open");
    if (drawer.hidden) document.documentElement.classList.remove("no-scroll");
    return true;
  }
  menuBtn.addEventListener("click", function () {
    if (closeMenu()) return;
    nav.style.setProperty("--nav-top", Math.max(0, $("[data-header]").getBoundingClientRect().bottom) + "px");
    nav.classList.add("is-open");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Cerrar menú");
    document.documentElement.classList.add("menu-open", "no-scroll");
  });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { closeMenu(); }); });

  /* ---------- Eventos ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a, [data-close-cart], [data-ficha-close]");
    if (!t) return;

    if (t.hasAttribute("data-add")) {
      var id = t.getAttribute("data-add");
      var scope = t.closest("[data-ctrl]");
      var flyFrom = t.closest(".pcard, .ficha__panel");
      setQty(id, qty(id) + 1);
      if (!flyToBag(flyFrom)) bump();
      if (!t.closest(".ficha")) showToast(BY_ID[id]);
      track("encargo/agregar/" + id);
      var inc = scope && $("[data-inc]", scope);
      if (inc) inc.focus({ preventScroll: true });
      return;
    }
    if (t.hasAttribute("data-inc") || t.hasAttribute("data-dec")) {
      var up = t.hasAttribute("data-inc");
      var pid = t.getAttribute(up ? "data-inc" : "data-dec");
      var inDrawer = !!t.closest("[data-order-list]");
      var ctrl = t.closest("[data-ctrl]");
      setQty(pid, qty(pid) + (up ? 1 : -1));
      if (up) bump();
      var attr = up ? "data-inc" : "data-dec";
      var next = inDrawer ? $("[data-order-list] [" + attr + '="' + pid + '"]') : ctrl && ($("[" + attr + "]", ctrl) || $("[data-add]", ctrl));
      if (next) next.focus({ preventScroll: true }); else if (inDrawer) panel.focus({ preventScroll: true });
      return;
    }
    if (t.hasAttribute("data-remove")) { setQty(t.getAttribute("data-remove"), 0); panel.focus({ preventScroll: true }); return; }
    if (t.hasAttribute("data-open-cart")) { openCart(); return; }
    if (t.hasAttribute("data-close-cart")) { closeCart(t.tagName !== "A"); return; }
    if (t.hasAttribute("data-clear-ask")) { t.hidden = true; $("[data-clear-confirm]").hidden = false; $("[data-clear-no]").focus(); return; }
    if (t.hasAttribute("data-clear-no")) { resetClear(); $("[data-clear-ask]").focus(); return; }
    if (t.hasAttribute("data-clear-yes")) {
      var ids = Object.keys(cart);
      cart = {}; storeSet(KEY_CART, cart);
      ids.forEach(refreshCtrls);
      renderCart();
      panel.focus({ preventScroll: true });
      return;
    }
    if (t.hasAttribute("data-open")) { openFicha(t.getAttribute("data-open"), t); return; }
    if (t.hasAttribute("data-fav")) { toggleFav(t.getAttribute("data-fav")); return; }
    if (t.hasAttribute("data-ficha-close")) { closeFicha(); return; }
    if (t.hasAttribute("data-fthumb-i")) { fichaThumb(parseInt(t.getAttribute("data-fthumb-i"), 10) || 0); return; }
    if (t.hasAttribute("data-zoom")) { openLightbox(t); return; }
    if (t.hasAttribute("data-lb-close")) { closeLightbox(); return; }
    if (t.hasAttribute("data-lb-prev")) { stepLb(-1); return; }
    if (t.hasAttribute("data-lb-next")) { stepLb(1); return; }

    if (t.hasAttribute("data-brand-link")) {
      e.preventDefault();
      update({ marca: t.getAttribute("data-brand-link"), q: "" }, { scroll: true });
      $("[data-search]").value = "";
      return;
    }
    if (t.hasAttribute("data-brand-set")) { update({ marca: t.getAttribute("data-brand-set") }, { scroll: true }); return; }
    if (t.hasAttribute("data-gender")) { update({ genero: t.getAttribute("data-gender") }); return; }
    if (t.hasAttribute("data-style")) { update({ estilo: t.getAttribute("data-style") }); return; }
    if (t.hasAttribute("data-style-go")) {
      closeFicha(false);
      $("[data-search]").value = "";
      update({ estilo: t.getAttribute("data-style-go"), marca: "", fav: false, q: "" }, { scroll: true });
      return;
    }
    if (t.hasAttribute("data-fav-open")) {
      closeMenu();
      $("[data-search]").value = "";
      update({ fav: true, marca: "", genero: "", estilo: "", q: "" }, { scroll: true });
      return;
    }
    if (t.hasAttribute("data-fav-toggle")) { update({ fav: !filters.fav }); return; }
    if (t.hasAttribute("data-fav-wa")) { track("favoritos/whatsapp"); return; }
    if (t.hasAttribute("data-theme-toggle")) {
      var night = document.documentElement.getAttribute("data-tema") !== "noche";
      applyTheme(night);
      try { window.localStorage.setItem("leperfam-tema", night ? "noche" : "dia"); } catch (err) { /* sin almacenamiento */ }
      return;
    }

    // Test
    if (t.hasAttribute("data-q-para")) { quiz.para = t.getAttribute("data-q-para"); quizGo(1); return; }
    if (t.hasAttribute("data-q-aroma")) {
      var ar = t.getAttribute("data-q-aroma");
      var at = quiz.aromas.indexOf(ar);
      if (at !== -1) quiz.aromas.splice(at, 1);
      else { quiz.aromas.push(ar); if (quiz.aromas.length > 2) quiz.aromas.shift(); }
      renderQuiz();
      var again = $('[data-q-aroma="' + ar + '"]', quizEl);
      if (again) again.focus({ preventScroll: true });
      return;
    }
    if (t.hasAttribute("data-q-next")) { if (quiz.aromas.length) quizGo(2); return; }
    if (t.hasAttribute("data-q-momento")) { quiz.momento = t.getAttribute("data-q-momento"); quizGo(3); return; }
    if (t.hasAttribute("data-q-tope")) { quiz.tope = parseInt(t.getAttribute("data-q-tope"), 10) || 0; quizGo(4); return; }
    if (t.hasAttribute("data-q-back")) { quizGo(Math.max(0, quiz.step - 1)); return; }
    if (t.hasAttribute("data-q-restart")) { quiz = { step: 0, para: "", aromas: [], momento: "", tope: 0 }; quizGo(0); return; }
    if (t.hasAttribute("data-remove-filter")) {
      var k = t.getAttribute("data-remove-filter");
      var ch = {}; ch[k] = k === "fav" ? false : "";
      if (k === "q") $("[data-search]").value = "";
      update(ch);
      return;
    }
    if (t.hasAttribute("data-reset-filters")) {
      $("[data-search]").value = "";
      update({ marca: "", genero: "", estilo: "", fav: false, q: "", sort: "destacados" }, { scroll: true });
      return;
    }
    if (t.hasAttribute("data-show-brands")) {
      e.preventDefault();
      scrollToResults();
      setTimeout(function () {
        var target = window.innerWidth >= 1080 ? $('.brand-opt[aria-pressed="true"]') : $("[data-brand-select]");
        if (target) target.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 600);
      return;
    }
    if (t.hasAttribute("data-search-jump")) {
      closeMenu();
      scrollToResults();
      setTimeout(function () { $("[data-search]").focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
      return;
    }
    if (t.hasAttribute("data-search-clear")) {
      $("[data-search]").value = "";
      update({ q: "" });
      $("[data-search]").focus();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!lb.hidden && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { stepLb(e.key === "ArrowRight" ? 1 : -1); return; }
    if (e.key === "Escape") {
      if (closeLightbox()) return;
      if (closeFicha()) return;
      if (closeCart()) return;
      if (closeMenu()) { menuBtn.focus(); return; }
      if (!toastEl.hidden) hideToast();
    }
  });

  $$("[data-sort]").forEach(function (sel) {
    sel.addEventListener("change", function () { update({ sort: sel.value }); });
  });
  $("[data-brand-select]").addEventListener("change", function (e) { update({ marca: e.target.value }, { scroll: true }); });

  var searchTimer = null;
  var searchInput = $("[data-search]");
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { update({ q: searchInput.value.trim().slice(0, 60) }); }, 160);
  });
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); searchInput.blur(); scrollToResults(); }
  });

  var header = $("[data-header]");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });

  // Reflejo de luz que sigue al puntero sobre el vidrio de la vitrina
  var vitrina = $(".vitrina");
  if (vitrina && !reduceMotion && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var glareFrame = 0;
    vitrina.addEventListener("pointermove", function (e) {
      if (glareFrame) return;
      glareFrame = requestAnimationFrame(function () {
        glareFrame = 0;
        var r = vitrina.getBoundingClientRect();
        vitrina.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        vitrina.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    });
    vitrina.addEventListener("pointerenter", function () { vitrina.classList.add("is-lit"); });
    vitrina.addEventListener("pointerleave", function () { vitrina.classList.remove("is-lit"); });
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth >= 960) closeMenu();
      searchInput.placeholder = window.innerWidth < 768 ? "Buscar" : "Buscar perfume o marca";
      if (previewLimit() !== lastLimit) renderCatalog();
    }, 150);
  });

  /* ---------- Inicio ---------- */
  searchInput.placeholder = window.innerWidth < 768 ? "Buscar" : "Buscar perfume o marca";
  renderStatic();
  buildControls();
  var fromUrl = readUrl();
  renderCatalog();
  loadDatos();
  renderCart();
  renderFavCount();
  renderQuiz();
  initCountdown();
  observeReveal(document);
  onScroll();

  if (fromUrl && !window.location.hash) {
    requestAnimationFrame(function () { scrollToResults(); });
  } else if (window.location.hash) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target) requestAnimationFrame(function () { target.scrollIntoView({ behavior: "auto" }); });
  }
})();
