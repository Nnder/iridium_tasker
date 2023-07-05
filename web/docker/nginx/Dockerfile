FROM nginx:1.17.8-alpine

# Copy the public directory
COPY ./public/ /app/public/

# Copy the nginx config file
COPY ./docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./public/certificates/localhost.pem /etc/nginx/ssl/localhost.pem
COPY ./public/certificates/localhost-key.pem /etc/nginx/ssl/localhost-key.pem