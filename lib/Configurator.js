const RPCServer = require('../mqtt-transport/RPCServer');

class Configurator  {
    constructor({mqttClient, translatorId, methods, schema}) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!translatorId) throw new Error('"translatorId" required');
        if (!methods) throw new Error('"methods" required');
        if (!schema) throw new Error('"schema" required');

        this.rpcClient = new RPCServer({
            mqttClient,
            inTopic: `${translatorId}-NLP`,
            outTopic: `/translators/${translatorId}/NLP`
        });

        this.schema = schema;
        this.methods = methods;
    }

    async init({}) {
        this.rpcServer.expose({
            getValidationSchema: async () => {
                return this.shema;
            },
            ...this.methods
        });
        return this.rpcClient.callMethod('parse', {text});
    }
}