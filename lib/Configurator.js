const configuratorUtils = require('./utils/configuratorUtils.js');
const errors = require('./constants/errors.js')

class Configurator {
    constructor({ schema, config, methods = {} }) {
        if (!schema) throw new Error('"schema" required');
        if (!config) throw new Error('"config" required');

        this.schema = schema;
        this.methods = methods;
        this.config = config;
    }

    getConfiguratorMethods() {
        return {
            getConfig: async () => {
                const validated = await this.methods.validateConfig
                    ? this.methods.validateConfig(this.config, this.schema)
                    : configuratorUtils.validateConfig(this.config, this.schema)

                if (validated && validated.success) {
                    return this.config
                } else {
                    return { error: errors.invalidConfig }
                }
            },
            getConfigSchema: () => {
                return this.schema
            },
            saveConfig: async (config) => {
                const validated = await this.methods.validateConfig
                    ? this.methods.validateConfig(config, this.schema)
                    : configuratorUtils.validateConfig(config, this.schema)

                if (validated && validated.success) {
                    this.config = config

                    return this.methods.saveConfig
                        ? this.methods.saveConfig(config)
                        : configuratorUtils.saveConfig(config)
                } else {
                    return { error: errors.invalidConfig };
                }
            },
            validateConfig: async (config) => {
                return this.methods.validateConfig
                    ? this.methods.validateConfig(config, this.schema)
                    : configuratorUtils.validateConfig(config, this.schema)
            }
        }
    }
}

module.exports = Configurator
