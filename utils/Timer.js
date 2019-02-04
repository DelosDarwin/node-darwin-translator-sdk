module.exports = class Timer {
    start() {
        this.lastDate = Date.now();
        this.result = {};
    }

    mark(label) {
        const date = Date.now();

        this.result[label] = `${date - this.lastDate  }ms`;
        this.lastDate = date;
    }

    stop() {
        return this.result;
    }
};
