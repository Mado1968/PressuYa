# Cambio: paleta de marca roja

## Motivo

La interfaz usa actualmente una combinación de azul, gris y naranja. Se quiere
alinear la identidad visual con el rojo `#D73523`, simplificar el resto de la
paleta y hacer que el texto sea negro para facilitar la lectura.

## Cambios propuestos

- Usar `#D73523` en las superficies de marca y las acciones principales, como
  la barra lateral y los botones primarios.
- Usar superficies blancas en el resto de la interfaz, incluidos los estados
  de presupuestos.
- Usar texto negro en las superficies blancas y texto blanco sobre las
  superficies rojas para mantener un contraste legible.
- Centralizar la paleta en los tokens globales y actualizar los componentes
  que tengan colores propios para mantener una apariencia coherente.

No se cambiarán los flujos, el contenido, la tipografía ni la estructura de las
pantallas.

## Capacidades

### Nuevas

- `paleta-visual`: define los colores globales de marca, superficies, texto y
  acciones.

### Modificadas

- Ninguna.

## Impacto

- `src/app/globals.css` y los componentes de interfaz que usan colores
  explícitos o tokens de tema.
- Aplicable al panel, la web pública, los formularios y las páginas de
  presupuestos.
