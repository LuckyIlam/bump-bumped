## ADDED Requirements

### Requirement: Map file format
Maps SHALL be stored as JSON files conforming to the map format specification.

#### Scenario: Valid map parses correctly
- **WHEN** a valid JSON map file is loaded
- **THEN** all fields (walls, pockets, zones, spawns, dimensions) SHALL be parsed into internal representation

#### Scenario: Invalid JSON rejected
- **WHEN** a non-JSON file is loaded
- **THEN** the system SHALL throw a parse error

### Requirement: Map validation
The system SHALL validate map data against the format specification.

#### Scenario: Missing required fields rejected
- **WHEN** a map file is missing a required field
- **THEN** the system SHALL produce a validation error identifying the missing field

#### Scenario: Invalid wall type rejected
- **WHEN** a wall segment has an invalid type
- **THEN** the system SHALL reject the map with an error

#### Scenario: Invalid zone type rejected
- **WHEN** a zone has an invalid type
- **THEN** the system SHALL reject the map with an error

#### Scenario: Out-of-bounds coordinates rejected
- **WHEN** any coordinate is outside the arena bounds
- **THEN** the system SHALL reject the map with an error

#### Scenario: Incorrect spawn count rejected
- **WHEN** the map does not contain exactly 4 spawn points
- **THEN** the system SHALL reject the map with an error

### Requirement: Pure function parser
The map parser SHALL be a pure function with no side effects.

#### Scenario: Parser receives string input
- **WHEN** the parser is called
- **THEN** it SHALL accept a string and return a `Result<MapData, Error>` with no file I/O

### Requirement: Default Classic map
The system SHALL ship with a default "Classic" map.

#### Scenario: Classic map loads on startup
- **WHEN** the game starts without a specified map
- **THEN** the Classic map SHALL be loaded by default

#### Scenario: Classic map data
- **WHEN** the Classic map is loaded
- **THEN** it SHALL have dimensions 1200×800, 6 pockets (corners + long side midpoints), all bounce walls, and 4 spawn positions
