# https://github.com/hassio-addons/addon-base/releases
ARG BUILD_FROM=ghcr.io/hassio-addons/base:15.0.3

FROM ${BUILD_FROM}

RUN apk add --no-cache nodejs npm

COPY rootfs /
RUN chmod a+x /run.sh

WORKDIR /app
RUN npm i

CMD [ "/run.sh" ]
