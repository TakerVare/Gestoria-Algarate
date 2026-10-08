# WP Boilerplate 🌱

Esqueleto para crear un proyecto de WordPress desde cero.

## Características 🖖🏼

- Todo el equipo comparte versiones de WP y plugins.
- Permite el uso del proyecto con o sin docker.
- Sistemas operativos soportados: Linux, Mac y Windows.
- Docker incluye nginx con hardening y TLS.
- Instalación y auto configuración de WordPress.
- Versión de WordPress como variable de entorno.
- Versiones de plugins oficiales con wpackagist.
- Incluye WP-CLI.
- Incluye plugin de ejemplo de CPT y Taxonomías.
- Incluye plugins estandarizados del departamento.
- Incluye plugin de seguridad de Flat 101.
- Incluye plugins de traducción para desarrollo.
- Coding standards de Flat 101.
- Control de vulnerabilidades en dependencias.
- Revisión de código estático sintaxis y PHPStan.
- Configurado para Visual Studio Code con workspace.

## Instalación CLI 🔧

1.  Descarga este repositorio.
    $ git clone git@bitbucket.org:flat101team/flat101-wp-boilerplate.git

2.  Copia los ficheros a la carpeta vacía de tu proyecto.

3.  Descarga el fichero `auth.json` y déjalo en la raíz del proyecto.
    https://bitbucket.org/flat101team/flat101-wp-boilerplate/downloads/auth.json

4.  Accede desde la terminal a la carpeta `install` del proyecto.

5.  Ejecuta el script de instalación:

    ```shell
    $ npm install
    $ npm start
    ```

## Instalación manual 🔧

1.  Descarga este repositorio.

2.  Copia los ficheros a la carpeta vacía de tu proyecto.

3.  Elimina el directorio `.git` e inicializa uno nuevo:

    `$ git init`

4.  Si usas docker:

    4.1. Copia `.env.example` a `.env` e indica tus preferencias.

        Si usas `Linux` o `MacOS` ejecuta:

        ```shell
        $ id
        ```
        Copia tu `uid` y `gid` en las variables `USER_ID` y `GROUP_ID`.

        > Si el `gid` que se muestra es **inferior a 500** usa el mismo de tu `id`. Por ejemplo, si tienes el `uid=502` y `gid=20`. Debes poner `USER_ID=502` y `GROUP_ID=502`.

    4.2. Ejecuta:

        ```shell
        $ docker/install.sh
        ```

        Este script creará tu certificado y lo dejará en el lugar apropiado.

    4.3. En tu sistema asegúrate de que `/etc/hosts` tiene el dominio. En Windows este fichero se encuentra en `C:\Windows\System32\drivers\etc`. Tendrás que editarlo como administrador.

        ```
        sudo vi /etc/hosts
        ```

        Añade tu dominio:

        ```
        127.0.0.1 local.wp-boilerplate.com
        ```

    4.4. Arranca docker:

        ```shell
        $ cd docker
        $ docker compose up
        ```

5.  Configura el proyecto

    Sustituye la versión de WordPress y valores de conexión a base de datos en `sh/wp/.wp.env`. **Recuerda que estos valores serán visibles en el repositorio**. Los valores reales como contraseñas debes ponerlos en `.wp.local.env`, por ejemplo:

    ```
    # Environment: local | development | staging | production
    ENVIRONMENT=production

    # Admin user
    ADMIN_NAME=my_admin_name
    ADMIN_PASSWORD='xxxxx'
    ADMIN_EMAIL=xxx@email.com

    # Database
    DB_PASSWORD='yyyyy'
    ```

6.  Actualiza `composer.json`

    - Actualiza la [versión de PHP](https://www.php.net/supported-versions.php): `"php": ">=8.2",` y `"platform": { "php": "8.2" }`
    - Añade los [plugins](https://wpackagist.org/search?q=&type=plugin&search=) de terceros: `"wpackagist-plugin/all-in-one-wp-security-and-firewall": "5.2.4",`
    - Añade los [temas](https://wpackagist.org/search?q=&type=theme&search=) de terceros: `"wpackagist-theme/twentytwentyfour": "1.0"`
    - Añade tus plugins privados
    - Añade tu tema privado

7.  Descarga el fichero `auth.json` y déjalo en la raíz del proyecto.
    https://bitbucket.org/flat101team/flat101-wp-boilerplate/downloads/auth.json

8.  Construye el proyecto

    - Si usas docker:

    ```shell
    $ docker exec -it -u www-data ${COMPOSE_PROJECT_NAME}-wordpress composer update
    ```

    - Si no usas docker:

    ```shell
    $ composer update
    ```

9.  Entra en Wordpress desde un navegador

```
https://${DOMAIN}/wp-admin/
```

# Composer

Si queremos actualizar las dependencias en nuestro proyecto:

- Si usas docker:

  ```shell
  $ docker exec -it -u www-data ${COMPOSE_PROJECT_NAME}-wordpress composer install
  ```

- Si no usas docker:

  ```shell
  $ composer install
  ```

# Posibles errores 🐛

## Usar docker sin arrancar el contenedor

Si hemos indicado en la configuración que queremos usar Docker, pero no lo hemos arrancado cuando usemos `composer install` o `composer update` recibiremos un error como este:

```
$ composer install
> sh/wp/wp-prepare.launch.sh
Error response from daemon: Container 0b6e854f97d8b4430447b962d9d58a942238c2ef5b67c490aa698eadac8e9b7c is not running
Script sh/wp/wp-prepare.launch.sh handling the wp:prepare event returned with error code 1
Script @wp:prepare was called via pre-install-cmd
```

# Utilidades 💡

## Visual Studio Code

Podemos ejecutar el fichero `wp.code-workspace` situado en el raíz del proyecto. Habilita accesos rápidos a los principales directorios y configura el entorno para los auto-formateadores. Para ello se requieren estas extensiones:

- [PHP Sniffer & Beautifier](https://marketplace.visualstudio.com/items?itemName=ValeryanM.vscode-phpsab) formatea PHP con el formato estándar de Flat 101 para WordPress.

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) formatea JS y JSON con el formato estándar de Flat 101 para Front-end.

## Entrar al contenedor

```shell
$ docker exec -u www-data -it ${COMPOSE_PROJECT_NAME}-wordpress bash
```

## Usar WP-CLI

    -   Si usas docker:

    ```shell
    $ docker exec -u www-data ${COMPOSE_PROJECT_NAME}-wordpress php sh/wp/wp-cli.phar --path=wordpress --info
    ```

    -   Si no usas docker (desde el raíz):

    ```shell
    $ php sh/wp/wp-cli.phar --path=wordpress --info
    ```
