const fs = require('fs')
const path = require('path')
const LIVR = require('livr')

const errors = require('../constants/errors.js')

const parse = function parseJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
};

const stringify = function stringifyObject(obj) {
    return typeof obj === 'string' ? obj : JSON.stringify(obj);
};

function writeFile(filePath, file) {
    return new Promise((res, rej) =>
        fs.writeFile(filePath, file, 'utf8', (err) => {
            return err ? rej({ error: errors.writeFailed }) : res({ success: true });
        })
    );
}

const setField = (path = [], data, obj = null) => {
    let objToSet = JSON.parse(JSON.stringify(obj))

    const field = path[0]
    const isFieldIndex = typeof field === 'number';

    if (!objToSet) {
        if (isFieldIndex) objToSet = []
        else objToSet = {}
    }

    const newPath = path.slice(1)
    if (newPath.length > 0) {
        objToSet[field] = setField(newPath, data, objToSet[field])
    } else {
        objToSet[field] = data
    }

    return objToSet
}


const getConfigFromSchema = (schema, pathField, dataField) => {
    const fields = schema.fields
    return fields.reduce((schemaResult, field) => {
        const path = field[pathField]
        const data = field[dataField]
        return setField(path, data, schemaResult)
    }, null)
}

const getLIVRSchema = (schema = {}) => {
    let newSchema = null // TODO: what if schema is Array
    let isFieldRequired = false

    for (let key in schema) {
        const value = schema[key]

        if (Array.isArray(value)) {
            isFieldRequired = value.includes('required') || isFieldRequired
            newSchema = { ...newSchema, [key]: value }
        } else {
            const { livrSchema, isDataRequired } = getLIVRSchema(value)
            const livrSchemaToSet = isDataRequired
                ? { [key]: ["required", { "nested_object": livrSchema } ] }
                : { [key]: { "nested_object": livrSchema } }

            newSchema = { ...newSchema, ...livrSchemaToSet }
            isFieldRequired = isDataRequired
        }
    }

    return { livrSchema: newSchema, isDataRequired: isFieldRequired }
}


exports.validateConfig = (config, schema, pathField = 'configFieldPath', dataField = 'validation') => {
    const parsedConfig = parse(config) || config
    const parsedSchema = parse(schema) || schema
    const validationSchema = getConfigFromSchema(parsedSchema, pathField, dataField)
    const { livrSchema } = getLIVRSchema(validationSchema)

    const validator = new LIVR.Validator(livrSchema)
    const validatedConfig = validator.validate(parsedConfig)

    if (validatedConfig) return { success: true }

    return { error: errors.invalidConfig }
}

exports.saveConfig = async (config, storagePath = 'etc/', configName = 'configTest.json') => {
    const configPath = path.join(storagePath, configName)
    const parsedConfig = parse(config)
    const isJson = Boolean(parsedConfig)
    const jsonConfig = isJson ? config : stringify(config)

    try {
        return await writeFile(configPath, jsonConfig)
    } catch(err) {
        return err
    }
}
