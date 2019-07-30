# world-white-web

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

[![Build Status](https://travis-ci.com/german1608/world-white-web.svg?token=aqTuGezTjtpGskdvd7vs&branch=master)](https://travis-ci.com/german1608/world-white-web)

MiniProyecto de Desarrollo de Software para la USBve.


## Integrantes

* Yuni Quintero
* Germán Robayo

## Tutores

* Yudith Cardinale
* Irvin Dongo

## Instalación del Proyecto

### Requerimientos

Solo es necesario tener instalado Node lts/dubnium (v10.16.0). Se recomienda usar nvm para administrar las versiones locales de node.

### Cómo ejecutar

#### Para desarrollo

1. Ejecuta `npm install` para descargar todas las dependencias.
2. Ejecuta `npm start` para correr el servidor de desarrollo. El mismo se encarga recargar las páginas en el navegador cuando guardas alguna modificación a los archvos del repositorio.
3. En chrome, ve a `chrome://extensions`
    1. Activa el modo de desarrollo (Developer Mode)
    2. Haz clic en Añadir paquete (Load unpacked) y dirígete a este repositorio en la carpeta build.
    3. Si todo sale bien, se debería de añadir la extensión satisfactoriamente.

#### Para producción

Los pasos son los anteriores cambiando el step 2 por `npm run build`. Esto crea los archivos js minificados y sin tantas cosas de debugging.

## Como contribuir

1. Clona el repositorio y haz `checkout` a la rama `develop`
2. Crea una rama para que desarrolles lo tuyo. Dicha rama debe seguir las [convenciones de rama](#convenciones-de-rama).
3. Cuando creas que tu código está listo, haz un pull request para integrar tu rama a `develop`. Pones de reviewer a todos los otros integrantes del equipo.

### Convenciones de rama

* `feature/*` para ramas que contienen cosas nuevas. Ejemplo: `feature/anade-soporte-a-facebook`.
* `bugfix/*` para ramas que contienen fixes a cosas ya existentes. Ejemplo: `bugfix/arregla-calculo-de-pesos`.


## En caso de dudas

Contactar al administrador del repo: @german1608
