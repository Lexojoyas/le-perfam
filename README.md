# Le Perfam · Perfumería

Sitio web de **Le Perfam**, perfumería de Salsipuedes y Río Ceballos (Córdoba).
Perfumes árabes y de diseñador, originales y **por encargo**.

Es una página estática (HTML, CSS y JavaScript, sin frameworks ni instalación). Se publica gratis con GitHub Pages y funciona también abriendo `index.html` con doble clic.

## Qué tiene

- **Portada** con la propuesta de la tienda, una vitrina de vidrio con los más vendidos y un **índice de marcas** que lleva directo al catálogo filtrado.
- **Viaje en 3D al bajar** (three.js): en la portada flota un gran cristal tallado con su aro dorado. Al bajar, gira y vuela hacia la pantalla hasta atravesarla. Después la cámara desciende entre cristales, gotas y aros que pasan detrás del vidrio de las secciones.
  - Cuanto más rápido se baja, más giran y más corre el polvo dorado. Se apaga antes del catálogo.
  - Con el mouse, la escena y la vitrina se inclinan.
  - Sin 3D en el navegador, con un equipo lento o con «reducir movimiento», la página funciona igual. En ese último caso la escena queda quieta en la portada.
- **Promo** (Día de la Madre) con precio anterior, precio actual y ahorro.
  - Incluye una **cuenta regresiva** hasta la fecha de la promo (días, horas y minutos), que se oculta sola cuando pasa.
  - La franja superior también dice cuántos días faltan.
  - Si se carga la fecha límite para encargar, muestra «Encargá hasta el …».
- **Recién llegados**: fila con los perfumes marcados como nuevos (etiqueta «Nuevo»). Si no hay ninguno marcado, la sección no aparece.
- **Más vendidos**: Hawas Malibú, Yara Rosa y 9PM Night Out.
- **Test «¿Qué perfume va con vos?»**: cuatro preguntas (para quién, qué aromas, de día o de noche, presupuesto).
  - Muestra hasta 6 perfumes del catálogo y un botón para pedir una recomendación por WhatsApp con las respuestas.
  - Lo de día o de noche es una sugerencia según el estilo, y la página lo aclara.
- **Cómo funciona** el encargo, en 4 pasos.
- **Catálogo**:
  - En computadora, filtros a la izquierda: Mujer / Hombre / Unisex, **estilo**, orden y marcas (con cantidad).
  - En celular y tablet: selector de marca y buscador fijos arriba; debajo, el género, el orden y los estilos.
  - **Estilos**: Dulce, Frutal, Floral, Fresco, Amaderado y Oriental.
  - Buscador que no distingue tildes ni mayúsculas. También busca por estilo y por nota (por ejemplo «vainilla» o «rosa»).
  - Vista por marca: muestra un adelanto de cada marca y el botón «Ver las N». Al buscar, ordenar o elegir un estilo, muestra todos los resultados juntos.
  - Si no hay resultados, ofrece consultar por WhatsApp con el nombre buscado.
- **Tarjetas de perfume**:
  - Marca, nombre, género, estilo y precio (y precio anterior si hay promo).
  - Botón **Agregar** (pasa a mostrar la cantidad con − y +), consulta por WhatsApp y **corazón de favoritos**.
  - Con mouse, la tarjeta se inclina en 3D con un reflejo de luz que sigue al puntero.
  - Al agregar, la foto del perfume **vuela hasta el botón Encargo**.
- **Ficha del perfume**: se abre al tocar la foto o el nombre, saliendo de la tarjeta con un giro en 3D.
  - Fotos (con miniaturas y zoom), estilo, precio, botones para agregar, guardar o consultar.
  - **Notas del perfume** (salida, corazón y fondo) y la fuente de donde salen.
  - Tocando un estilo, muestra todos los perfumes de ese estilo.
- **Favoritos**: el corazón guarda el perfume en ese navegador.
  - El corazón del encabezado muestra cuántos hay y abre la lista en el catálogo.
  - Desde ahí se puede **enviar la lista por WhatsApp**.
- **Preguntas frecuentes**, desplegables, editables desde `catalogo.js`.
- **Modo noche**: botón de la luna en el encabezado (en celular, dentro del menú). Queda guardado para la próxima visita.
- **Perfumes sin foto**: se muestra una etiqueta con las iniciales del perfume y la leyenda «Foto próximamente». No se usan fotos de otros productos.
- **Zoom** de las fotos (flechas, teclado o deslizando el dedo).
- **Encargo**:
  - Panel con fotos, cantidades, «Quitar», total y un formulario con nombre, lugar de entrega (Salsipuedes, Río Ceballos u otra localidad) y nota.
  - Valida los datos antes de abrir WhatsApp.
  - El mensaje sale numerado y ordenado al +54 9 3543 31-3011.
  - El encargo y los datos del cliente quedan guardados en ese navegador al recargar la página.
  - En celular aparece una barra inferior con el total.
