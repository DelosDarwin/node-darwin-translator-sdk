const TRANSLATOR_ID = process.env.TRANSLATOR_ID || 'TRANSLATOR-12837912739';
const MQTT_ENTPOINT = process.env.TRANSLATOR_ID || 'tcp://localhost:1883';

const MQTT               = require('async-mqtt');
const CoreChannel        = require('../lib/CoreChannel');
const NLP                = require('../lib/NLP');
const { Logger, LEVELS } = require('../utils/Logger.js');

const logger = Logger('translator', LEVELS.DEBUG);

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
    const nva = [ { noun: 'light1', verb: 'on' } ]; // or 'light1.on'
    const coreResult = await coreChannel.executeNVA({ nva, sourceTranslator: TRANSLATOR_ID });
    logger.info('coreChannel.executeNVA');
    logger.debug(coreResult);

    coreChannel.onNVAMessage(({ nva }) => {
        logger.info('NVA FROM CORE');
        logger.debug(nva);
    });

    // NLP COMMUNICATION
    const nlpResult = await nlp.textToNVA({ text: 'Hello, NLP' });
    logger.info('NLP.textToNVA');
    logger.debug(nlpResult);
}

function waitForEvent(emitter, eventName) {
    return new Promise((resolve, reject) => {
        emitter.on(eventName, resolve);
    }); 
}

main().then(logger.info, logger.error);