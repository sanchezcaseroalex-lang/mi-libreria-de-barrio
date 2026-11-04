# Guía de retratos para la librería

Retratos que aparecen en los diálogos de los clientes. En la tienda los personajes se ven pequeños y los dibujo yo por código; estos retratos son solo para las conversaciones.

**Estilo buscado:** animación pulida y estilizada (no realista): formas suaves y redondeadas, ojos grandes y expresivos, líneas limpias, sombreado cálido, luz de contorno suave y paleta acogedora.

> Algunas herramientas bloquean nombres de estudios o películas. Por eso los prompts describen el estilo en vez de nombrarlo.

---

## 1. Flujo de trabajo (pasos para ti)

1. Genera **primero un personaje de prueba** (Lucía, por ejemplo) y mándamelo antes de hacer los demás. Así comprobamos el estilo antes de gastar tiempo.
2. Para cada personaje, genera primero el retrato **neutro**. Después úsalo como imagen de referencia para pedir las otras tres expresiones (esto mantiene la cara y la ropa iguales). Si tu herramienta tiene "editar imagen" o "referencia de personaje", úsala.
3. Quita el fondo (Photoshop, Canva, remove.bg o similar) y guarda como **PNG con fondo transparente**.
4. Pon los archivos en `libreria/arte/retratos/` con este nombre: `nombre-expresion.png`. Ejemplo: `lucia-neutra.png`, `lucia-contenta.png`.

**Tamaño:** 1024 × 1024 px (cuadrado). Yo lo reduzco después.
**Encuadre:** de pecho hacia arriba, cabeza centrada, con margen alrededor. Los ojos hacia el 40 % de la altura. Mirada al frente o muy ligeramente girada.

## 2. Estilo base (pégalo al principio de TODOS los prompts)

```
Polished 2D animation-film character portrait, stylized and NOT realistic: soft rounded shapes, large expressive eyes, smooth clean linework, warm painterly shading with gentle rim light, cozy warm color palette, friendly appealing character design in the spirit of modern feature animation. Bust shot from the chest up, facing the viewer, plain flat light-grey background, no text, no watermark.
```

## 3. Expresiones (4 por personaje)

Añade al final del prompt del personaje, o úsalo con la imagen de referencia:

| Archivo | Texto a añadir |
|---|---|
| `-neutra` | `neutral relaxed expression, soft closed-mouth smile` |
| `-contenta` | `big warm happy smile, eyes bright, delighted` |
| `-dudosa` | `thoughtful doubtful expression, one eyebrow slightly raised, lips pressed` |
| `-decepcionada` | `gently disappointed expression, slightly sad eyes, small frown, still kind` |

Para mantener el personaje igual entre expresiones: `same character, same outfit, same hairstyle, same lighting, only the facial expression changes`.

---

## 4. Reparto (14 personajes)

Edades, cuerpos y tonos de piel variados a propósito. Cada uno encaja con un tipo de cliente y tendrá su manera de hablar.

### Lucía · la adolescente de romantasía
`Teenage girl, 17, wavy dark-brown hair in a loose bun with a pencil in it, round glasses, oversized mustard hoodie, headphones around her neck, colorful sticky tabs clipped on a book she hugs, excited dreamy eyes, light-brown skin.`

### Don Anselmo · profesor jubilado
`Elderly man, 68, kind wrinkled face, white mustache, tweed vest over a cream shirt, round gold glasses, a pipe-less gentle smile, grey hair combed back, medium skin tone, holding a worn leather book.`

### Marta · enfermera adicta al thriller
`Woman, 34, tired but warm eyes, dark circles, short black bob, long beige trench coat, scarf, holding a takeaway coffee cup, subtle smirk like she knows who the culprit is, olive skin.`

### Hugo · jugador de rol y épica
`Young man, 24, scruffy beard, messy auburn hair under a green beanie, hoodie with small dice pattern, backpack straps visible, enthusiastic geeky grin, freckles, fair skin.`

### Carmen · abuela que compra regalos
`Woman, 56, short silver-streaked brown hair, floral scarf, soft cardigan, fabric tote bag full of wrapped gifts, warm motherly smile, rosy cheeks, medium skin.`

### Nico · chico tímido que apenas lee
`Teenage boy, 16, skater look, black cap worn backwards, hoodie, earbuds, shy sideways glance, hands in pockets, slightly embarrassed expression, dark brown skin.`

### Irene · creadora de contenido literario
`Woman, 29, stylish pastel outfit, bright lipstick, long curly hair with a headband, holding a phone like she is filming, expressive animated face, fashionable earrings, tan skin.`

