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

    getConfig() {
        return this.config;
    }
    getConfigSchema() {
        return this.schema;
    }
    async saveConfig(config) {
        const validateResult = await this.methods.validateConfig(config);

        if (validateResult && !validateResult.error) {
            this.config = config;

            return this.methods.saveConfig(config);
        } else {
            return validateResult;
        }
    }
    async validateConfig(config) {
        return this.methods.validateConfig(config);
    }

    getConfiguratorMethods() {
        return {
            getConfig: this.getConfig,
            getConfigSchema: this.getConfigSchema,
            saveConfig: this.saveConfig,
            validateConfig: this.validateConfig
        };
    }
}

module.exports = Configurator
