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
const DEFAULT_LEVEL       = process.env.VERBOSE || LEVELS.INFO;
let   MAX_LABEL_LENGTH    = 0;
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
        return JSON.stringify(param);
    }

    return param;
}

function myFormatDev(service) {
    return printf(({ timestamp: time, level, message }) => {
        return `${time} [ ${addSpacesToEnd(service.green)} ] ${addSpacesToStart(level[COLORS_BY_LEVEL[level]])}: ${formatObject(message)}`;
    });
}

function myFormatProd(service) {
    return printf(({ timestamp: time, level, message }) => {
        return `${time} [ ${addSpacesToEnd(service)} ] ${addSpacesToStart(level)}: ${formatObject(message)}`;
    });
}

const myFormat = IS_DEV_MODE ? myFormatDev : myFormatProd;

/**
 * Initialize logger
 * @param {String} service - String: name of file/module, where logger should be initialized
 * @param {String} level - String: deps of logs, which should be printed
 * @returns {Object} - Object: an instance of logger
 */
module.exports.Logger = function loggerManager(service = '', level = DEFAULT_LEVEL) {
    if (MAX_LABEL_LENGTH < service.length) MAX_LABEL_LENGTH = service.length;

    const logger = createLogger({
        label,
        level,
        format : combine(
            timestamp({ format: 'DD/MM HH:mm:ss.SSS' }),
            myFormat(service),
        ),
        transports : [ 
            new transports.Console(),
            new transports.File({
                maxsize: 1024 * 1000 * 5,
                maxFiles: 2,
                filename: 'out.log',
                dirname: './logs'
            }) 
        ]
    });

    return logger;
};

module.exports.LEVELS = LEVELS;
