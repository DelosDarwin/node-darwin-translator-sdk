const MoleClient = require('mole-rpc/MoleClient');
const MQTTTransportClient = require('mole-rpc-transport-mqtt/TransportClient');

class NLP  {
    constructor({mqttClient, translatorId}) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!translatorId) throw new Error('"translatorId" required');

        this.rpcClient = new MoleClient({
            transport: new MQTTTransportClient({
                mqttClient,
                inTopic: `/rpc/nlp/${translatorId}`,
                outTopic: `/rpc/${translatorId}/nlp`
            })
        });
    }

    async textToNVA({text = ''}) {
        return this.rpcClient.callMethod('textToNVA', [{text}]);
    }
}

module.exports = NLP;
