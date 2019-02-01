require('colors');
const { createLogger, format, transports } = require('winston');

const { combine, timestamp, label, printf } = format;
const COLORS_BY_LEVEL = {
    'error'   : 'red',
    'warn'    : 'yellow',
    'info'    : 'gray',
    'verbose' : 'cyan',
    'debug'   : 'blue',
    'silly'   : 'magenta'
};

let MAX_LABEL_LENGTH = 0;
const MAX_LEVEL_LENGTH = 7;
const COLOR_PREFIX_LENGTH = 10;

function addSpacesToEnd(text) {
    const fixedLength = MAX_LABEL_LENGTH + COLOR_PREFIX_LENGTH;

    return text.length > fixedLength
        ? text.slice(0, fixedLength)
        : `${text}${' '.repeat(fixedLength - text.length)}`;
}

function addSpacesToStart(text) {
    const fixedLength = MAX_LEVEL_LENGTH + COLOR_PREFIX_LENGTH;

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
 * @returns {Object} - Object: an instance of logger
 */
module.exports = function loggerManager(service = '', verbose = process.env.verbose || 2) {
    if (MAX_LABEL_LENGTH < service.length) MAX_LABEL_LENGTH = service.length;
    const myFormat = printf(({ timestamp: time, level, message }) => {
        return `${time} [ ${addSpacesToEnd(service.green)} ] ${addSpacesToStart(level[COLORS_BY_LEVEL[level]])}: ${formatObject(message)}`;
    });

    const LEVELS = [
        'error',
        'warn',
        'info',
        'verbose',
        'debug',
        'silly'
    ];

    const level = LEVELS[verbose];

    const logger = createLogger({
        label,
        level,
        format : combine(
            timestamp({ format: 'DD/MM HH:mm:ss.SSS' }),
            myFormat,
        ),
        transports : [ new transports.Console() ]
    });

    return logger;
};
