#!/usr/bin/with-contenv bashio

TUYA_CLIENT_ID=$(bashio::config 'tuya_client_id')
TUYA_CLIENT_SECRET=$(bashio::config 'tuya_client_secret')
TUYA_DEVICE_ID=$(bashio::config 'tuya_device_id')
TUYA_REGION=$(bashio::config 'tuya_region')
WEBHOOK_URL=$(bashio::config 'webhook_url')

LOG_LEVEL=$(bashio::config 'log_level')

node /app/index.js
