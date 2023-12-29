const TuyaWebsocket = require('tuya-ws').default;
const https = require('https');

const validateEnv = () => {
    const requiredEnvVariables = ['TUYA_CLIENT_ID', 'TUYA_CLIENT_SECRET', 'TUYA_REGION', 'TUYA_DEVICE_ID', 'WEBHOOK_URL'];
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
    const endpointParts = process.env.WEBHOOK_URL.split('/');
    const options = {
        protocol: endpointParts[0],
        method: 'POST',
        hostname: endpointParts[2].split(':')[0],
        port: endpointParts[2].split(':').length == 2 ? endpointParts[2].split(':')[1] : (endpointParts[0] == 'https:' ? 443 : 80),
        path: `/${endpointParts.slice(3, endpointParts.length).join('/')}`,
    };
    const request = https.request(options);
    request.write(JSON.stringify(payload));
    request.end();
}

const handleMessage = (decodedMessage) => {
    console.log(decodedMessage?.payload?.data?.status);
    if (decodedMessage?.payload?.data?.devId == process.env.TUYA_DEVICE_ID && decodedMessage?.payload?.data?.bizCode === 'event_notify') {
        if (process.env.LOG_LEVEL === 'info') {
            console.log(decodedMessage?.payload?.data, { messageId: decodedMessage.messageId });
        }
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
    console.info('connected');
});

client.message((ws, message) => {
    client.ackMessage(message.messageId);
    handleMessage(message);
    if (process.env.LOG_LEVEL === 'debug') {
        console.log(message);
    }
});

client.reconnect(() => {
    console.info('reconnected');
});

client.close((ws, ...args) => {
    console.info('connection closed', ...args);
});

client.error((ws, error) => {
    console.error(error);
});

client.start();
