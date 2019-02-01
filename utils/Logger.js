require('colors');
const { createLogger, format, transports } = require('winston');

const { label, printf } = format;
const COLORS_BY_LEVEL = {
    'error'   : 'red',
    'warn'    : 'yellow',
    'info'    : 'gray',
    'verbose' : 'cyan',
    'debug'   : 'blue',
    'silly'   : 'magenta'
};

function addSpacesToEnd(text, fixedLength) {
    return text.length > fixedLength
        ? text.slice(0, fixedLength)
        : `${text}${' '.repeat(fixedLength - text.length)}`;
}

function addSpacesToStart(text, fixedLength) {
    return text.length > fixedLength
        ? text.slice(0, fixedLength)
        : `${' '.repeat(fixedLength - text.length)}${text}`;
}

function formatObject(param) {
    if (typeof param === 'object') {
        return JSON.stringify(param);
    }

    return param;
}

/**
 * Initialize logger
 * @param {String} service - String: name of file/module, where logger should be initialized
 * @param {Number} verbose - Number: deps of logs, which should be printed
 * @param {Array} outputs - Array: array of transports, where log should be printed.
 *                                  Allowed array values: 'Console', 'File', 'Http', 'Stream'
 * @returns {Object} - Object: an instance of logger
 */
module.exports = function loggerManager(service = '', verbose = process.env.verbose || 2, outputs = [ 'Console' ]) {
    const myFormat = printf(({ level, message }) => {
        return `${(new Date()).toISOString()} [ ${addSpacesToEnd(service.green, 28)} ] ${addSpacesToStart(level[COLORS_BY_LEVEL[level]], 17)}: ${formatObject(message)}`;
    });

    const LEVELS = [
        'error',
        'warn',
        'info',
        'verbose',
        'debug',
        'silly'
    ];

    const level       = LEVELS[verbose];
    const _transports = outputs
        .filter(output => !!transports[output])
        .map(transport => new transports[transport]());

    const logger = createLogger({
        label,
        level,
        format     : myFormat,
        transports : _transports
    });

    return logger;
};
