# Le Perfam · Perfumería

Sitio web de **Le Perfam**, perfumería de Salsipuedes y Río Ceballos (Córdoba).
Perfumes árabes y de diseñador, originales y **por encargo**.

Es una página estática (HTML, CSS y JavaScript, sin frameworks ni instalación). Se publica gratis con GitHub Pages y funciona también abriendo `index.html` con doble clic.

## Qué tiene

- **Portada** con la propuesta de la tienda y un **índice de marcas** que lleva directo al catálogo filtrado.
- **Promo** (Día de la Madre) con precio anterior, precio actual y ahorro.
- **Más vendidos**: Hawas Malibú, Yara Rosa y 9PM Night Out.
- **Cómo funciona** el encargo, en 4 pasos.
- **Catálogo**:
  - En computadora, filtros a la izquierda: marcas (con cantidad), Mujer / Hombre / Unisex y orden (destacados, precio o nombre).
  - En celular y tablet: selector de marca y buscador fijos arriba, y debajo el género y el orden.
  - Buscador que no distingue tildes ni mayúsculas.
  - Vista por marca: muestra un adelanto de cada marca y el botón «Ver las N». Al buscar u ordenar, muestra todos los resultados juntos.
  - Si no hay resultados, ofrece consultar por WhatsApp con el nombre buscado.
- **Tarjetas de perfume**: marca, nombre, género, precio (y precio anterior si hay promo), botón **Agregar** y botón para **consultar por WhatsApp**. Al agregar, el botón pasa a mostrar la cantidad con − y +.
- **Perfumes sin foto**: se muestra una etiqueta con las iniciales del perfume y la leyenda «Foto próximamente». No se usan fotos de otros productos.
- **Zoom** de las fotos (flechas, teclado o deslizando el dedo).
- **Encargo**:
  - Panel con fotos, cantidades, «Quitar», total y un formulario con nombre, lugar de entrega (Salsipuedes, Río Ceballos u otra localidad) y nota.
  - Valida los datos antes de abrir WhatsApp.
  - El mensaje sale numerado y ordenado al +54 9 3543 31-3011.
  - El encargo y los datos del cliente quedan guardados en ese navegador al recargar la página.
  - En celular aparece una barra inferior con el total.
- **Links compartibles**: `?marca=lattafa`, `?buscar=yara`, `?genero=mujer`, `?orden=precio-asc`.

## Estructura

```
index.html                  Página
assets/css/styles.css       Estilos (colores y tipografías en el bloque :root del principio)
assets/js/catalogo.js       ← DATOS: perfumes, precios, promo, más vendidos y contacto
assets/js/app.js            Lógica (no hace falta tocarlo)
assets/img/marca/           Logo y monograma
assets/img/perfumes/        Fotos de perfumes + LEEME.txt con el nombre de archivo de cada uno
assets/img/                 Íconos y la imagen para compartir el link (og-le-perfam.jpg)
```

## Cómo actualizar

Todo se edita en **`assets/js/catalogo.js`**. Desde GitHub: abrí el archivo, tocá el lápiz (*Edit*), hacé el cambio y apretá **Commit changes**. La página se actualiza sola en uno o dos minutos.

**Cambiar un precio** (sin puntos ni signo $):

```js
{ nombre: "Khamrah", genero: "Unisex", precio: 59900 },
```

**Poner un perfume en promo** (muestra el precio anterior tachado y el porcentaje):

```js
{ nombre: "Khamrah", genero: "Unisex", precio: 55900, antes: 59900 },
```

**Agregar un perfume**: copiá una línea dentro de su marca y cambiá los datos. **Agregar una marca**: copiá un bloque `{ marca: "...", perfumes: [ ... ] },` completo. Las marcas se ordenan solas alfabéticamente.

**Agregar una foto**

1. Subí la foto a `assets/img/perfumes/` con el nombre que figura en `assets/img/perfumes/LEEME.txt` (por ejemplo `lattafa-khamrah.jpg`). Ideal: cuadrada, de 800 × 800 px o más.
2. Agregale `foto: true` a ese perfume:

```js
{ nombre: "Khamrah", genero: "Unisex", precio: 59900, foto: true },
```

Si la foto tiene otro nombre o es .webp, usá `foto: "nombre-del-archivo.webp"`.

**Datos opcionales**: `descripcion: "..."` (texto corto), `enStock: true` (muestra «Entrega inmediata»), `agotado: true` (muestra «No disponible por ahora» y no se puede agregar).

**Promo**: en el bloque `promo` cambiá el título y los perfumes. Para ocultarla, poné `activa: false`. El texto de la franja superior está en `tienda.bannerPromo`.

**Más vendidos**: en `masVendidos`, marca y nombre exactamente como figuran en el catálogo.

**WhatsApp e Instagram**: en el bloque `contacto`.

## Publicar en GitHub Pages

1. Creá un repositorio en GitHub (por ejemplo `le-perfam`).
2. Subí **todo el contenido** de esta carpeta a la raíz del repositorio (**Add file → Upload files**), incluida la carpeta `assets` y el archivo `.nojekyll`.
3. En **Settings → Pages**, elegí **Deploy from a branch**, rama **main**, carpeta **/ (root)** y guardá.
4. En uno o dos minutos queda online en `https://TU-USUARIO.github.io/le-perfam/`.

Cuando tengas la dirección definitiva, en `index.html` cambiá `og:image` por la dirección completa de la imagen (por ejemplo `https://tu-usuario.github.io/le-perfam/assets/img/og-le-perfam.jpg`). Así se ve la vista previa al compartir el link por WhatsApp o Instagram.

---

Precios sujetos a cambio y a disponibilidad.