- **Links compartibles**: `?marca=lattafa`, `?buscar=yara`, `?genero=mujer`, `?estilo=dulce`, `?orden=precio-asc`.
- **Contador de visitas** (opcional, apagado): ver más abajo.

## Estructura

```
index.html                  Página
assets/css/styles.css       Estilos (colores y tipografías en el bloque :root del principio; el modo noche, al final)
assets/js/catalogo.js       ← DATOS: perfumes, precios, promo, más vendidos, preguntas y contacto
assets/js/notas.js          ← Notas olfativas y estilo de cada perfume
assets/js/app.js            Lógica (no hace falta tocarlo)
assets/js/hero3d.js         Viaje 3D al bajar y parallax de la portada (three.js se carga desde cdn.jsdelivr.net)
assets/img/marca/           Logo y monograma
assets/img/perfumes/        Fotos de perfumes + LEEME.txt con el nombre de archivo de cada uno
assets/img/                 Íconos y la imagen para compartir el link (og-le-perfam.jpg)
```

## Cómo actualizar

Todo se edita en **`assets/js/catalogo.js`** (y las notas, en `assets/js/notas.js`). Desde GitHub: abrí el archivo, tocá el lápiz (*Edit*), hacé el cambio y apretá **Commit changes**. La página se actualiza sola en uno o dos minutos.

**Cambiar un precio** (sin puntos ni signo $):

```js
{ nombre: "Khamrah", genero: "Unisex", precio: 59900 },
```

**Poner un perfume en promo** (muestra el precio anterior tachado y el porcentaje):

```js
{ nombre: "Khamrah", genero: "Unisex", precio: 55900, antes: 59900 },
```

**Marcar un perfume como nuevo** (etiqueta «Nuevo» y aparece en «Recién llegados»; se muestran hasta 6):

```js
{ nombre: "Khamrah", genero: "Unisex", precio: 59900, nuevo: true },
```

Cuando deje de ser nuevo, borrá `, nuevo: true`.

**Agregar un perfume**: copiá una línea dentro de su marca y cambiá los datos. **Agregar una marca**: copiá un bloque `{ marca: "...", perfumes: [ ... ] },` completo. Las marcas se ordenan solas alfabéticamente.

**Agregar una foto**

1. Subí la foto a `assets/img/perfumes/` con el nombre que figura en `assets/img/perfumes/LEEME.txt` (por ejemplo `lattafa-khamrah.jpg`). Ideal: cuadrada, de 800 × 800 px o más.
2. Agregale `foto: true` a ese perfume:

```js
{ nombre: "Khamrah", genero: "Unisex", precio: 59900, foto: true },
```

Si la foto tiene otro nombre o es .webp, usá `foto: "nombre-del-archivo.webp"`.

**Fotos adicionales** (se ven al pasar el mouse por la tarjeta y en la ficha): subilas a la misma carpeta y listalas en `fotosExtra`:

```js
{ nombre: "Asad", genero: "Hombre", precio: 40900, foto: "lattafa-asad.webp", fotosExtra: ["lattafa-asad-2.webp", "lattafa-asad-3.webp"] },
```

Usá fotos propias o del fabricante, sin marcas de agua ni carteles de otros vendedores.

**Datos opcionales**: `descripcion: "..."` (texto corto), `enStock: true` (muestra «Entrega inmediata»), `agotado: true` (muestra «No disponible por ahora» y no se puede agregar).

**Promo**:

- En el bloque `promo` cambiá el título y los perfumes. Para ocultarla, poné `activa: false`.
- `fecha: "2026-10-18"` es el día de la cuenta regresiva (año-mes-día).
- `encargarHasta: "2026-10-15"` muestra «Encargá hasta el …». Vacío (`""`) no muestra nada.
- El texto de la franja superior está en `tienda.bannerPromo`.

**Más vendidos**: en `masVendidos`, marca y nombre exactamente como figuran en el catálogo.

**Preguntas frecuentes**: en `preguntas`, cada una con `p` (pregunta) y `r` (respuesta). Se pueden agregar, sacar o reordenar.

**Notas de un perfume** (en `assets/js/notas.js`). La clave es `marca-perfume`, igual que el nombre de la foto:

