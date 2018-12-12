const TRANSLATOR_ID = process.env.TRANSLATOR_ID || 'TRANSLATOR-12837912739';
const MQTT_ENTPOINT = process.env.TRANSLATOR_ID || 'tcp://localhost:1883';

const MQTT = require("async-mqtt");
const CoreChannel = require('../lib/CoreChannel');
const NLP = require('../lib/NLP');
// const Configurator = require('../lib/Configurator');

async function main() {
    const mqttClient = MQTT.connect(MQTT_ENTPOINT);
    await waitForEvent(mqttClient, 'connect');

    const configuration = {
        mqttClient, 
        translatorId: TRANSLATOR_ID
    };

    const coreChannel = new CoreChannel(configuration);
    const nlp = new NLP(configuration);

    await coreChannel.init();

    // CORE COMMUNICATION
    const nva = {noun: 'light1', verb: 'on'};
    const coreResult = await coreChannel.executeNVA({ nva });
    console.log('coreChannel.executeNVA', coreResult);

    coreChannel.onNVAMessage(({nva}) => {
        console.log('NVA FROM CORE', nva);
    });


    // NLP COMMUNICATION
    const nlpResult = await nlp.textToNVA({ text: 'Hello, NLP' });
    console.log('NLP.textToNVA', nlpResult);


    // coreChannel.onNVAMessage    (({nva}) => {
    //     const ezloPayload = ezloPayloadBuilder.converNVAToEzloPayload({nva});
    //     return ezloClient.send(ezloPayload);
    // });


    // ezloClient.onMessage(({payload}) => {
    //     const nva = nvaBuilder.converEzloPayloadToNVA({payload});
    //     return coreChannel.executeNVA({ nva });
    // });
}

function waitForEvent(emitter, eventName) {
    return new Promise((resolve, reject) => {
        emitter.on(eventName, resolve);
    }); 
}


main().then(console.log, console.error);