#FROM php:7.4-fpm
FROM php:8.1.19-fpm-alpine3.16


ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions gd xdebug


# Copy the php config file

#RUN apt-get install -y php-pgsql

#RUN apt-get update && apt-get install -y \
#        libfreetype6-dev \
#        libjpeg62-turbo-dev \
#        libmcrypt-dev \
#        libpng-dev \
#        libicu-dev \
#        libpq-dev \
#        libxpm-dev \
#        libvpx-dev \
#    && pecl install xdebug \
#    && docker-php-ext-enable xdebug \
#    && docker-php-ext-install -j$(nproc) mcrypt \
#    && docker-php-ext-install -j$(nproc) gd \
#    && docker-php-ext-install -j$(nproc) intl \
#    && docker-php-ext-install -j$(nproc) zip \
#    && docker-php-ext-install -j$(nproc) pgsql \
#    && docker-php-ext-install -j$(nproc) pdo_pgsql \
#    && docker-php-ext-install -j$(nproc) exif \
#    && docker-php-ext-configure gd \
#        --with-freetype-dir=/usr/include/ \
#        --with-jpeg-dir=/usr/include/ \
#        --with-xpm-dir=/usr/lib/x86_64-linux-gnu/ \
#        --with-vpx-dir=/usr/lib/x86_64-linux-gnu/ \

RUN  install-php-extensions pdo pdo_pgsql pgsql
#RUN  apt-get install -y pdo pdo_pgsql pgsql

COPY ./docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# Copy the application code
COPY . /app

EXPOSE 9000

VOLUME ["/app"]
