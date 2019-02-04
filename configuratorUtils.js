const fs = require('fs')
const path = require('path')
const LIVR = require('livr')

const parse = function parseJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.log('JSON parse error: ', e);

        return null;
    }
};

const stringify = function stringifyObject(obj) {
    return typeof obj === 'string' ? obj : JSON.stringify(obj);
};


const schemaExample = { fields: [
    {
        name: 'ezlo',
        validation: [ 'required' ],
        configPath: [ 'ezlo' ]
    },
    {
        name: 'ezlo',
        label: 'Email for ezlo',
        type: 'ezlo',
        validation: [ 'required' ],
        value: '',
        disabled: false,
        placeholder: 'Type email here...',
        configPath: ['ezlo', 'credentials', 'email']
    },
    {
        name: 'domain',
        label: 'Ezlo domain',
        type: 'text',
        validation: [ 'required', { max_length: 20 }, 'url'],
        value: '',
        disabled: false,
        placeholder: 'Type domain here...',
        configPath: ['ezlo', 'domain']
    }
]}

const LIVRSchemaExample = {
    ezlo: [ 'required', { 'nested_object': {
        domain: [ 'required', { max_length: 20 }, 'url'],
        credentials: [ 'required', { 'nested_object': {
            email: [ 'required', { max_length: 45 }, 'email' ]
        }} ]
    }} ]
}

const setField = (path = [], data, obj = null) => {
    console.log('data', data)
    const isObjToSetNotNil = Boolean(obj);
    const isObjToSetObj = typeof obj === 'object' && isObjToSetNotNil;
    const isObjToSetArray = Array.isArray(obj);
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

const getSchemaObject = (schema, pathField, dataField) => {
    const fields = schema.fields
    return fields.reduce((schemaResult, field) => {
        const path = field[pathField]
        const data = field[dataField]
        return setField(path, data, schemaResult)
    }, null)
}

const getLIVRSchema = (schema = {}) => {
    console.log(schema)
    let newSchema = {} // TODO: what if schema is Array

    for (let key in schema) {
        const schemaValue = schema[key]
        const isSchemaValueObject = schemaValue && typeof schemaValue === 'object'
        const isSchemaValueArray = Array.isArray(schemaValue)

        let value = isSchemaValueObject && !isSchemaValueArray ? { nested_object: getLIVRSchema(schemaValue) } : schemaValue
        newSchema[key] = value
    }

    return newSchema
}

const getLIVRSchemaWithRequired = (schema = {}) => {
    let newSchema = null // TODO: what if schema is Array
    let isFieldRequired = false

    for (let key in schema) {
        const value = schema[key]

        if (Array.isArray(value)) {
            isFieldRequired = value.includes('required') || isFieldRequired
            newSchema = { ...newSchema, [key]: value }
        } else {
            const { livrSchema, isDataRequired } = getLIVRSchemaWithRequired(value)
            const livrSchemaToSet = isDataRequired
                ? { [key]: ["required", { "nested_object": livrSchema } ] }
                : { [key]: { "nested_object": livrSchema } }

            newSchema = { ...newSchema, ...livrSchemaToSet }
            isFieldRequired = isDataRequired
        }
    }

    return { livrSchema: newSchema, isDataRequired: isFieldRequired }
}


exports.validateConfig = (schema, config) => {
    const parsedConfig = parse(config) || config
    const validationSchema = getSchemaObject(schema, 'configPath', 'validation')
    const { livrSchema } = getLIVRSchemaWithRequired(validationSchema)
    console.log('LIVRValidationSchema', JSON.stringify(livrSchema))
    console.log('Config to validate', JSON.stringify(parsedConfig))

    const validator = new LIVR.Validator(livrSchema)
    const validatedConfig = validator.validate(parsedConfig)
    console.log('errors', validator.getErrors())
    console.log('validatedConfig', validatedConfig)

    if (validatedConfig) return validatedConfig
}

exports.saveConfig = (storagePath, config) => {
    const configPath = path.join(storagePath, 'configTest.json')
    const parsedConfig = parse(config)
    const isJson = Boolean(parsedConfig)
    const jsonConfig = isJson ? config : stringify(config)

    console.log('SAVE CONFIG')

    // fs.writeFile(configPath, jsonConfig, 'utf8', (err) => {
    //     if (err) {
    //         throw new Error(`Error on save config: ${err}`)
    //     }
    //     console.log('The config has been saved!')
    //     return 'The config has been saved!'
    // })
}
