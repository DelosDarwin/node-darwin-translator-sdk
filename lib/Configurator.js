class Configurator {
    constructor({ schema, config, methods = {} }) {
        if (!schema) throw new Error('"schema" required');
        if (!config) throw new Error('"config" required');
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
                const validateResult = await this.methods.validateConfig(config, this.schema)

                if (validateResult && !validateResult.error) {
                    this.config = config

                    return this.methods.saveConfig(config)
                } else {
                    return validateResult;
                }
            },
            validateConfig: async (config) => {
                return this.methods.validateConfig(config, this.schema)
            }
        }
    }
}

module.exports = Configurator
