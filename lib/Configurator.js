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
            getConfig: this.getConfig.bind(this),
            getConfigSchema: this.getConfigSchema.bind(this),
            saveConfig: this.saveConfig.bind(this),
            validateConfig: this.validateConfig.bind(this)
        };
    }

    async createConfigSchemaFromNVA({ coreChannel, translatorId, accessToken, sourceTranslator }) {
        const { fields } = this.schema;

        const fieldsWithFetchedOptions = await Promise.all(fields.map(async field => {
            const { options, optionsNVA } = field;
            const { values } = options;

            if (!optionsNVA) return field;

            if (optionsNVA && !values) {
                throw new Error(`Error on creating configurator schema: Options values in ${field.name} field required`);
            }

            if (optionsNVA && values) {
                const coreResponse = await coreChannel.executeNVA({
                    nva: optionsNVA,
                    sourceTranslator,
                    manipulatorId: translatorId,
                    accessToken
                })

                const { data } = coreResponse[0];

                const { key: keyField, value: valueField } = values;

                const options = data.map(item => ({
                    key: item[keyField],
                    value: item[valueField]
                }))

                const newField = JSON.parse(JSON.stringify(field))

                delete newField.optionsNVA;
                newField.options = options;

                return newField;
            }
        }))

        this.schema = { fields: fieldsWithFetchedOptions };
    }
}

module.exports = Configurator
