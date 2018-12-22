const BaseChannel = require('./BaseChannel');

class CoreChannel extends BaseChannel {
    getDestination() {
        return 'core';
    }

    init() {
        this.rpcServer.expose({
            executeNVA: (...params) => {
                if (!this.messageHandler) return;
                return this.messageHandler(...params)
            }
        });
        this.initialized = true;
    }

    async executeNVA(...params) {
        if (!this.initialized) this.init();

        return  this.rpcClient.callMethod('executeNVA', ...params)
    }

    onNVAMessage(messageHandler) {
        this.messageHandler = messageHandler;
    }
}

module.exports = CoreChannel;
