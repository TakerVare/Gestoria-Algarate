# Use this when Dockerfile has changed:
#   $ docker-compose up --force-recreate --build

ARG version=8.3

# https://hub.docker.com/_/php
FROM php:${version}-fpm-alpine


# ------------------------------------------------------------------------------------
# Install dependencies. Based on:
# https://github.com/docker-library/wordpress/blob/master/latest/php8.3/fpm-alpine/Dockerfile

# persistent dependencies
RUN set -eux; \
	apk add --no-cache \
	# in theory, docker-entrypoint.sh is POSIX-compliant, but priority is a working, consistent image
	bash \
	# Ghostscript is required for rendering PDF previews
	ghostscript \
	# Alpine package for "imagemagick" contains ~120 .so files, see: https://github.com/docker-library/wordpress/pull/497
	imagemagick \
	;

# install the PHP extensions we need (https://make.wordpress.org/hosting/handbook/handbook/server-environment/#php-extensions)
RUN set -ex; \
	\
	apk add --no-cache --virtual .build-deps \
	$PHPIZE_DEPS \
	freetype-dev \
	icu-dev \
	imagemagick-dev \
	libjpeg-turbo-dev \
	libpng-dev \
	libwebp-dev \
	libzip-dev \
	# Custom dependencies.
	libxml2-dev \
	curl-dev \
	gettext-dev \
	; \
	\
	docker-php-ext-configure gd \
	--with-freetype \
	--with-jpeg \
	--with-webp \
	; \
	docker-php-ext-install -j "$(nproc)" \
	bcmath \
	exif \
	gd \
	intl \
	mysqli \
	zip \
	# Custom dependencies. Already installed: mbstring
	pdo \
	pdo_mysql \
	xml \
	curl \
	gettext \
	; \
	# WARNING: imagick is likely not supported on Alpine: https://github.com/Imagick/imagick/issues/328
	# https://pecl.php.net/package/imagick
	# https://github.com/Imagick/imagick/commit/5ae2ecf20a1157073bad0170106ad0cf74e01cb6 (causes a lot of build failures, but strangely only intermittent ones 🤔)
	# see also https://github.com/Imagick/imagick/pull/641
	# this is "pecl install imagick-3.7.0", but by hand so we can apply a small hack / part of the above commit
	curl -fL -o imagick.tgz 'https://pecl.php.net/get/imagick-3.7.0.tgz'; \
	echo '5a364354109029d224bcbb2e82e15b248be9b641227f45e63425c06531792d3e *imagick.tgz' | sha256sum -c -; \
	tar --extract --directory /tmp --file imagick.tgz imagick-3.7.0; \
	grep '^//#endif$' /tmp/imagick-3.7.0/Imagick.stub.php; \
	test "$(grep -c '^//#endif$' /tmp/imagick-3.7.0/Imagick.stub.php)" = '1'; \
	sed -i -e 's!^//#endif$!#endif!' /tmp/imagick-3.7.0/Imagick.stub.php; \
	grep '^//#endif$' /tmp/imagick-3.7.0/Imagick.stub.php && exit 1 || :; \
	docker-php-ext-install /tmp/imagick-3.7.0; \
	rm -rf imagick.tgz /tmp/imagick-3.7.0; \
	\
	# some misbehaving extensions end up outputting to stdout 🙈 (https://github.com/docker-library/wordpress/issues/669#issuecomment-993945967)
	out="$(php -r 'exit(0);')"; \
	[ -z "$out" ]; \
	err="$(php -r 'exit(0);' 3>&1 1>&2 2>&3)"; \
	[ -z "$err" ]; \
	\
	extDir="$(php -r 'echo ini_get("extension_dir");')"; \
	[ -d "$extDir" ]; \
	runDeps="$( \
	scanelf --needed --nobanner --format '%n#p' --recursive "$extDir" \
	| tr ',' '\n' \
	| sort -u \
	| awk 'system("[ -e /usr/local/lib/" $1 " ]") == 0 { next } { print "so:" $1 }' \
	)"; \
	apk add --no-network --virtual .wordpress-phpexts-rundeps $runDeps; \
	apk del --no-network .build-deps; \
	\
	! { ldd "$extDir"/*.so | grep 'not found'; }; \
	# check for output like "PHP Warning:  PHP Startup: Unable to load dynamic library 'foo' (tried: ...)
	err="$(php --version 3>&1 1>&2 2>&3)"; \
	[ -z "$err" ]
# ------------------------------------------------------------------------------------

# MySQL CLI (required by WP-CLI)
RUN apk add mysql-client mariadb-connector-c

# OPCache
RUN docker-php-ext-enable opcache
COPY ./php/opcache.ini /usr/local/etc/php/conf.d/

# Debug (error logging)
COPY ./php/debug.ini /usr/local/etc/php/conf.d/

# Update UID and GID of www-data
ARG uid
ARG gid
RUN apk --no-cache add shadow && \
	usermod -u $uid www-data && \
	groupmod -g $gid www-data

# Composer
RUN curl -sS https://getcomposer.org/installer | php -- --version=2.7.9 --install-dir=/usr/local/bin --filename=composer

# Cron
RUN which crond && rm -rf /etc/periodic && rm -f /var/spool/cron/crontabs/root
COPY crontab /var/spool/cron/crontabs/www-data
RUN touch /var/log/cron.log

# Show versions
RUN php -v &&  \
	composer --version

WORKDIR /var/www/html

CMD bash -c "crond -b -l 8 -L /var/log/cron.log && php-fpm"
