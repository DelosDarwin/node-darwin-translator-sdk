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
        
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(reject, 1000);
            const result = await this.rpcClient.callMethod('executeNVA', ...params)

            clearTimeout(timeoutId);
            resolve(result);
        });
    }

    onNVAMessage(messageHandler) {
        this.messageHandler = messageHandler;
    }
}

module.exports = CoreChannel;
