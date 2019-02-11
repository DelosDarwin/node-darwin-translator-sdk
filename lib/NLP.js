const MoleClient          = require('mole-rpc/MoleClient');
const MQTTTransportClient = require('mole-rpc-transport-mqtt/TransportClient');

class NLP  {
    constructor({ mqttClient, translatorId }) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!translatorId) throw new Error('"translatorId" required');

        this.rpcClient = new MoleClient({
            transport: new MQTTTransportClient({
                mqttClient,
                inTopic : `/rpc/nlp/${translatorId}`,
                outTopic: `/rpc/${translatorId}/nlp`
            })
        });
    }

    async textToNVA({ text = '', sourceTranslator }) {
        return this.rpcClient.callMethod('textToNVA', [ { text, sourceTranslator } ]);
    }

    async clearContext({ sourceTranslator }) {
        return this.rpcClient.callMethod('clearContext', [ { sourceTranslator } ])
    }

    async getNVAFromIntent ({ intent, sourceTranslator }) {
        return this.rpcClient.callMethod('getNVAFromIntent', [ { intent, sourceTranslator } ])
    }

    async getResponseSpeech({ nlpResponse, coreResponse, sourceTranslator }){
        return this.rpcClient.callMethod('getResponseSpeech', [ { ...nlpResponse, coreResponse, sourceTranslator } ])
    }
}

module.exports = NLP;
