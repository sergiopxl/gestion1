# Usa la imagen oficial de Apache + PHP
FROM php:7.4-apache

# Instala las extensiones PHP necesarias
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copia los archivos web al directorio del servidor Apache
COPY ./www/ /var/www/html/

# Expone el puerto 80
EXPOSE 80
