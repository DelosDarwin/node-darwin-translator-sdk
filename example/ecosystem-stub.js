const MoleClient = require('mole-rpc/MoleClient');
const MoleServer = require('mole-rpc/MoleServer');
const MQTTTransportClient = require('mole-rpc-transport-mqtt/TransportClient');
const MQTTTransportServer = require('mole-rpc-transport-mqtt/TransportServer');
const MQTT = require("async-mqtt");

const TRANSLATOR_ID = process.env.TRANSLATOR_ID || 'TRANSLATOR-12837912739';
const MQTT_ENTPOINT = process.env.TRANSLATOR_ID || 'tcp://localhost:1883';

async function main() {
    await runCore();
    await runNLP();
}


async function runCore() {
    const mqttClient = MQTT.connect(MQTT_ENTPOINT);
    await waitForEvent(mqttClient, 'connect');

    const coreServer = new MoleServer({
        transports: [ new MQTTTransportServer({
            mqttClient,
            inTopic: '/rpc/+/core',
            outTopic: inToOut
        }) ]
    });

    const coreClient = new MoleClient({
        transport: new MQTTTransportClient({
            mqttClient,
            inTopic: `/rpc/${TRANSLATOR_ID}/core`,
            outTopic: `/rpc/core/${TRANSLATOR_ID}`
        })
    });

    // Messages from translator to core
    coreServer.expose({
        executeNVA(...params) {
            console.log('executeNVA', params);
            return {id: 'SOME ID HERE'};
        }
    });

    setInterval(() => {
        // Send message from core to translator
        coreClient.callMethod('executeNVA', {nva: 'light333.off'});
    }, 2000);
}

async function runNLP() {
    const mqttClient = MQTT.connect(MQTT_ENTPOINT);
    await waitForEvent(mqttClient, 'connect');

    const nlpServer = new MoleServer({
        transports: [ new MQTTTransportServer({
            mqttClient,
            inTopic: '/rpc/+/nlp',
            outTopic: inToOut
        }) ]
    });

    nlpServer.expose({
        textToNVA({text}) {
            return { 
                text, 
                nva: 'light1.on' 
            };
        }
    });
}

function inToOut({inTopic}) {
    const [ slash, namespace, from, to] = inTopic.split('\/');
    const outTopic = `/${namespace}/${to}/${from}`; 
    console.log('inToOut', inTopic, outTopic);
    return outTopic;
}


function waitForEvent(emitter, eventName) {
    return new Promise((resolve, reject) => {
        emitter.on(eventName, resolve);
    }); 
}

main();