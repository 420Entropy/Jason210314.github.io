
class FlowConnector {
    constructor() {
        this.pipelines = new Map();
    }

    /**
     * Connects source and destination components.
     * @param {object} source
     * @param {object} destination
     * @param {string} flowName
     */
    connect(source, destination, flowName = 'default') {
        if (!this.pipelines.has(flowName)) {
            this.pipelines.set(flowName, []);
        }
        this.pipelines.get(flowName).push({ from: source.constructor.name, to: destination.constructor.name });
        console.log(`Connected ${source.constructor.name} -> ${destination.constructor.name} on flow ${flowName}`);
    }
}

module.exports = FlowConnector;
