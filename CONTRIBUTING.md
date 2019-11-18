# Como contribuir

El proceso de contribuir o desarrollar en este repositorio es un poco protocolar, lo cuál al principio puede resultar un poco incómodo o fastidioso. Por eso primero se va a listar las grandes ventajas de el porqué todo se está haciendo de esta manera para que se anime al futuro mantenedor del proyecto a seguir este estilo de trabajo.

## Integración Continua

Este proyecto es el front-end del proyecto World White Web. Es sencillamente una extensión para poder permitirle a las personas saber la credibilidad en tiempo real de lo que estén leyendo en las redes sociales. Hay muchas tareas que se repiten constantemente, entre ellas, la generación de las extensiones a ser descargadas por los usuarios.

Travis-ci es un sistema de integración y despliegue continuo. Se encarga de realizar tareas repetitivas automáticamente con cada interacción en el repositorio. Lo que hace explícitamente lo puedes ver en el archivo .travis.yml del repositorio, sin embargo, a grandes rasgos, la tarea más importante que hace el mismo es la generación de las extensiones ya listas a ser usadas.

¿Cómo lo hace? En el build server se corre el comando `npm run build` asociandole un `API_URL` y luego hace otras dos cosas:

1. Incrementa la versión del `package.json` (minoring, incrementa el númerito del medio) y hace un commit con ese cambio
2. Genera un tag de git con esa nueva versión.
3. Pushea ambas cosas, el commit va sobre la rama de interés (`develop` o `master`).
4. Genera un release de github asociado al tag anteriormente genrado, para que pueda ser descargado por los usuarios finales.

Antes de esto, verifica que el proyecto compile correctamente.

Ahora, la generación de artefactos, commits y tags **no** se hace cuando la rama donde se hace el cambio no es la principal. Esto por que siempre suponemos que lo realmente importante está en dichas ramas, las demás **no son** definitivas.

El hacer versionamiento manualmente de código es una tarea bastante fastidiosa. El verificar manualmente que integrar un feature/fix no rompa algo adicional también. Y ambas son muy importantes para mantener la calidad del proyecto. Por eso, recomendamos que se sigan los siguientes pasos para poder desarrollar en el proyecto.

## Como desarrollar

1. Clona el repositorio y haz `checkout` a la rama `develop`.
2. Crea una rama para que desarrolles lo tuyo. Dicha rama debe seguir las [convenciones de rama](#convenciones-de-rama).
3. Cuando creas que tu código está listo, haz un pull request para integrar tu rama a `develop`. Pones de reviewer a todos los otros integrantes del equipo.
4. Al ser aprobado, mergealo. Travis se encargará de hacer las tareas fastidiosas por ti.

### Convenciones de rama

* `feature/*` para ramas que contienen cosas nuevas. Ejemplo: `feature/anade-soporte-a-facebook`.
* `bugfix/*` para ramas que contienen fixes a cosas ya existentes. Ejemplo: `bugfix/arregla-calculo-de-pesos`.

