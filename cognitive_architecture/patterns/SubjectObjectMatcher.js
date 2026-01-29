
class SubjectObjectMatcher {
    constructor() {
        this.patterns = new Map();
    }

    /**
     * Registers a pattern.
     * @param {string} name
     * @param {RegExp} regex
     */
    addPattern(name, regex) {
        this.patterns.set(name, regex);
    }

    /**
     * Matches subject and object against a pattern.
     * @param {string} subject
     * @param {string} object
     * @param {string} patternName
     * @returns {boolean}
     */
    match(subject, object, patternName) {
        if (!this.patterns.has(patternName)) {
            throw new Error(`Pattern ${patternName} not found.`);
        }
        const regex = this.patterns.get(patternName);
        // Simplistic implementation: checks if "subject->object" matches the regex
        const combined = `${subject}->${object}`;
        return regex.test(combined);
    }

    /**
     * Advanced matching logic (placeholder for "Self Regex").
     * @param {string} subject
     * @param {string} object
     */
    selfRegexMatch(subject, object) {
        // Placeholder for advanced subject is object patterning
        return subject === object;
    }
}

module.exports = SubjectObjectMatcher;
