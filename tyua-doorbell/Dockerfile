# https://github.com/hassio-addons/addon-base/releases
ARG BUILD_FROM=ghcr.io/hassio-addons/base:15.0.3

FROM ${BUILD_FROM}

RUN apk add --no-cache nodejs npm

COPY rootfs /

RUN chmod a+x /usr/bin/doorbell
RUN chmod a+x /etc/services.d/doorbell/run
RUN chmod a+x /etc/services.d/doorbell/finish

COPY app /app
WORKDIR /app
RUN npm i
