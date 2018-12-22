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
            try {
                const result = await this.rpcClient.callMethod('executeNVA', ...params)

                resolve(result);
            } catch (e) {
                reject(e)
            }
        });
    }

    onNVAMessage(messageHandler) {
        this.messageHandler = messageHandler;
    }
}

module.exports = CoreChannel;
