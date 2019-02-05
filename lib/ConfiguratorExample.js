const configuratorUtils = require('./configuratorUtils.js');

class Configurator {
    constructor({ schema, config, methods }) {
        if (!methods) throw new Error('"methods" required');
        if (!schema) throw new Error('"schema" required');
        if (!config) throw new Error('"config" required');

        this.schema = schema;
        this.methods = methods;
        this.config = config;
    }

    getConfiguratorMethods() {
        return {
            getConfig: async () => {
                const validated = await this.methods.validateConfig(this.config, this.schema)
                    ? this.methods.validateConfig(this.config, this.schema)
                    : configuratorUtils.validateConfig(this.config, this.schema)

                if (validated) {
                    return this.config
                } else {
                    return null
                }
            },
            getConfigSchema: () => {
                return this.schema
            },
            saveConfig: async (config) => {
                const validated = await this.methods.validateConfig
                    ? this.methods.validateConfig(config, this.schema)
                    : configuratorUtils.validateConfig(config, this.schema)

                if (validated) {
                    this.config = config

                    return this.methods.saveConfig
                        ? this.methods.saveConfig(config)
                        : configuratorUtils.saveConfig(config)
                } else {
                    return null;
                }
            },
            validateConfig: async (config) => {
                return this.methods.validateConfig(config, this.schema)
                    ? this.methods.validateConfig(config, this.schema)
                    : configuratorUtils.validateConfig(config, this.schema)
            }
        }
    }
}

module.exports = Configurator
