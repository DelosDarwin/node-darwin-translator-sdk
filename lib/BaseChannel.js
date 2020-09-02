const MoleClient = require('mole-rpc/MoleClient');
const MoleServer = require('mole-rpc/MoleServer');
const MQTTTransportClient = require('mole-rpc-transport-mqtt/TransportClient');
const MQTTTransportServer = require('mole-rpc-transport-mqtt/TransportServer');
const logger = require('@delos-tech/darwin-logger').getLogger('BaseChannel');

class BaseChannel {
    constructor({ mqttClient, translatorId, configurator }) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!translatorId) throw new Error('"translatorId" required');

        this.translatorId = translatorId;
        this.configurator = configurator;
        this.initialized  = false;

        const destination = this.getDestination();

        const transportConfig = {
            mqttClient,
            inTopic  : `rpc/${destination}/${translatorId}`,
            outTopic : `rpc/${translatorId}/${destination}`
        };

        logger.debug(`input channel topic : ${transportConfig.inTopic}`);
        logger.debug(`output channel topic: ${transportConfig.outTopic}`);

        this.rpcClient = new MoleClient({
            transport : new MQTTTransportClient(transportConfig)
        });

        this.rpcServer = new MoleServer({
            transports : [ new MQTTTransportServer(transportConfig) ]
        });
    }

    onMessage(messageHandler) {
        this.messageHandler = messageHandler;
    }

    init() {
        // expose Method and set this.initialized = true;
    }

    async rpcClientMethod() {
        // if !this.initialized call this.init()
        // this.rpcClient.callMethod('rpcClientMetod', ...params (from arguments) )
    }
}

module.exports = BaseChannel;
