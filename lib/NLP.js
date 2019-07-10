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

    async textToNVA(data) {
        if(!data.sourceTranslator) throw new Error('"sourceTranslator" required')
        if(!data.manipulatorId) throw new Error('"manipulatorId" required')
        if(!data.text) throw new Error('"manipulatorId" required')

        return this.rpcClient.callMethod('textToNVA', [ data ]);
    }

    async clearContext(data) {
        if(!data.sourceTranslator) throw new Error('"sourceTranslator" required')
        if(!data.manipulatorId) throw new Error('"manipulatorId" required')

        return this.rpcClient.callMethod('clearContext', [ data ])
    }

    async getNVAFromIntent (data) {
        if(!data.sourceTranslator) throw new Error('"sourceTranslator" required')
        if(!data.manipulatorId) throw new Error('"manipulatorId" required')
        if(!data.intent) throw new Error('"intent" required')

        return this.rpcClient.callMethod('getNVAFromIntent', [ data ])
    }

    async getResponseSpeech({ nlpResponse, ...data }){
        if(!nlpResponse) throw new Error('"nlpReponse" required')
        if(!data.sourceTranslator) throw new Error('"sourceTranslator" required')
        if(!data.manipulatorId) throw new Error('"manipulatorId" required')

        return this.rpcClient.callMethod('getResponseSpeech', [ { ...nlpResponse, ...data } ])
    }
}

module.exports = NLP;