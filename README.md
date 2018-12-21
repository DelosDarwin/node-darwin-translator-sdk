### Installation

```bash
npm install darwin-translator-sdk
```

### Classes
Translator SDK provides you with classes:
- CoreChannel.
- ProxyChannel.
- NLP.
Each class is used to connect translator with corresponding MQTT channel.

#### Methods:
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
const MQTT           = require('async-mqtt');
const ProxyChannel   = require('darwin-translator-sdk/lib/ProxyChannel');
const NLP            = require('darwin-translator-sdk/lib/NLP');
const CoreChannel    = require('darwin-translator-sdk/lib/CoreChannel');

class Translator {
    constructor({ translatorId, mqttEndpoint } = {}) {
        if (!mqttEndpoint) throw new Error('"mqttEndpoint" required');
        if (!translatorId) throw new Error('"translatorId" required');

        this.translatorId = translatorId;
        this.mqttEndpoint = mqttEndpoint;

        this.coreChannel  = new CoreChannel({
            mqttClient : MQTT.connect(this.mqttEndpoint),
            translatorId
        });

        this.proxyChannel = new ProxyChannel({
            mqttClient : MQTT.connect(this.mqttEndpoint),
            translatorId
        });

        this.nlp = new NLP({
            mqttClient : MQTT.connect(this.mqttEndpoint),
            translatorId
        });
    }

    async start() {
        await this.coreChannel.init();
        await this.proxyChannel.init();
        this.proxyChannel.onMessage(this._requestHandler.bind(this));
    }

    async _requestHandler(message) {
        // get user text input from your request
        const { data } = message

        const nva = await this.nlp.textToNVA({ text: data });
        const coreResponse = await this.coreChannel.executeNVA({ nva });
    }
}

```
