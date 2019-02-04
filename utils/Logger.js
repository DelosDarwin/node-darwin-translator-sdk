require('colors');
const { createLogger, format, transports } = require('winston');

const { combine, timestamp, label, printf } = format;

const LEVELS = {
    ERROR   : 'error',
    WARN    : 'warn',
    INFO    : 'info',
    VERBOSE : 'verbose',
    DEBUG   : 'debug',
    SILLY   : 'silly'
};

const COLORS_BY_LEVEL = {
    [LEVELS.ERROR]   : 'red',
    [LEVELS.WARN]    : 'yellow',
    [LEVELS.INFO]    : 'gray',
    [LEVELS.VERBOSE] : 'cyan',
    [LEVELS.DEBUG]   : 'blue',
    [LEVELS.SILLY]   : 'magenta'
};

const IS_DEV_MODE         = process.env.MODE === 'development';
let MAX_LABEL_LENGTH      = 0;
const MAX_LEVEL_LENGTH    = 7;
const COLOR_PREFIX_LENGTH = IS_DEV_MODE ? 10 : 0;

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
        return IS_DEV_MODE
            ? `\n${JSON.stringify(param, null, 4)}`
            : JSON.stringify(param);
    }

    return param;
}

const myFormatDev = (service) => printf(({ timestamp: time, level, message }) => {
    return `${time} [ ${addSpacesToEnd(service.green)} ] ${addSpacesToStart(level[COLORS_BY_LEVEL[level]])}: ${formatObject(message)}`;
});

const myFormatProd = (service) => printf(({ timestamp: time, level, message }) => {
    return `${time} [ ${addSpacesToEnd(service)} ] ${addSpacesToStart(level)}: ${formatObject(message)}`;
});

const myFormat = IS_DEV_MODE ? myFormatDev : myFormatProd;

/**
 * Initialize logger
 * @param {String} service - String: name of file/module, where logger should be initialized
 * @param {Number} _level - Number: deps of logs, which should be printed
 * @returns {Object} - Object: an instance of logger
 */
module.exports.Logger = function loggerManager(service = '', level = process.env.verbose || LEVELS.DEBUG) {
    if (MAX_LABEL_LENGTH < service.length) MAX_LABEL_LENGTH = service.length;

    const logger = createLogger({
        label,
        level,
        format : combine(
            timestamp({ format: 'DD/MM HH:mm:ss.SSS' }),
            myFormat(service),
        ),
        transports : [ new transports.Console() ]
    });

    return logger;
};

module.exports.LEVELS = LEVELS;