const MultiHopMemory = require('./memory/MultiHopMemory');
const SubjectObjectMatcher = require('./patterns/SubjectObjectMatcher');
const ApiInterpreter = require('./language/ApiInterpreter');
const Planner = require('./planning/Planner');
const SelfVerifier = require('./verification/SelfVerifier');
const ViewpointResolver = require('./resolution/ViewpointResolver');
const InfrastructureComposer = require('./infrastructure/InfrastructureComposer');
const FlowConnector = require('./core/FlowConnector');

class CognitiveArchitecture {
    constructor() {
        this.memory = new MultiHopMemory();
        this.patternMatcher = new SubjectObjectMatcher();
        this.interpreter = new ApiInterpreter();
        this.planner = new Planner();
        this.verifier = new SelfVerifier();
        this.resolver = new ViewpointResolver();
        this.composer = new InfrastructureComposer();
        this.connector = new FlowConnector();
    }

    init() {
        console.log("Initializing Cognitive Architecture...");
        this.composer.compose([this.memory, this.planner]);
        this.connector.connect(this.planner, this.memory);
        return true;
    }
}

module.exports = {
    CognitiveArchitecture,
    MultiHopMemory,
    SubjectObjectMatcher,
    ApiInterpreter,
    Planner,
    SelfVerifier,
    ViewpointResolver,
    InfrastructureComposer,
    FlowConnector
};
