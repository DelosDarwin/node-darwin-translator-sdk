class Configurator {
    constructor() {}

    init({ schema, config, methods }) {
        if (!methods) throw new Error('"methods" required');
        if (!schema) throw new Error('"schema" required');
        if (!config) throw new Error('"config" required');

        this.schema = schema;
        this.methods = methods;
        this.config = config;

        this.initialized = true
    }

    getConfiguratorMethods() {
        if (!this.initialized) return null

        return {
            getConfig: async () => {
                const validated = await this.methods.validateConfig(this.config)

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
                const validated = await this.methods.validateConfig(config)

                if (validated) {
                    this.config = config
                    return this.methods.saveConfig(config)
                } else {
                    return null;
                }
            },
            validateConfig: async (config) => {
                return this.methods.validateConfig(config)
            }
        }
    }
}

module.exports = new Configurator()
