const { assert } = require('chai');
const NLPService = require('./NLPService');

suite('Translate NLP Message');

test('Positive: Translate NLP Message #light1 on', async () => {
    assert.deepEqual(await NLPService.textToNVA({ text: '#light1 on' }), [ { 'noun': 'light1', 'verb': 'on', 'adverb': {} } ]);
});

test('Positive: Translate NLP Message #light1 setcolor value=3', async () => {
    assert.deepEqual(await NLPService.textToNVA({ text: '#light1 setcolor value=3' }), [ { 'noun': 'light1', 'verb': 'setcolor', 'adverb': { 'value': '3' } } ]);
});

test('Positive: Translate NLP Message #button2 connect target=office shortpress=power.on shortpress=player.play longpress=power.off longpress=player.pause', async () => {
    assert.deepEqual(await NLPService.textToNVA({ text: '#button2 connect target=office shortpress=power.on shortpress=player.play longpress=power.off longpress=player.pause' }),
        [ { 'noun': 'button2', 'verb': 'connect', 'adverb': { 'target': 'office', 'shortpress': [ 'power.on', 'player.play' ], 'longpress': [ 'power.off', 'player.pause' ] } } ]);
});

test('Positive: Translate NLP Message #light #office tag tags=jim', async () => {
    assert.deepEqual(await NLPService.textToNVA({ text: '#light #office tag tags=jim' }), [ { 'noun': 'light.office', 'verb': 'tag', 'adverb': { 'tags': 'jim' } } ]);
});

test('Positive: Translate NLP Message #light #bedroom on', async () => {
    assert.deepEqual(await NLPService.textToNVA({ text: '#light #bedroom on' }), [ { 'noun': 'light.bedroom', 'verb': 'on', 'adverb': {} } ]);
});

test('Negative: Translate NLP #light #bedroom on setcolor value=red (2 verbs)', async () => {
    assert.deepEqual(await NLPService.textToNVA({ text: '#light #bedroom on setcolor value=red' }), 'false');
});

test('Negative: Translate NLP light bedroom on setcolor value=red', async () => {
    assert.deepEqual(await NLPService.textToNVA({ text: 'light bedroom on setcolor value=red' }), 'false');
});

test('Negative: Translate NLP #light1 value=red (no verbs)', async () => {
    assert.deepEqual(await NLPService.textToNVA({ text: '#light1 value=red' }), 'false');
});
