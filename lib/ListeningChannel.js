const { Logger }   = require('darwin-translator-sdk/utils/Logger.js');
const MoleServer = require('mole-rpc/MoleServer');

const MQTTTransportServer = require('mole-rpc-transport-mqtt/TransportServer');

const logger = Logger('ListeningChannel');

class ListeningChannel {
    constructor({ mqttClient, translatorId, onNotification }) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!translatorId) throw new Error('"translatorId" required');
        if (!onNotification) throw new Error('"onNotification" required');

        this.onNotification = onNotification;
        this.translatorId = translatorId;

        const transportConfig = {
            mqttClient,
            inTopic  : `/rpc/listening/${translatorId}`,
            outTopic : `/rpc/${translatorId}/listening`
        };

        this.rpcServer = new MoleServer({
            transports : [ new MQTTTransportServer(transportConfig) ]
        });
    }

    init() {
        logger.info('Initialized ListeningChannel');

        this.rpcServer.expose({
            notify: this.handleNotify.bind(this)
        });

        this.rpcServer.run();
    }

    handleNotify(data) {
        if (this.onNotification) {
            this.onNotification(data);
        }
    }
}

module.exports = ListeningChannel;
