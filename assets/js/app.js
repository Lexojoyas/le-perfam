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
        enStock: !!p.enStock, agotado: !!p.agotado,
        foto: fotoPath(p.foto, id),
        ini: initials(p.nombre)
      };
      item.search = norm([item.marca, item.nombre, item.genero, item.descripcion].join(" "));
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

  function mediaHTML(p, opts) {
    var badges = "";
    if (opts.top) badges += '<span class="badge badge--top">Más vendido</span>';
    if (p.antes) badges += '<span class="badge badge--promo">Promo −' + Math.round((1 - p.precio / p.antes) * 100) + "%</span>";
    var inner;
    if (p.foto) {
      inner = '<button type="button" class="pcard__zoom" data-zoom="' + p.id + '" aria-label="Ampliar la foto de ' + esc(p.nombre) + '">' +
        '<img src="' + esc(p.foto) + '" data-pid="' + p.id + '" alt="' + esc(p.nombre + " de " + p.marca + ", frasco y caja") + '" width="350" height="350" loading="lazy" decoding="async"></button>' +
        '<span class="pcard__zoom-ico" aria-hidden="true">' + ICON.zoom + "</span>";
    } else {
      inner = labelHTML(p);
    }
    return '<div class="pcard__media">' + inner + (badges ? '<div class="pcard__badges">' + badges + "</div>" : "") + "</div>";
  }

  function cardHTML(p, opts) {
    opts = opts || {};
    var h = opts.h || "h4";
    var meta = esc(p.genero);
    if (p.agotado) meta += ' · <span class="no">No disponible por ahora</span>';
    else if (p.enStock) meta += ' · <span class="ok">Entrega inmediata</span>';
    return '<article class="pcard' + (opts.reveal ? " reveal" : "") + '" data-g="' + esc(p.genero) + '" style="--i:' + (opts.i || 0) + ";--d:" + ((opts.i || 0) * 80) + 'ms">' +
      mediaHTML(p, opts) +
      '<div class="pcard__body">' +
      '<p class="pcard__brand">' + esc(p.marca) + "</p>" +
      "<" + h + ' class="pcard__name">' + esc(p.nombre) + "</" + h + ">" +
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
        btn.insertAdjacentHTML("afterend", labelHTML(p));
        btn.remove();
      }
      return;
    }
    if (img.hasAttribute("data-thumb")) img.remove();
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
        '<span class="idx__name">' + esc(b.nombre) + '</span><span class="idx__leader"></span><span class="idx__count">' + b.total + "</span></a></li>";
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
  var filters = { marca: "", genero: "", q: "", sort: "destacados" };
  var lastLimit = 0;

  function matches(p, ignore) {
    ignore = ignore || {};
    if (!ignore.marca && filters.marca && p.marcaId !== filters.marca) return false;
    if (!ignore.genero && filters.genero && p.genero !== filters.genero) return false;
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
  }

  function renderFilters(shown) {
    var gCounts = { "": 0, Mujer: 0, Hombre: 0, Unisex: 0 };
    var bCounts = {};
    var allForBrands = 0;
    PRODUCTS.forEach(function (p) {
      if (matches(p, { genero: true })) { gCounts[""]++; if (gCounts[p.genero] !== undefined) gCounts[p.genero]++; }
      if (matches(p, { marca: true })) { bCounts[p.marcaId] = (bCounts[p.marcaId] || 0) + 1; allForBrands++; }
    });

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
    if (filters.q) chips.push('<button type="button" class="fchip" data-remove-filter="q" aria-label="Quitar búsqueda">“' + esc(filters.q) + "”</button>");
    if (chips.length > 1) chips.push('<button type="button" class="link-btn" data-reset-filters>Limpiar todo</button>');
    $("[data-active-filters]").innerHTML = chips.join("");

    var label;
    if (!shown) label = "Sin resultados";
    else if (!filters.marca && !filters.genero && !filters.q) label = plural(shown, "fragancia", "fragancias") + " de " + plural(BRANDS.length, "marca", "marcas");
    else label = plural(shown, "resultado", "resultados");
    $("[data-result-count]").textContent = label;
  }

  function renderCatalog(opts) {
    opts = opts || {};
    var items = sortItems(PRODUCTS.filter(function (p) { return matches(p); }));
    var grouped = !filters.q && !filters.marca && filters.sort === "destacados";
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
      var map = { marca: filters.marca, buscar: filters.q, genero: filters.genero, orden: filters.sort === "destacados" ? "" : filters.sort };
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
  });

  /* ---------- Foto ampliada ---------- */
  var lb = $("[data-lightbox]");
  var lbImg = $("[data-lb-img]");
  var gallery = null;
  var lbLastFocus = null;

  function showLb() {
    var p = gallery.items[gallery.index];
    lbImg.src = p.foto;
    lbImg.alt = p.nombre + " de " + p.marca;
    $("[data-lb-caption]").textContent = p.nombre + " · " + p.marca;
    var many = gallery.items.length > 1;
    $("[data-lb-prev]").hidden = !many;
    $("[data-lb-next]").hidden = !many;
    $("[data-lb-counter]").hidden = !many;
    $("[data-lb-counter]").textContent = (gallery.index + 1) + " / " + gallery.items.length;
  }

  function openLightbox(btn) {
    var scope = btn.closest(".grid, .product-row") || document;
    var ids = [];
    $$("[data-zoom]", scope).forEach(function (b) { var id = b.getAttribute("data-zoom"); if (ids.indexOf(id) === -1) ids.push(id); });
    gallery = { items: ids.map(function (id) { return BY_ID[id]; }), index: Math.max(0, ids.indexOf(btn.getAttribute("data-zoom"))) };
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
    if (drawer.hidden && !nav.classList.contains("is-open")) document.documentElement.classList.remove("no-scroll");
    if (lbLastFocus) lbLastFocus.focus({ preventScroll: true });
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
    var t = e.target.closest("button, a");
    if (!t) return;

    if (t.hasAttribute("data-add")) {
      var id = t.getAttribute("data-add");
      var scope = t.closest("[data-ctrl]");
      setQty(id, qty(id) + 1);
      bump();
      showToast(BY_ID[id]);
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
    if (t.hasAttribute("data-remove-filter")) {
      var k = t.getAttribute("data-remove-filter");
      var ch = {}; ch[k] = "";
      if (k === "q") $("[data-search]").value = "";
      update(ch);
      return;
    }
    if (t.hasAttribute("data-reset-filters")) {
      $("[data-search]").value = "";
      update({ marca: "", genero: "", q: "", sort: "destacados" }, { scroll: true });
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
  observeReveal(document);
  onScroll();

  if (fromUrl && !window.location.hash) {
    requestAnimationFrame(function () { scrollToResults(); });
  } else if (window.location.hash) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target) requestAnimationFrame(function () { target.scrollIntoView({ behavior: "auto" }); });
  }
})();
