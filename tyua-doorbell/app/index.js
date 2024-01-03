const TuyaWebsocket = require('tuya-ws').default;
const https = require('https');

const logDebug = (message, ...args) => {
    if (process.env.LOG_LEVEL === 'debug') {
        console.log(message, ...args);
    }
}
const logInfo = (message, ...args) => {
    if (process.env.LOG_LEVEL === 'debug' || process.env.LOG_LEVEL === 'info') {
        console.log(message, ...args);
    }
}

const validateEnv = () => {
    const requiredEnvVariables = ['TUYA_CLIENT_ID', 'TUYA_CLIENT_SECRET', 'TUYA_REGION', 'TUYA_DEVICE_ID', 'WEBHOOK_ID'];
    const invalidEnvVariables = [];
    requiredEnvVariables.forEach((envVariable) => {
        if (!process.env[envVariable]) {
            invalidEnvVariables.push(envVariable);
        }
    });

    if (invalidEnvVariables.length) {
        throw (`Found these env variables to be invalid: ${invalidEnvVariables.join(', ')}`);
    }
};

const sendWebhook = (payload) => {
    const request = https.request({
        protocol: 'http',
        method: 'POST',
        hostname: 'homeassistant.local.hass.io',
        port: 8123,
        path: `/api/webhook/${WEBHOOK_ID}`,
    });
    request.write(JSON.stringify(payload));
    request.end();
}

const handleMessage = (decodedMessage) => {
    if (decodedMessage?.payload?.data?.devId == process.env.TUYA_DEVICE_ID && decodedMessage?.payload?.data?.bizCode === 'event_notify') {
        logDebug(decodedMessage?.payload?.data, { messageId: decodedMessage.messageId });
        sendWebhook(decodedMessage?.payload?.data);
    }
}

validateEnv();

const client = new TuyaWebsocket({
    accessId: process.env.TUYA_CLIENT_ID,
    accessKey: process.env.TUYA_CLIENT_SECRET,
    url: TuyaWebsocket.URL[process.env.TUYA_REGION?.toUpperCase()],
    env: TuyaWebsocket.env.PROD,
    maxRetryTimes: 100,
});

client.open(() => {
    logInfo('connected');
});

client.message((ws, message) => {
    client.ackMessage(message.messageId);
    handleMessage(message);
    if (process.env.LOG_LEVEL === 'debug') {
        logDebug(message);
    }
});

client.reconnect(() => {
    logInfo('reconnected');
});

client.close((ws, ...args) => {
    logInfo('connection closed', ...args);
});

client.error((ws, error) => {
    console.error(error);
});

client.start();