### Rubén · padre con prisa
`Man, 41, slightly dishevelled, short dark hair, work shirt with rolled sleeves and loosened tie, holding a coffee, harried but kind face, a toddler's drawing sticking out of his pocket, medium skin.`

### Sofía · estudiante de literatura (dark academia)
`Young woman, 22, long straight black hair, dark blazer, plaid scarf, leather satchel, sharp thoughtful eyes, small pearl earrings, slightly pale skin, serious but curious.`

### Abuela Pilar · lectora de misterio
`Elderly woman, 78, tiny and cheerful, white hair in a neat bun, lilac shawl, round pink-tinted glasses, a cane, mischievous twinkle, wrinkled smiling face, light skin.`

### Elena · bookstagrammer
`Woman, 38, elegant, wavy chestnut hair, linen shirt with a camera hanging from her neck, calm aesthetic mood, soft smile, warm brown eyes, olive skin.`

### Teo · niño que quiere dragones
`Boy, 9, big curious eyes, messy black hair, striped t-shirt, a small plush dragon under his arm, wide excited face, dark brown skin.`

### Samir · repartidor de la distribuidora
`Man, 35, friendly delivery worker, short curly black hair, cap with a small book logo, work vest, a cardboard box in his arms, cheerful, tan skin.`

### Tinta · la gata de la librería
`Fluffy ginger cat sitting like a loaf, sleepy half-closed golden eyes, one white paw, tiny bookmark tag on a collar, cozy and smug, same animation style.` (para esta no necesitas las 4 expresiones: sirven neutra y contenta)

---

## 5. Qué haré yo con los retratos

- Los mostraré en el cuadro de diálogo de cada cliente, con su expresión según cómo vaya la conversación (contenta si aciertas, dudosa o decepcionada si no).
- Si quieres retocar el estilo, dímelo tras la primera prueba: mejor cambiarlo en el primer personaje que en los catorce.

---

## 6. Cómo encajan con los muñecos 3D (actualizado)

- Los 13 personajes humanos ya existen en la tienda con el mismo aspecto que describe esta guía (pelo, gafas, gorro, color de la ropa, accesorio). Si cambias algo en un retrato, dímelo y ajusto el muñeco para que sigan siendo parecidos.
- Mientras no haya retrato, el cuadro de conversación enseña un busto del muñeco 3D. En cuanto pongas `lucia-neutra.png` (etc.) en `libreria/arte/retratos/`, se usa automáticamente ese archivo.
- Nombres de archivo exactos: `lucia`, `anselmo`, `marta`, `hugo`, `carmen`, `nico`, `irene`, `ruben`, `sofia`, `pilar`, `elena`, `teo`, `samir` + `-neutra`, `-contenta`, `-dudosa`, `-decepcionada` (.png). Ejemplo: `anselmo-dudosa.png`.
- La gata Tinta no es cliente: de momento no hace falta su retrato.


---

## 7. Protagonistas para elegir (8)

El jugador elige uno de estos 8 y escribe su nombre. Cada uno necesita solo **neutra** y **contenta**. Nombre de archivo: `Protagonista1_neutro.jpg`, `Protagonista1_contento.jpg`, … hasta `Protagonista8`. Pon los JPG en `Personajes/` y ejecuta el script de procesado.
Misma regla de siempre: pega delante el estilo base de la sección 2. Todos llevan un **delantal de librería** del color indicado, busto, mirada al frente.

1. `Young woman, 26, long wavy chestnut-brown hair, hoop earrings, warm brown eyes, light peach skin, teal sweater under a cream bookshop apron.`
2. `Young woman, 25, chin-length bob in copper red, freckles, round glasses, light skin, sage-green blouse under a mustard-yellow apron.`
3. `Young woman, 27, voluminous black curly hair, small gold earrings, deep brown skin, warm smile, blue sweater under a pale-blue apron.`
4. `Elderly woman, 68, white-silver hair in a neat bun with a lilac band, pink round glasses, kind wrinkles, light skin, lavender cardigan under a soft lilac apron.`
5. `Young man, 28, short dark-brown hair, light stubble, tan skin, friendly smile, brown sweater under a sand-colored apron.`
6. `Young man, 26, tousled blond hair, thin black glasses, fair skin, olive-green sweater under a cream apron.`
7. `Elderly man, 72, bald with a full short white beard, deep kind eyes, no glasses, tan skin, warm smile, forest-green cardigan under a cream apron.`
8. `Young man, 25, short tight black curls, deep brown skin, bright smile, navy sweater under an off-white apron.`
