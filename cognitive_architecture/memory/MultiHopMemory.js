
class MultiHopMemory {
    constructor() {
        this.name = 'MultiHopMemory';
        this.storeData = new Map();
        this.connections = new Map();
    }

    /**
     * Stores a value with a key and optional context.
     * @param {string} key
     * @param {any} value
     * @param {object} context
     */
    store(key, value, context = {}) {
        this.storeData.set(key, { value, context, timestamp: Date.now() });
    }

    /**
     * Connects two nodes (keys) in the memory.
     * @param {string} nodeA
     * @param {string} nodeB
     */
    connect(nodeA, nodeB) {
        if (!this.connections.has(nodeA)) {
            this.connections.set(nodeA, new Set());
        }
        if (!this.connections.has(nodeB)) {
            this.connections.set(nodeB, new Set());
        }
        this.connections.get(nodeA).add(nodeB);
        this.connections.get(nodeB).add(nodeA);
    }

    /**
     * Retrieves information via multi-hop traversal.
     * @param {string} startNode
     * @param {number} hops
     * @returns {Array} Array of connected values.
     */
    retrieve(startNode, hops = 1) {
        let currentNodes = new Set([startNode]);
        let visited = new Set([startNode]);

        for (let i = 0; i < hops; i++) {
            let nextNodes = new Set();
            for (let node of currentNodes) {
                if (this.connections.has(node)) {
                    for (let neighbor of this.connections.get(node)) {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            nextNodes.add(neighbor);
                        }
                    }
                }
            }
            currentNodes = nextNodes;
        }

        const results = [];
        for (let node of visited) {
            if (this.storeData.has(node)) {
                results.push({ key: node, ...this.storeData.get(node) });
            }
        }
        return results;
    }
}

module.exports = MultiHopMemory;
