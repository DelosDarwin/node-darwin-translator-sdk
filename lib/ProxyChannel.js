const BaseChannel = require('./BaseChannel');

class ProxyChannel extends BaseChannel {
    getDestination() {
        return 'proxy';
    }

    async init() {
        this.initialized = true;

        this.rpcServer.expose({
            processMessage : async (...params) => {
                if (!this.messageHandler) return;
                const result = await this.messageHandler(...params);

                return result || { status: 1 };
            }
        });
    }
}

module.exports = ProxyChannel;

