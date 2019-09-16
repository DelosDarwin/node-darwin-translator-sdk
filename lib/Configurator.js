const deepCopy = require("../utils/deepCopy");

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

    init({ coreChannel, translatorId, accessToken }) {
        if (!coreChannel) throw new Error('"coreChannel" required');
        if (!translatorId) throw new Error('"translatorId" required');
        if (!accessToken) throw new Error('"accessToken" required');

        this.coreChannel = coreChannel;
        this.translatorId = translatorId;
        this.accessToken = accessToken;
        this.sourceTranslator = translatorId;
    }

    getConfig() {
        return this.config;
    }

    async getConfigSchema() {
        await this.setConfigSchema();
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

    async setConfigSchema() {
        const { fields } = this.schema;

        const fieldsWithFetchedOptions = await Promise.all(fields.map(async field => {
            const { optionsMap, optionsNVA } = field;

            if (!optionsNVA && !optionsMap) return field;

            if (!optionsNVA) {
                throw new Error(`Error on creating configurator schema: "optionsNVA" in ${field.name} field required`);
            }

            if (!optionsMap) {
                throw new Error(`Error on creating configurator schema: "optionsMap" in ${field.name} field required`);
            }

            const { key, value } = optionsMap;

            const coreResponse = await this.coreChannel.executeNVA({
                nva: optionsNVA,
                sourceTranslator: this.sourceTranslator,
                manipulatorId: this.translatorId,
                accessToken: this.accessToken
            })

            const { data, error } = coreResponse[0];

            const newField = deepCopy(field);

            if (error) {
                newField.error = error
                delete newField.options
            } else {
                newField.options = data.map(item => ({
                    key: item[key],
                    value: item[value]
                }))
            }


            delete newField.optionsNVA;

            return newField;
        }))

        this.schema = { fields: fieldsWithFetchedOptions };
    }
}

module.exports = Configurator
