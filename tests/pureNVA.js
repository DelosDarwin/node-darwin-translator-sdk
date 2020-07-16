const { assert } = require('chai');
const NLPService = require('./NLPService');

suite('Pure NVA');


test('Positive: Pure NVA light1.on', async () => {
    // eslint-disable-next-line more/no-hardcoded-configuration-data
    assert.equal(await NLPService.textToNVA({ text: 'light1.on' }), 'light1.on');
});

test('Positive: Pure NVA button1.connect@targer=office,shortpress=power.on;player.play,longpress=power.off;player.pause', async () => {
    assert.equal(
        // eslint-disable-next-line more/no-hardcoded-configuration-data
        await NLPService.textToNVA({ text: 'button1.connect@targer=office,shortpress=power.on;player.play,longpress=power.off;player.pause' }),
        'button1.connect@targer=office,shortpress=power.on;player.play,longpress=power.off;player.pause'
    );
});

test('Positive: Pure NVA button1.connect@target=bedroom', async () => {
    // eslint-disable-next-line more/no-hardcoded-configuration-data
    assert.equal(await NLPService.textToNVA({ text: 'button1.connect@target=bedroom' }), 'button1.connect@target=bedroom');
});

test('Positive: Pure NVA light.office.tag@jim', async () => {
    // eslint-disable-next-line more/no-hardcoded-configuration-data
    assert.equal(await NLPService.textToNVA({ text: 'light.office.tag@jim' }), 'light.office.tag@jim');
});

test('Positive: Pure NVA light.set@color=red', async () => {
    // eslint-disable-next-line more/no-hardcoded-configuration-data
    assert.equal(await NLPService.textToNVA({ text: 'light.set@color=red' }), 'light.set@color=red');
});

test('Negative: Empty message', async () => {
    assert.equal(await NLPService.textToNVA({ text: ' ' }), 'false');
});

