# Cognitive Architecture

This directory contains modules implementing advanced cognitive features.

## Modules

### Memory
- **MultiHopMemory**: Implements a memory system capable of multi-hop retrieval and node connections.

### Patterns
- **SubjectObjectMatcher**: Implements pattern matching including "Self Regex" for subject-object relationships.

### Language
- **ApiInterpreter**: Interprets custom self-reference language and API definitions.

### Planning
- **Planner**: Handles goal setting, backtracking, backward chaining, and sub-goal generation.

### Verification
- **SelfVerifier**: Verifies state consistency and audits decision history.

### Resolution
- **ViewpointResolver**: Detects and resolves conflicts between different viewpoints.

### Infrastructure
- **InfrastructureComposer**: Composes and activates system components.

### Core
- **FlowConnector**: Manages data flow and pipelines between modules.

## Usage

```javascript
const { CognitiveArchitecture } = require('./index');
const ai = new CognitiveArchitecture();
ai.init();
```
