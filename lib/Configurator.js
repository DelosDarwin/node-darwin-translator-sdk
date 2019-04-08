class Configurator {
    constructor({ schema, config, methods = {} }) {
        if (!methods) throw new Error('"methods" required');
        if (!methods.saveConfig) throw new Error('"\"saveConfig method\" in \"methods\"" required');
        if (!methods.validateConfig) throw new Error('"\"validateConfig\" method in \"methods\"" required');

        this.schema = schema;
        this.methods = methods;
        this.config = config;
    }

    getConfiguratorMethods() {
        return {
            getConfig: async () => {
                return this.config
            },
            getConfigSchema: () => {
                return this.schema
            },
            saveConfig: async (config) => {
                const validationResult = await this.methods.validateConfig(config, this.schema)

                if (validationResult && !validationResult.error) {
                    this.config = config

                    return this.methods.saveConfig(config)
                } else {
                    return validationResult;
                }
            },
            validateConfig: async (config) => {
                return this.methods.validateConfig(config, this.schema)
            }
        }
    }
}

module.exports = Configurator