```js
"marca-perfume": { "estilos": ["Dulce", "Oriental"], "familia": "Familia olfativa",
  "salida": ["nota", "nota"], "corazon": ["nota", "nota"],
  "fondo": ["nota", "nota"], "fuente": "Sitio de donde salen las notas", "url": "https://..." },
```

Copiá las notas de la marca o de una tienda especializada, y poné esa página en `fuente` y `url`.

- `estilos`: uno o dos de Dulce, Frutal, Floral, Fresco, Amaderado y Oriental. Es lo que usan el filtro y el test.
- Si un perfume no tiene notas, la ficha muestra «Todavía no tenemos las notas de este perfume» con la consulta por WhatsApp.

**WhatsApp e Instagram**: en el bloque `contacto`.

**Sacar el 3D**: en `index.html` borrá la línea `<script src="assets/js/hero3d.js"></script>`. La portada queda con el fondo de luz, sin la escena ni el movimiento.

**Colores del modo noche**: al final de `assets/css/styles.css`, en el bloque `:root[data-tema="noche"]`.

## Publicar en GitHub Pages

1. Creá una cuenta en github.com (gratis) y un repositorio nuevo, por ejemplo `le-perfam`, **público**.
2. Subí **todo el contenido** de esta carpeta a la raíz del repositorio (**Add file → Upload files**), incluida la carpeta `assets` y el archivo `.nojekyll`. Arrastrá los archivos y carpetas, no el zip.
3. En **Settings → Pages**, elegí **Deploy from a branch**, rama **main**, carpeta **/ (root)** y guardá.
4. En uno o dos minutos queda online en `https://TU-USUARIO.github.io/le-perfam/`.

Cuando tengas la dirección definitiva, en `index.html` cambiá `og:image` por la dirección completa de la imagen (por ejemplo `https://tu-usuario.github.io/le-perfam/assets/img/og-le-perfam.jpg`). Así se ve la vista previa al compartir el link por WhatsApp o Instagram.

### Dominio propio (opcional, por ejemplo `leperfam.com.ar`)

1. Registrá el dominio. Los `.com.ar` se registran en NIC Argentina (nic.ar); los `.com`, en cualquier registrador.
2. En el panel DNS del dominio cargá:
   - Cuatro registros **A** para el dominio principal (`@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`.
   - Un registro **CNAME** para `www` que apunte a `TU-USUARIO.github.io` (sin el nombre del repositorio).
3. En GitHub, **Settings → Pages → Custom domain**: escribí el dominio y apretá **Save**.
4. Cuando los DNS se actualicen (puede tardar hasta 24 horas), en esa misma página marcá **Enforce HTTPS**.
5. Cambiá `og:image` en `index.html` por la dirección con tu dominio.

Las direcciones y los pasos son los de la documentación oficial de GitHub Pages («Managing a custom domain for your GitHub Pages site»). Si GitHub los cambia, valen los de esa página.

## Aparecer en Google Maps (Perfil de Empresa de Google)

1. Entrá a business.google.com con la cuenta de Google de la tienda y creá el perfil: nombre **Le Perfam**, categoría (por ejemplo «Perfumería»).
2. Como la tienda atiende por encargo, indicá que **no recibís clientes en un local**. Así la dirección no se muestra.
3. En **Editar perfil → Ubicación → Área de servicio**, cargá las localidades donde entregan, por ejemplo Salsipuedes y Río Ceballos.
   - Se pueden cargar hasta 20 áreas, por localidad o código postal.
   - Google pide que el área total no pase de unas 2 horas de manejo desde la base.
4. Agregá el teléfono de WhatsApp, el link de la web y el de Instagram, el horario y fotos propias.
5. Google verifica el perfil (los pasos los indica Google en el momento). Los cambios del área de servicio pueden tardar hasta 48 horas en verse.

Pasos según la ayuda oficial de Google («Administrar el área de servicio de tu empresa»). Si cambian, valen los de esa página.

## Contador de visitas (opcional)

Está apagado. Usa **GoatCounter**, un contador de visitas simple y liviano.

1. Creá una cuenta en goatcounter.com y elegí un código (por ejemplo `leperfam`). Tu panel queda en `https://leperfam.goatcounter.com`.
2. En `catalogo.js`, en `tienda`, poné ese código: `contadorVisitas: "leperfam"`.

Además de las visitas, cuenta (sin datos personales):

- qué fichas se abren;
- qué perfumes se agregan o se guardan en favoritos;
- cuántas veces se envía el encargo o la lista de favoritos;
- cuántas personas terminan el test.

Según su web, GoatCounter.com es gratis para un uso razonable, incluido el de un comercio chico a mediano.

---

Precios sujetos a cambio y a disponibilidad.
