# world-white-web

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

[![Build Status](https://travis-ci.com/german1608/world-white-web.svg?token=aqTuGezTjtpGskdvd7vs&branch=master)](https://travis-ci.com/german1608/world-white-web)

MiniProyecto de Desarrollo de Software para la USBve.


## Integrantes

* Yuni Quintero
* Germán Robayo
* Nairelys Hernandez

## Tutores

* Yudith Cardinale
* Irvin Dongo

## Instalación del Proyecto

Si te interesa probar directamente la extensión, en la lista de [releases](https://github.com/World-White-Web/www-front-end/releases) de este repositorio tendrás los artefactos para poder probar. Descárgate la última versión, descomprímela y la instalas siguiendo los pasos de la siguiente sección.

### Como instalar la extensión

En chrome, ve a `chrome://extensions`

1. Activa el modo de desarrollo (Developer Mode)
2. Haz clic en Añadir paquete (Load unpacked) y dirígete a la carpeta donde está el código de la aplicación.
3. Si todo sale bien, se debería de añadir la extensión satisfactoriamente.

Si te interesa colaborar en el desarrollo de esta extensión, abajo conseguirás los pasos para poder configurar en ambiente de desarrollo.

### Requerimientos

En cuanto a aplicaciones/software, solo es necesario tener instalado Node lts/dubnium (v10.16.0). Se recomienda usar nvm para administrar las versiones locales de node. La versión de npm puede ser la que venga por defecto con instalar la versión de node especificada con nvm.

### Cómo ejecutar

Antes de todo, como en cualquier proyecto de npm, ejecuta el comando `npm install` para descargar todas las dependencias.

#### Para desarrollo

Ejecuta `npm start` para montar un servidor de desarrollo. Esto generara, la primera vez que lo ejecutes y luego cada vez que guardes algún archivo, los archivos transpilados que pueden ejecutarse en el navegador. Todo estará en la carpeta `build`.

Para instalar la extensión y probarla, sigue los pasos que están en la sección [Como instalar la extensión](#./como-instalar-la-extensión).

Cada vez que guardes un archivo, se volverán a transpilar los archivos. Sin embargo, hay que tomar los siguientes pasos para ver realmente los cambios en el navegador:

1. Darle a "Recargar" en `chrome://extensions`. Esto recargará el popup y la vista de configuración (a la cuál accedes en las opciones para administrar la extensión)
2. En el caso de desarrollar cosas que hagan scraping, es necesario que recargues la página que estés a la que le estés haciendo scraping para que chrome le inserte nuevamente el código a la página a analizar.

#### Para producción

Ejecutar el comando `npm run build` generará un artefacto optimizado para producción. Lo cargas siguiendo los pasos de la sección [Como instalar la extensión](#./como-instalar-la-extensión).

## Como contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md)

### Convenciones de rama

* `feature/*` para ramas que contienen cosas nuevas. Ejemplo: `feature/anade-soporte-a-facebook`.
* `bugfix/*` para ramas que contienen fixes a cosas ya existentes. Ejemplo: `bugfix/arregla-calculo-de-pesos`.


## En caso de dudas

Contactar al administrador del repo: @german1608
