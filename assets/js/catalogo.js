/* ==========================================================================
   LE PERFAM · Catálogo y datos del sitio
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para actualizar la página:
   precios, perfumes, fotos, promo y más vendidos.

   Cada perfume:
     { nombre: "Khamrah", genero: "Unisex", precio: 59900 }

   genero: "Mujer" | "Hombre" | "Unisex"
   precio: número sin puntos ni signo $ (ej: 59900)

   Opcionales:
     antes: 64000          precio anterior: se muestra tachado y el perfume queda en promo
     foto: true            usa la foto  assets/img/perfumes/<marca>-<perfume>.jpg  (ver FOTOS)
     foto: "archivo.webp"  usa ese archivo dentro de assets/img/perfumes/
     fotosExtra: ["archivo-2.webp", "archivo-3.webp"]   fotos adicionales (se ven al ampliar)
     descripcion: "..."    texto corto debajo del nombre
     enStock: true         muestra "Entrega inmediata"
     agotado: true         muestra "No disponible por ahora" y no se puede agregar
     nuevo: true           etiqueta "Nuevo" y aparece en la fila "Recién llegados"

   Las notas olfativas de cada perfume están en assets/js/notas.js.

   FOTOS
   1. Subí la foto a assets/img/perfumes/ con el nombre marca-perfume.jpg
      (minúsculas, sin tildes, con guiones). Ej.: lattafa-khamrah.jpg
      La lista con el nombre exacto de cada perfume está en
      assets/img/perfumes/LEEME.txt
   2. Agregale  foto: true  a ese perfume.
   Mientras un perfume no tenga foto, se muestra una etiqueta con sus iniciales.
   ========================================================================== */

