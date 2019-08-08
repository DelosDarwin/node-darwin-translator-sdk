const BaseChannel = require('./BaseChannel');

class CoreChannel extends BaseChannel {
    getDestination() {
        return 'core';
    }

    async init() {
        const configuratorMethods = this.configurator ? this.configurator.getConfiguratorMethods() : {}

        this.rpcServer.expose({
            executeNVA: (..._params) => {
                if (this.batchedMessageHandler) {
                    return this.batchedMessageHandler(..._params);
                }
                if (this.singleMessageHandler) {
                    const messages = _params[0];
                    const params = _params.slice(1);
                    return Promise.all(messages
                        .map(message => this.singleMessageHandler(...[ message, ...params ]))
                    );
                }
                return;
            },
            ...configuratorMethods
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

    onNVAMessage(batchedMessageHandler) {
        console.error('WARNING: onNVAMessage method in darwin-translator-sdk/lib/CoreChannel.js is deprecated and will be removed after 08.31.2019');
        console.error('Use onBatchedNVAMessage method instead');
        this.batchedMessageHandler = batchedMessageHandler;
    }

    onBatchedNVAMessage(batchedMessageHandler) {
        this.batchedMessageHandler = batchedMessageHandler;
    }

    onSingleNVAMessage(singleMessageHandler) {
        this.singleMessageHandler = singleMessageHandler;
    }
}

module.exports = CoreChannel;
