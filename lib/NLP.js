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

    async textToNVA({ text = '', sourceTranslator, manipulatorId }) {
        if(!sourceTranslator) throw new Error('"sourceTranslator" required')
        if(!manipulatorId) throw new Error('"manipulatorId" required')

        return this.rpcClient.callMethod('textToNVA', [ { text, sourceTranslator, manipulatorId } ]);
    }

    async clearContext({ sourceTranslator, manipulatorId }) {
        if(!sourceTranslator) throw new Error('"sourceTranslator" required')
        if(!manipulatorId) throw new Error('"manipulatorId" required')

        return this.rpcClient.callMethod('clearContext', [ { sourceTranslator, manipulatorId } ])
    }

    async getNVAFromIntent ({ intent, sourceTranslator, manipulatorId }) {
        if(!sourceTranslator) throw new Error('"sourceTranslator" required')
        if(!manipulatorId) throw new Error('"manipulatorId" required')
        if(!intent) throw new Error('"intent" required')

        return this.rpcClient.callMethod('getNVAFromIntent', [ { intent, sourceTranslator, manipulatorId } ])
    }

    async getResponseSpeech({ nlpResponse, coreResponse, sourceTranslator, manipulatorId }){
        if(!sourceTranslator) throw new Error('"sourceTranslator" required')
        if(!manipulatorId) throw new Error('"manipulatorId" required')
        if(!coreResponse) throw new Error('"coreResponse" required')
        if(!nlpResponse) throw new Error('"nlpReponse" required')

        return this.rpcClient.callMethod('getResponseSpeech', [ { ...nlpResponse, coreResponse, sourceTranslator, manipulatorId } ])
    }
}

module.exports = NLP;
