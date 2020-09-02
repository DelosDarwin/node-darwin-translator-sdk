### Installation

Make sure your `.npmrc` is set properly and that you have your `~/.npmrc` set with a valid access token.

```bash
> cat .npmrc
registry=https://npm.pkg.github.com/Delos-tech
```

Then: 

```bash
npm install @delos-tech/translator-sdk
```

### Classes
Translator SDK provides you with classes:
- CoreChannel.
- ProxyChannel.
- Configurator.
- ListeningChannel
- NLP.

Each class is used to connect translator with corresponding MQTT channel.

##### Methods:
- CoreChannel.
  - init.
  You need to call init method in order to receive messages from core.
  - onNVAMessage.
  Accepts a function as an argument. This function will be set as message handler.
  - executeNVA.
  Calls core`s 'executeNVA' method. Accepts nva query as an argument. You need to pass nva query in the following format:
  ```javascript
  {
      nva: [{
                noun: 'light',
                verb: 'setcolor',
                adverb: { value: 'red' }
         }]
  }
  ```
  or
  ```javascript
    {
        nva: 'light.setcolor@value=red'
    }
    ```
- ProxyChannel.
    - init.
    You need to call init method in order to receive messages from proxy service.
    - onMessage.
    Accepts a function as an argument. This function will be set as message handler.
- Configurator.
    - getConfiguratorMethods.
    Provide configuration methods to expose in channels.
- ProxyChannel.
    - init.
    You need to call init method in order to receive messages from the listening service.
- NLP.
    - textToNVA.
    Accepts text as an argument. You need to pass text in the following format:
     ```javascript
     { text: '#light setcolor value=red' }
     ```
    or
    ```javascript
    { text: 'light.setcolor@value=red' }
    ```


### Usage example

```javascript
const MQTT             = require('async-mqtt');
const ProxyChannel     = require('@delos-tech/translator-sdk/lib/ProxyChannel');
const NLP              = require('@delos-tech/translator-sdk/lib/NLP');
const CoreChannel      = require('@delos-tech/translator-sdk/lib/CoreChannel');
const ListeningChannel = require('@delos-tech/translator-sdk/lib/ListeningChannel');
const Configurator     = require('@delos-tech/translator-sdk/lib/Configurator.js');

const utils = require('./utils.js');

class Translator {
    constructor({ translatorId, mqttEndpoint, translatorConfig, schema } = {}) {
        if (!mqttEndpoint) throw new Error('"mqttEndpoint" required');
        if (!translatorId) throw new Error('"translatorId" required');

        this.translatorId     = translatorId;
        this.mqttEndpoint     = mqttEndpoint;
        this.translatorConfig = translatorConfig;
        this.schema           = schema;
    }

    async start() {
        const coreMqttClient = MQTT.connect(this.mqttEndpoint);
        const proxyMqttClient = MQTT.connect(this.mqttEndpoint);
        const listeningMqttClient = MQTT.connect(this.mqttEndpoint);

        await utils.waitForEvent(coreMqttClient, 'connect');
        await utils.waitForEvent(proxyMqttClient, 'connect');
        await utils.waitForEvent(listeningMqttClient, 'connect');

        this.configurator = new Configurator({
            schema: this.schema,
            config: this.translatorConfig,
            methods: {
                saveConfig    : utils.saveConfig,
                validateConfig: utils.validateConfig
            }
        });

        this.coreChannel = new CoreChannel({
            mqttClient   : coreMqttClient,
            translatorId : this.translatorId,
            configurator : this.configurator
        });

        this.proxyChannel = new ProxyChannel({
            mqttClient   : proxyMqttClient,
            translatorId : this.translatorId
        });

        this.listeningChannel = new ListeningChannel({
            mqttClient     : listeningMqttClient,
            translatorId   : this.translatorId,
            onNotification : this._handleListeningNotification.bind(this)
        });

        await this.coreChannel.init();
        await this.proxyChannel.init();
        await this.listeningChannel.init();

        this.proxyChannel.onMessage(this._requestHandler.bind(this));
    }

    async _requestHandler(message) {
        // get user text input from your request
        const { data } = message

        const nva = await this.nlp.textToNVA({ text: data });
        const coreResponse = await this.coreChannel.executeNVA({ nva });
    }

    async _handleListeningNotification(message ) {
        logger.info(`MESSAGE FROM LISTENING SERVICE: ${JSON.stringify(message)}`);
    }
}

```