window.LE_PERFAM = {
  tienda: {
    nombre: "Le Perfam",
    // Aviso en la franja superior (solo se muestra si la promo está activa)
    bannerPromo: "Promo Día de la Madre: precios especiales en tres fragancias",
    // Contador de visitas (opcional, gratis): creá una cuenta en goatcounter.com
    // y poné acá el código que elijas (ej.: "leperfam"). Vacío = sin contador.
    contadorVisitas: ""
  },

  contacto: {
    whatsapp: "5493543313011",            // +54 9 3543 31-3011 (sin espacios ni +)
    whatsappVisible: "+54 9 3543 31-3011",
    instagram: "https://www.instagram.com/leperfam.cba",
    instagramUsuario: "@leperfam.cba",
    zona: "Salsipuedes · Río Ceballos",
    envios: "Envíos a toda la provincia de Córdoba"
  },

  /* Promo de temporada. Para ocultarla: activa: false */
  promo: {
    activa: true,
    titulo: "Promo Día de la Madre",
    bajada: "Perfume árabe · 100% original",
    // Cuenta regresiva: fecha del Día de la Madre (año-mes-día). Se oculta sola cuando pasa.
    fecha: "2026-10-18",
    // Último día para encargar y llegar a tiempo (año-mes-día). Vacío = no se muestra.
    encargarHasta: "",
    items: [
      { marca: "Lattafa", nombre: "Bade'e Al Oud Noble Blush" },
      { marca: "Lattafa", nombre: "Yara Rosa" },
      { marca: "Lattafa", nombre: "Fakhar Rose Gold" }
    ]
  },

  /* Preguntas frecuentes (se muestran al final de la página). Podés editar, sumar o sacar. */
  preguntas: [
    { p: "¿Los perfumes son originales?", r: "Sí. Trabajamos solo con perfumes originales." },
    { p: "¿Qué quiere decir «por encargo»?", r: "Elegís los perfumes en la web y nos mandás el encargo por WhatsApp. Antes de cerrar el pedido te confirmamos disponibilidad, precio final y entrega." },
    { p: "¿Cómo se paga?", r: "Lo coordinamos por WhatsApp cuando te confirmamos el encargo. En la web no se cobra nada." },
    { p: "¿Cuánto tarda en llegar?", r: "Depende del perfume. Te decimos el tiempo de entrega cuando confirmamos el encargo." },
    { p: "¿Hacen envíos?", r: "Entregamos en Salsipuedes y Río Ceballos, y hacemos envíos a toda la provincia de Córdoba." },
    { p: "¿Los precios pueden cambiar?", r: "Sí, están sujetos a cambio y a disponibilidad. El precio final te lo confirmamos por WhatsApp." },
    { p: "¿De dónde salen las notas de cada perfume?", r: "De la información que publican las marcas y tiendas especializadas. Te ayudan a imaginar cómo huele; si tenés dudas, consultanos." }
  ],

  /* Sector "Más vendidos" */
  masVendidos: [
    { marca: "Rasasi", nombre: "Hawas Malibú" },
    { marca: "Lattafa", nombre: "Yara Rosa" },
    { marca: "Afnan", nombre: "9PM Night Out" }
  ],

  marcas: [
    {
      marca: "Xerjoff",
      perfumes: [
        { nombre: "Naxos", genero: "Unisex", precio: 70900, foto: "xerjoff-naxos.webp" },
        { nombre: "Erba Pura (con pañuelo)", genero: "Unisex", precio: 63900, foto: "xerjoff-erba-pura-con-panuelo.webp", fotosExtra: ["xerjoff-erba-pura-con-panuelo-2.webp"] }
      ]
    },
    {
      marca: "Lattafa",
      perfumes: [
        { nombre: "Eclaire Pistache", genero: "Unisex", precio: 50900, foto: "lattafa-eclaire-pistache.webp", fotosExtra: ["lattafa-eclaire-pistache-2.webp"] },
        { nombre: "His Confession", genero: "Hombre", precio: 61900, foto: "lattafa-his-confession.webp" },
        { nombre: "Rave Now", genero: "Unisex", precio: 45900, foto: "lattafa-rave-now.webp" },
        { nombre: "Fakhar Negro", genero: "Hombre", precio: 50900, foto: "lattafa-fakhar-negro.webp", fotosExtra: ["lattafa-fakhar-negro-2.webp"] },
        { nombre: "Yara Tous", genero: "Mujer", precio: 40900, foto: "lattafa-yara-tous.webp", fotosExtra: ["lattafa-yara-tous-2.webp"] },
        { nombre: "Yara Candy", genero: "Mujer", precio: 40900, foto: "lattafa-yara-candy.webp", fotosExtra: ["lattafa-yara-candy-2.webp"] },
        { nombre: "Yara Moi", genero: "Mujer", precio: 40900, foto: "lattafa-yara-moi.webp", fotosExtra: ["lattafa-yara-moi-2.webp"] },
        { nombre: "Yara Rosa", genero: "Mujer", precio: 58900, antes: 62000, foto: "lattafa-yara-rosa.webp", fotosExtra: ["lattafa-yara-rosa-2.webp"] },
        { nombre: "Yara Elixir", genero: "Mujer", precio: 42900, foto: "lattafa-yara-elixir.webp", fotosExtra: ["lattafa-yara-elixir-2.webp"] },
        { nombre: "Asad", genero: "Hombre", precio: 40900, foto: "lattafa-asad.webp", fotosExtra: ["lattafa-asad-2.webp", "lattafa-asad-3.webp"] },
        { nombre: "Asad Bourbon", genero: "Hombre", precio: 40900, foto: "lattafa-asad-bourbon.webp", fotosExtra: ["lattafa-asad-bourbon-2.webp"] },
        { nombre: "Asad Elixir", genero: "Hombre", precio: 42900, foto: "lattafa-asad-elixir.webp", fotosExtra: ["lattafa-asad-elixir-2.webp"] },
        { nombre: "Haya Rosa", genero: "Mujer", precio: 51900, foto: "lattafa-haya-rosa.webp", fotosExtra: ["lattafa-haya-rosa-2.webp"] },
        { nombre: "Fakhar Rose Gold", genero: "Mujer", precio: 59900, antes: 64000, foto: "lattafa-fakhar-rose-gold.webp", fotosExtra: ["lattafa-fakhar-rose-gold-2.webp", "lattafa-fakhar-rose-gold-3.webp"] },
        { nombre: "Fakhar Dorado", genero: "Unisex", precio: 50900, foto: "lattafa-fakhar-dorado.webp", fotosExtra: ["lattafa-fakhar-dorado-2.webp"] },
        { nombre: "Khamrah", genero: "Unisex", precio: 59900, foto: "lattafa-khamrah.webp" },
        { nombre: "Hayaati", genero: "Hombre", precio: 47900, foto: "lattafa-hayaati.webp" },
        { nombre: "Habik Women", genero: "Mujer", precio: 58900, foto: "lattafa-habik-women.webp" },
        { nombre: "Habik For Men", genero: "Hombre", precio: 58900, foto: "lattafa-habik-for-men.webp", fotosExtra: ["lattafa-habik-for-men-2.webp"] },
        { nombre: "The Kingdom", genero: "Hombre", precio: 76900, foto: "lattafa-the-kingdom.webp", fotosExtra: ["lattafa-the-kingdom-2.webp"] },
        { nombre: "Art of Universe", genero: "Unisex", precio: 63900, foto: "lattafa-art-of-universe.webp", fotosExtra: ["lattafa-art-of-universe-2.webp"] },
        { nombre: "Vintage Radio", genero: "Unisex", precio: 66900, foto: "lattafa-vintage-radio.webp" },
        { nombre: "Jasoor", genero: "Hombre", precio: 55900, foto: "lattafa-jasoor.webp", fotosExtra: ["lattafa-jasoor-2.webp"] },
        { nombre: "Musamam White Intense", genero: "Unisex", precio: 61900, foto: "lattafa-musamam-white-intense.webp", fotosExtra: ["lattafa-musamam-white-intense-2.webp"] },
        { nombre: "Bade'e Al Oud Noble Blush", genero: "Mujer", precio: 58900, antes: 62000, foto: "lattafa-badee-al-oud-noble-blush.webp", fotosExtra: ["lattafa-badee-al-oud-noble-blush-2.webp"] },
        { nombre: "Khamrah Karaz", genero: "Unisex", precio: 63900, foto: "lattafa-khamrah-karaz.webp" },
        { nombre: "Victoria", genero: "Unisex", precio: 59900, foto: "lattafa-victoria.webp", fotosExtra: ["lattafa-victoria-2.webp"] },
        { nombre: "Bade'e Sublime", genero: "Unisex", precio: 54900, foto: "lattafa-badee-sublime.webp", fotosExtra: ["lattafa-badee-sublime-2.webp"] },
        { nombre: "Eclaire Marrón", genero: "Unisex", precio: 53900, foto: "lattafa-eclaire-marron.webp" },
        { nombre: "Her Confession", genero: "Mujer", precio: 61900, foto: "lattafa-her-confession.webp" },
        { nombre: "Jub Dalal", genero: "Mujer", precio: 55900, foto: "lattafa-jub-dalal.webp", fotosExtra: ["lattafa-jub-dalal-2.webp"] }
      ]
    },
    {
      marca: "Armaf",
      perfumes: [
        { nombre: "Odyssey Mega", genero: "Unisex", precio: 46900, foto: "armaf-odyssey-mega.webp", fotosExtra: ["armaf-odyssey-mega-2.webp"] },
        { nombre: "Island Bliss", genero: "Unisex", precio: 61900, foto: "armaf-island-bliss.webp" },
        { nombre: "Connoisseur Man", genero: "Hombre", precio: 59900, foto: "armaf-connoisseur-man.webp", fotosExtra: ["armaf-connoisseur-man-2.webp"] },
        { nombre: "Club de Nuit Urban Man Elixir", genero: "Hombre", precio: 51900, foto: "armaf-club-de-nuit-urban-man-elixir.webp", fotosExtra: ["armaf-club-de-nuit-urban-man-elixir-2.webp", "armaf-club-de-nuit-urban-man-elixir-3.webp"] },
        { nombre: "Odyssey Homme White", genero: "Hombre", precio: 46900, foto: "armaf-odyssey-homme-white.webp", fotosExtra: ["armaf-odyssey-homme-white-2.webp"] },
        { nombre: "Odyssey Homme", genero: "Hombre", precio: 46900, foto: "armaf-odyssey-homme.webp", fotosExtra: ["armaf-odyssey-homme-2.webp"] },
        { nombre: "Odyssey Black Forest", genero: "Unisex", precio: 46900, foto: "armaf-odyssey-black-forest.webp", fotosExtra: ["armaf-odyssey-black-forest-2.webp"] },
        { nombre: "Odyssey Mandarinsky Limited Edition", genero: "Hombre", precio: 46900, foto: "armaf-odyssey-mandarinsky-limited-edition.webp" },
        { nombre: "Club de Nuit Intense Man", genero: "Hombre", precio: 49900, foto: "armaf-club-de-nuit-intense-man.webp", fotosExtra: ["armaf-club-de-nuit-intense-man-2.webp"] },
        { nombre: "Kunafa Chocolate", genero: "Unisex", precio: 48900, foto: "armaf-kunafa-chocolate.webp", fotosExtra: ["armaf-kunafa-chocolate-2.webp"] },
        { nombre: "Club de Nuit Iconic", genero: "Hombre", precio: 51900, foto: "armaf-club-de-nuit-iconic.webp", fotosExtra: ["armaf-club-de-nuit-iconic-2.webp"] },
        { nombre: "Mandarin Sky Elixir", genero: "Hombre", precio: 46900, foto: "armaf-mandarin-sky-elixir.webp", fotosExtra: ["armaf-mandarin-sky-elixir-2.webp"] },
        { nombre: "Yum Yum", genero: "Mujer", precio: 61900, foto: "armaf-yum-yum.webp" },
        { nombre: "Odyssey Candee", genero: "Mujer", precio: 46900, foto: "armaf-odyssey-candee.webp", fotosExtra: ["armaf-odyssey-candee-2.webp"] },
        { nombre: "Infinity Eau de Parfum Plateado", genero: "Unisex", precio: 63900, foto: "armaf-infinity-eau-de-parfum-plateado.webp" },
        { nombre: "Infinity Eau de Parfum Dorado", genero: "Mujer", precio: 63900, foto: "armaf-infinity-eau-de-parfum-dorado.webp", fotosExtra: ["armaf-infinity-eau-de-parfum-dorado-2.webp"] },
        { nombre: "Club de Nuit Intense Woman", genero: "Mujer", precio: 51900, foto: "armaf-club-de-nuit-intense-woman.webp", fotosExtra: ["armaf-club-de-nuit-intense-woman-2.webp"] }
      ]
    },
    {
      marca: "Rasasi",
      perfumes: [
        { nombre: "Hawas Malibú", genero: "Hombre", precio: 57600, foto: "rasasi-hawas-malibu.webp", fotosExtra: ["rasasi-hawas-malibu-2.webp"] },
        { nombre: "Hawas Ice", genero: "Hombre", precio: 47900, foto: "rasasi-hawas-ice.webp", fotosExtra: ["rasasi-hawas-ice-2.webp"] },
        { nombre: "Hawas Kobra", genero: "Hombre", precio: 47900, foto: "rasasi-hawas-kobra.webp", fotosExtra: ["rasasi-hawas-kobra-2.webp"] },
        { nombre: "Hawas Fire", genero: "Hombre", precio: 47900, foto: "rasasi-hawas-fire.webp", fotosExtra: ["rasasi-hawas-fire-2.webp"] },
        { nombre: "Hawas Verde", genero: "Hombre", precio: 47900, foto: "rasasi-hawas-verde.webp" },
        { nombre: "Hawas For Him", genero: "Hombre", precio: 47900, foto: "rasasi-hawas-for-him.webp" },
        { nombre: "Hawas Black", genero: "Hombre", precio: 47900, foto: "rasasi-hawas-black.webp", fotosExtra: ["rasasi-hawas-black-2.webp"] },
        { nombre: "Hawas Elixir", genero: "Hombre", precio: 47900, foto: "rasasi-hawas-elixir.webp", fotosExtra: ["rasasi-hawas-elixir-2.webp"] }
      ]
    },
    {
      marca: "French Avenue",
      perfumes: [
        { nombre: "Liquid Brun", genero: "Unisex", precio: 65900, foto: "french-avenue-liquid-brun.webp" },
        { nombre: "Vulcan Baie", genero: "Unisex", precio: 50900, foto: "french-avenue-vulcan-baie.webp" },
        { nombre: "Spectre Wraith", genero: "Unisex", precio: 65900, foto: "french-avenue-spectre-wraith.webp" },
        { nombre: "Vulcan Feu", genero: "Unisex", precio: 50900, foto: "french-avenue-vulcan-feu.webp" },
        { nombre: "Royal Blend Nero", genero: "Unisex", precio: 63900, foto: "french-avenue-royal-blend-nero.webp" },
        { nombre: "Irida Extrait", genero: "Mujer", precio: 59900, foto: "french-avenue-irida-extrait.webp", fotosExtra: ["french-avenue-irida-extrait-2.webp"] },
        { nombre: "Vulcan Limited Edition", genero: "Unisex", precio: 50900 },
        { nombre: "Spectre Ghost", genero: "Unisex", precio: 68900, foto: "french-avenue-spectre-ghost.webp", fotosExtra: ["french-avenue-spectre-ghost-2.webp"] },
        { nombre: "Jade Verde", genero: "Unisex", precio: 68900, foto: "french-avenue-jade-verde.webp" }
      ]
    },
    {
      marca: "Afnan",
      perfumes: [
        { nombre: "9AM Dive", genero: "Unisex", precio: 46900, foto: "afnan-9am-dive.webp", fotosExtra: ["afnan-9am-dive-2.webp"] },
        { nombre: "9PM Elixir", genero: "Hombre", precio: 47900, foto: "afnan-9pm-elixir.webp" },
        { nombre: "9PM Rebel", genero: "Hombre", precio: 50900, foto: "afnan-9pm-rebel.webp", fotosExtra: ["afnan-9pm-rebel-2.webp"] },
        { nombre: "Supremacy Collector's Edition", genero: "Hombre", precio: 57900, foto: "afnan-supremacy-collectors-edition.webp", fotosExtra: ["afnan-supremacy-collectors-edition-2.webp", "afnan-supremacy-collectors-edition-3.webp"] },
        { nombre: "9PM Pour Femme", genero: "Mujer", precio: 51900, foto: "afnan-9pm-pour-femme.webp" },
        { nombre: "9AM Pour Femme Rosa", genero: "Mujer", precio: 51900, foto: "afnan-9am-pour-femme-rosa.webp" },
        { nombre: "9PM Night Out", genero: "Hombre", precio: 68900, antes: 72000, foto: "afnan-9pm-night-out.webp", fotosExtra: ["afnan-9pm-night-out-2.webp"] }
      ]
    },
    {
      marca: "Al Haramain",
      perfumes: [
        { nombre: "Al Haramain Gold Edition edp 100ml", genero: "Unisex", precio: 76900, foto: "al-haramain-al-haramain-gold-edition-edp-100ml.webp" },
        { nombre: "Dubai Night", genero: "Unisex", precio: 68900, foto: "al-haramain-dubai-night.webp", fotosExtra: ["al-haramain-dubai-night-2.webp"] },
        { nombre: "Amber Oud Gold Edition", genero: "Unisex", precio: 68900, foto: "al-haramain-amber-oud-gold-edition.webp", fotosExtra: ["al-haramain-amber-oud-gold-edition-2.webp"] }
      ]
    },
    {
      marca: "Bharara",
      perfumes: [
        { nombre: "King Eau de Parfum", genero: "Hombre", precio: 65900, foto: "bharara-king-eau-de-parfum.webp", fotosExtra: ["bharara-king-eau-de-parfum-2.webp"] },
        { nombre: "Rose", genero: "Mujer", precio: 65900, foto: "bharara-rose.webp", fotosExtra: ["bharara-rose-2.webp"] },
        { nombre: "King Gold Edition", genero: "Hombre", precio: 65900, foto: "bharara-king-gold-edition.webp", fotosExtra: ["bharara-king-gold-edition-2.webp"] },
        { nombre: "King Soleil", genero: "Hombre", precio: 70900, foto: "bharara-king-soleil.webp" }
      ]
    },
    {
      marca: "Jean Paul Gaultier",
      perfumes: [
        { nombre: "La Belle Rosée", genero: "Mujer", precio: 57900, foto: "jean-paul-gaultier-la-belle-rosee.webp", fotosExtra: ["jean-paul-gaultier-la-belle-rosee-2.webp"] },
        { nombre: "Le Beau Le Parfum", genero: "Hombre", precio: 65900, foto: "jean-paul-gaultier-le-beau-le-parfum.webp" },
        { nombre: "Divine", genero: "Mujer", precio: 56900, foto: "jean-paul-gaultier-divine.webp" }
      ]
    },
    {
      marca: "Paris Corner",
      perfumes: [
        { nombre: "Eshal Vainilla", genero: "Unisex", precio: 57900, foto: "paris-corner-eshal-vainilla.webp" },
        { nombre: "Khair Confection", genero: "Unisex", precio: 48900, foto: "paris-corner-khair-confection.webp" },
        { nombre: "Eshal Musk Rosa", genero: "Mujer", precio: 56900, foto: "paris-corner-eshal-musk-rosa.webp" }
      ]
    },
    {
      marca: "Asdaaf",
      perfumes: [
        { nombre: "Ameerat Al Arab", genero: "Mujer", precio: 44900, foto: "asdaaf-ameerat-al-arab.webp", fotosExtra: ["asdaaf-ameerat-al-arab-2.webp"] },
        { nombre: "Ameer Al Arab", genero: "Hombre", precio: 44900, foto: "asdaaf-ameer-al-arab.webp", fotosExtra: ["asdaaf-ameer-al-arab-2.webp"] }
      ]
    },
    {
      marca: "Azzaro",
      perfumes: [
        { nombre: "Wanted Eau de Toilette", genero: "Hombre", precio: 49900, foto: "azzaro-wanted-eau-de-toilette.webp" },
        { nombre: "The Most Wanted Parfum", genero: "Hombre", precio: 49900, foto: "azzaro-the-most-wanted-parfum.webp", fotosExtra: ["azzaro-the-most-wanted-parfum-2.webp"] }
      ]
    },
    {
      marca: "Bond No. 9",
      perfumes: [
        { nombre: "Madison Avenue", genero: "Unisex", precio: 53900, foto: "bond-no-9-madison-avenue.webp" },
        { nombre: "Greenwich Village", genero: "Unisex", precio: 53900, foto: "bond-no-9-greenwich-village.webp", fotosExtra: ["bond-no-9-greenwich-village-2.webp"] }
      ]
    },
    {
      marca: "Khadlaj",
      perfumes: [
        { nombre: "Shiyaaka Snow", genero: "Unisex", precio: 56900, foto: "khadlaj-shiyaaka-snow.webp" },
        { nombre: "Shiyaaka Shadow", genero: "Hombre", precio: 56900, foto: "khadlaj-shiyaaka-shadow.webp" }
      ]
    },
    {
      marca: "Maison Asrar",
      perfumes: [
        { nombre: "Milky Way", genero: "Unisex", precio: 57900, foto: "maison-asrar-milky-way.webp" },
        { nombre: "Voyage Vanilla", genero: "Unisex", precio: 57900, foto: "maison-asrar-voyage-vanilla.webp" }
      ]
    },
    {
      marca: "Rayhaan",
      perfumes: [
        { nombre: "Rayhaan Obsidian", genero: "Unisex", precio: 49900, foto: "rayhaan-rayhaan-obsidian.webp" },
        { nombre: "Tropical Vibe", genero: "Unisex", precio: 46900, foto: "rayhaan-tropical-vibe.webp" }
      ]
    },
    {
      marca: "Ahmed Al Maghribi",
      perfumes: [
        { nombre: "Oud Lavender", genero: "Unisex", precio: 55900, foto: "ahmed-al-maghribi-oud-lavender.webp" }
      ]
    },
    {
      marca: "Al Wataniah",
      perfumes: [
        { nombre: "Sabah Al Ward Rosa", genero: "Mujer", precio: 46900, foto: "al-wataniah-sabah-al-ward-rosa.webp" }
      ]
    },
    {
      marca: "Carolina Herrera",
      perfumes: [
        { nombre: "La Bomba", genero: "Mujer", precio: 47900, foto: "carolina-herrera-la-bomba.webp" }
      ]
    },
    {
      marca: "Dumont",
      perfumes: [
        { nombre: "Nitro Red", genero: "Hombre", precio: 47900, foto: "dumont-nitro-red.webp", fotosExtra: ["dumont-nitro-red-2.webp"] }
      ]
    },
    {
      marca: "Le Falcone",
      perfumes: [
        { nombre: "Bonita Rouge", genero: "Mujer", precio: 50900, foto: "le-falcone-bonita-rouge.webp" }
      ]
    },
    {
      marca: "Orientica",
      perfumes: [
        { nombre: "Luxury Collection Amber Rouge", genero: "Unisex", precio: 63900, foto: "orientica-luxury-collection-amber-rouge.webp" }
      ]
    },
    {
      marca: "Otras",
      perfumes: [
        { nombre: "Game of Spades Wildcard", genero: "Unisex", precio: 68900, foto: "otras-game-of-spades-wildcard.webp" },
        { nombre: "Marshmellow Blush", genero: "Mujer", precio: 57900, foto: "otras-marshmellow-blush.webp", fotosExtra: ["otras-marshmellow-blush-2.webp"] }
      ]
    }
  ]
};
