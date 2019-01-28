const BaseChannel = require('./BaseChannel');

class CoreChannel extends BaseChannel {
    getDestination() {
        return 'core';
    }

    async init() {
        this.rpcServer.expose({
            executeNVA: (...params) => {
                if (!this.messageHandler) return;
                return this.messageHandler(...params)
            }
        });

        this.initialized = true;

        await this.rpcServer.run();
    }

    async executeNVA(...params) {
        if (!this.initialized) await this.init();

        if (!params[0]) return new Error('No params provided for executeNVA method')
        if (!params[0].nva) return new Error('No nva was provided for executeNVA method')
        if (!params[0].sourceTranslator) return new Error('No sourceTranslator was provided for executeNVA method')

        return this.rpcClient.callMethod('executeNVA', params)
    }

    onNVAMessage(messageHandler) {
        this.messageHandler = messageHandler;
    }
}

module.exports = CoreChannel;
