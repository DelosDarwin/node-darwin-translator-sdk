class NLPService {
    constructor({ mqttClient, translatorId } = {}) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!translatorId) throw new Error('"translatorId" required');
    }

    async textToNVA({ text = '' } = {}) {
        return NLPMessageToNVA(text);
    }
}

function NLPMessageToNVA(text) {
    const nlpTextArray = text.split(' ');

    if (nlpTextArray.length === 1) return text;

    const nvaQueryArray = [];
    const nouns = [];
    const verbs = [];
    const adverbs = [];

    nlpTextArray.forEach((str) => {
        if (str.match('#')) nouns.push(str);
        else if (str.match('=')) adverbs.push(str);
        else verbs.push(str);
    });

    if (verbs.length > 1 || !verbs.length) {
        return 'false';
    }

    const noun = composeNoun(nouns);
    const verb = composeVerb(verbs);
    const adverb = composeAdverb(adverbs);

    nvaQueryArray.push({
        noun,
        verb,
        adverb
    });

    return nvaQueryArray;
}

function composeNoun(nouns) {
    return nouns.map((str, index) => {
        if (index === 0) return str.replace('#', '');

        return str.replace('#', '.');
    }).join('');
}

function composeVerb(verbs) {
    return verbs[0];
}

function composeAdverb(adverbs) {
    let prevAdverb = null;
    const adverbsObject = {};

    adverbs.forEach(str => {
        const key = str.replace(/=.+/, '');
        const value = str.replace(/.+=/, '');

        if (key === prevAdverb) {
            return typeof adverbsObject[key] === 'object' ?
                adverbsObject[key] = [ ...adverbsObject[key], value ] :
                adverbsObject[key] = [ adverbsObject[key], value ];
        }

        prevAdverb = key;

        adverbsObject[key] = value;
    });

    return adverbsObject;
}

module.exports = NLPService;
