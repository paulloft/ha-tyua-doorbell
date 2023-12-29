# https://github.com/hassio-addons/addon-base/releases
ARG BUILD_FROM=ghcr.io/hassio-addons/base:15.0.3

FROM ${BUILD_FROM}

RUN apk add --no-cache nodejs npm

COPY rootfs /

WORKDIR /app
RUN npm i
