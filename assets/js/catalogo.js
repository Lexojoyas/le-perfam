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
     descripcion: "..."    texto corto debajo del nombre
     enStock: true         muestra "Entrega inmediata"
     agotado: true         muestra "No disponible por ahora" y no se puede agregar

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
    bannerPromo: "Promo Día de la Madre: precios especiales en tres fragancias"
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
    items: [
      { marca: "Lattafa", nombre: "Bade'e Al Oud Noble Blush" },
      { marca: "Lattafa", nombre: "Yara Rosa" },
      { marca: "Lattafa", nombre: "Fakhar Rose Gold" }
    ]
  },

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
        { nombre: "Naxos", genero: "Unisex", precio: 70900 },
        { nombre: "Erba Pura (con pañuelo)", genero: "Unisex", precio: 63900 }
      ]
    },
    {
      marca: "Lattafa",
      perfumes: [
        { nombre: "Eclaire Pistache", genero: "Unisex", precio: 50900 },
        { nombre: "His Confession", genero: "Hombre", precio: 61900 },
        { nombre: "Rave Now", genero: "Unisex", precio: 45900 },
        { nombre: "Fakhar Negro", genero: "Hombre", precio: 50900 },
        { nombre: "Yara Tous", genero: "Mujer", precio: 40900 },
        { nombre: "Yara Candy", genero: "Mujer", precio: 40900 },
        { nombre: "Yara Moi", genero: "Mujer", precio: 40900 },
        { nombre: "Yara Rosa", genero: "Mujer", precio: 58900, antes: 62000, foto: "lattafa-yara-rosa.webp" },
        { nombre: "Yara Elixir", genero: "Mujer", precio: 42900 },
        { nombre: "Asad", genero: "Hombre", precio: 40900 },
        { nombre: "Asad Bourbon", genero: "Hombre", precio: 40900 },
        { nombre: "Asad Elixir", genero: "Hombre", precio: 42900 },
        { nombre: "Haya Rosa", genero: "Mujer", precio: 51900 },
        { nombre: "Fakhar Rose Gold", genero: "Mujer", precio: 59900, antes: 64000, foto: "lattafa-fakhar-rose-gold.webp" },
        { nombre: "Fakhar Dorado", genero: "Unisex", precio: 50900 },
        { nombre: "Khamrah", genero: "Unisex", precio: 59900 },
        { nombre: "Hayaati", genero: "Hombre", precio: 47900 },
        { nombre: "Habik Women", genero: "Mujer", precio: 58900 },
        { nombre: "Habik For Men", genero: "Hombre", precio: 58900 },
        { nombre: "The Kingdom", genero: "Hombre", precio: 76900 },
        { nombre: "Art of Universe", genero: "Unisex", precio: 63900 },
        { nombre: "Vintage Radio", genero: "Unisex", precio: 66900 },
        { nombre: "Jasoor", genero: "Hombre", precio: 55900 },
        { nombre: "Musamam White Intense", genero: "Unisex", precio: 61900 },
        { nombre: "Bade'e Al Oud Noble Blush", genero: "Mujer", precio: 58900, antes: 62000, foto: "lattafa-badee-al-oud-noble-blush.webp" },
        { nombre: "Khamrah Karaz", genero: "Unisex", precio: 63900 },
        { nombre: "Victoria", genero: "Unisex", precio: 59900 },
        { nombre: "Bade'e Sublime", genero: "Unisex", precio: 54900 },
        { nombre: "Eclaire Marrón", genero: "Unisex", precio: 53900 },
        { nombre: "Her Confession", genero: "Mujer", precio: 61900 },
        { nombre: "Jub Dalal", genero: "Mujer", precio: 55900 }
      ]
    },
    {
      marca: "Armaf",
      perfumes: [
        { nombre: "Odyssey Mega", genero: "Unisex", precio: 46900 },
        { nombre: "Island Bliss", genero: "Unisex", precio: 61900 },
        { nombre: "Connoisseur Man", genero: "Hombre", precio: 59900 },
        { nombre: "Club de Nuit Urban Man Elixir", genero: "Hombre", precio: 51900 },
        { nombre: "Odyssey Homme White", genero: "Hombre", precio: 46900 },
        { nombre: "Odyssey Homme", genero: "Hombre", precio: 46900 },
        { nombre: "Odyssey Black Forest", genero: "Unisex", precio: 46900 },
        { nombre: "Odyssey Mandarinsky Limited Edition", genero: "Hombre", precio: 46900 },
        { nombre: "Club de Nuit Intense Man", genero: "Hombre", precio: 49900 },
        { nombre: "Kunafa Chocolate", genero: "Unisex", precio: 48900 },
        { nombre: "Club de Nuit Iconic", genero: "Hombre", precio: 51900 },
        { nombre: "Mandarin Sky Elixir", genero: "Hombre", precio: 46900 },
        { nombre: "Yum Yum", genero: "Mujer", precio: 61900 },
        { nombre: "Odyssey Candee", genero: "Mujer", precio: 46900 },
        { nombre: "Infinity Eau de Parfum Plateado", genero: "Unisex", precio: 63900 },
        { nombre: "Infinity Eau de Parfum Dorado", genero: "Mujer", precio: 63900 },
        { nombre: "Club de Nuit Intense Woman", genero: "Mujer", precio: 51900 }
      ]
    },
    {
      marca: "Rasasi",
      perfumes: [
        { nombre: "Hawas Malibú", genero: "Hombre", precio: 57600 },
        { nombre: "Hawas Ice", genero: "Hombre", precio: 47900 },
        { nombre: "Hawas Kobra", genero: "Hombre", precio: 47900 },
        { nombre: "Hawas Fire", genero: "Hombre", precio: 47900 },
        { nombre: "Hawas Verde", genero: "Hombre", precio: 47900 },
        { nombre: "Hawas For Him", genero: "Hombre", precio: 47900 },
        { nombre: "Hawas Black", genero: "Hombre", precio: 47900 },
        { nombre: "Hawas Elixir", genero: "Hombre", precio: 47900 }
      ]
    },
    {
      marca: "French Avenue",
      perfumes: [
        { nombre: "Liquid Brun", genero: "Unisex", precio: 65900 },
        { nombre: "Vulcan Baie", genero: "Unisex", precio: 50900 },
        { nombre: "Spectre Wraith", genero: "Unisex", precio: 65900 },
        { nombre: "Vulcan Feu", genero: "Unisex", precio: 50900 },
        { nombre: "Royal Blend Nero", genero: "Unisex", precio: 63900 },
        { nombre: "Irida Extrait", genero: "Mujer", precio: 59900 },
        { nombre: "Vulcan Limited Edition", genero: "Unisex", precio: 50900 },
        { nombre: "Spectre Ghost", genero: "Unisex", precio: 68900 },
        { nombre: "Jade Verde", genero: "Unisex", precio: 68900 }
      ]
    },
    {
      marca: "Afnan",
      perfumes: [
        { nombre: "9AM Dive", genero: "Unisex", precio: 46900 },
        { nombre: "9PM Elixir", genero: "Hombre", precio: 47900 },
        { nombre: "9PM Rebel", genero: "Hombre", precio: 50900 },
        { nombre: "Supremacy Collector's Edition", genero: "Hombre", precio: 57900 },
        { nombre: "9PM Pour Femme", genero: "Mujer", precio: 51900 },
        { nombre: "9AM Pour Femme Rosa", genero: "Mujer", precio: 51900 },
        { nombre: "9PM Night Out", genero: "Hombre", precio: 68900, antes: 72000 }
      ]
    },
    {
      marca: "Al Haramain",
      perfumes: [
        { nombre: "Al Haramain Gold Edition edp 100ml", genero: "Unisex", precio: 76900 },
        { nombre: "Dubai Night", genero: "Unisex", precio: 68900 },
        { nombre: "Amber Oud Gold Edition", genero: "Unisex", precio: 68900 }
      ]
    },
    {
      marca: "Bharara",
      perfumes: [
        { nombre: "King Eau de Parfum", genero: "Hombre", precio: 65900 },
        { nombre: "Rose", genero: "Mujer", precio: 65900 },
        { nombre: "King Gold Edition", genero: "Hombre", precio: 65900 },
        { nombre: "King Soleil", genero: "Hombre", precio: 70900 }
      ]
    },
    {
      marca: "Jean Paul Gaultier",
      perfumes: [
        { nombre: "La Belle Rosée", genero: "Mujer", precio: 57900 },
        { nombre: "Le Beau Le Parfum", genero: "Hombre", precio: 65900 },
        { nombre: "Divine", genero: "Mujer", precio: 56900 }
      ]
    },
    {
      marca: "Paris Corner",
      perfumes: [
        { nombre: "Eshal Vainilla", genero: "Unisex", precio: 57900 },
        { nombre: "Khair Confection", genero: "Unisex", precio: 48900 },
        { nombre: "Eshal Musk Rosa", genero: "Mujer", precio: 56900 }
      ]
    },
    {
      marca: "Asdaaf",
      perfumes: [
        { nombre: "Ameerat Al Arab", genero: "Mujer", precio: 44900 },
        { nombre: "Ameer Al Arab", genero: "Hombre", precio: 44900 }
      ]
    },
    {
      marca: "Azzaro",
      perfumes: [
        { nombre: "Wanted Eau de Toilette", genero: "Hombre", precio: 49900 },
        { nombre: "The Most Wanted Parfum", genero: "Hombre", precio: 49900 }
      ]
    },
    {
      marca: "Bond No. 9",
      perfumes: [
        { nombre: "Madison Avenue", genero: "Unisex", precio: 53900 },
        { nombre: "Greenwich Village", genero: "Unisex", precio: 53900 }
      ]
    },
    {
      marca: "Khadlaj",
      perfumes: [
        { nombre: "Shiyaaka Snow", genero: "Unisex", precio: 56900 },
        { nombre: "Shiyaaka Shadow", genero: "Hombre", precio: 56900 }
      ]
    },
    {
      marca: "Maison Asrar",
      perfumes: [
        { nombre: "Milky Way", genero: "Unisex", precio: 57900 },
        { nombre: "Voyage Vanilla", genero: "Unisex", precio: 57900 }
      ]
    },
    {
      marca: "Rayhaan",
      perfumes: [
        { nombre: "Rayhaan Obsidian", genero: "Unisex", precio: 49900 },
        { nombre: "Tropical Vibe", genero: "Unisex", precio: 46900 }
      ]
    },
    {
      marca: "Ahmed Al Maghribi",
      perfumes: [
        { nombre: "Oud Lavender", genero: "Unisex", precio: 55900 }
      ]
    },
    {
      marca: "Al Wataniah",
      perfumes: [
        { nombre: "Sabah Al Ward Rosa", genero: "Mujer", precio: 46900 }
      ]
    },
    {
      marca: "Carolina Herrera",
      perfumes: [
        { nombre: "La Bomba", genero: "Mujer", precio: 47900 }
      ]
    },
    {
      marca: "Dumont",
      perfumes: [
        { nombre: "Nitro Red", genero: "Hombre", precio: 47900 }
      ]
    },
    {
      marca: "Le Falcone",
      perfumes: [
        { nombre: "Bonita Rouge", genero: "Mujer", precio: 50900 }
      ]
    },
    {
      marca: "Orientica",
      perfumes: [
        { nombre: "Luxury Collection Amber Rouge", genero: "Unisex", precio: 63900 }
      ]
    },
    {
      marca: "Otras",
      perfumes: [
        { nombre: "Game of Spades Wildcard", genero: "Unisex", precio: 68900 },
        { nombre: "Marshmellow Blush", genero: "Mujer", precio: 57900 }
      ]
    }
  ]
};
