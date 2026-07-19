## ADDED Requirements

### Requirement: Round system
The game SHALL be structured as a match of multiple rounds with last-man-standing elimination.

#### Scenario: Round starts with all alive
- **WHEN** a round begins
- **THEN** all players SHALL be alive and spawned at their spawn positions

#### Scenario: Round ends with one survivor
- **WHEN** only one player remains alive
- **THEN** the round SHALL end and that player SHALL be declared the round winner

#### Scenario: Three rounds per match
- **WHEN** a match starts
- **THEN** it SHALL consist of exactly 3 rounds

### Requirement: Scoring
The system SHALL accumulate score across rounds.

#### Scenario: Points awarded by placement
- **WHEN** a round ends
- **THEN** points SHALL be awarded: 1st = 5pts, 2nd = 3pts, 3rd = 1pt, 4th = 0pts

#### Scenario: Bonus for direct elimination
- **WHEN** a player bumps another directly into a pocket
- **THEN** the bumper SHALL receive +1 bonus point

#### Scenario: Bonus for bank shot
- **WHEN** a player bumps another into a wall and then into a pocket (2+ bounces)
- **THEN** the bumper SHALL receive +2 bonus points per bounce ≥ 2

#### Scenario: Match winner
- **WHEN** all 3 rounds are complete
- **THEN** the player with the highest total score SHALL be declared the match winner

#### Scenario: Tiebreaker
- **WHEN** two or more players are tied for first after 3 rounds
- **THEN** a sudden-death round with shrinking arena SHALL be played

### Requirement: Elimination
When a vehicle enters a pocket, the player SHALL be eliminated.

#### Scenario: Pocket entry triggers elimination
- **WHEN** a vehicle's centre is within a pocket's radius
- **THEN** the player SHALL be eliminated and the vehicle SHALL be removed from the physics engine

#### Scenario: Elimination animation
- **WHEN** a player is eliminated
- **THEN** the vehicle SHALL spin and shrink to scale 0 over 0.5s before removal

### Requirement: Spectator mode
Eliminated players SHALL enter spectator mode for the remainder of the round.

#### Scenario: Spectator view
- **WHEN** a player is eliminated
- **THEN** they SHALL see the arena from the same camera view but with no control

### Requirement: Spawn system
Players SHALL spawn at fixed positions at the start of each round.

#### Scenario: Spawn with random shape
- **WHEN** a round starts
- **THEN** each player SHALL be assigned a random vehicle shape from the 4 available shapes

#### Scenario: Spawn positions
- **WHEN** a round starts
- **THEN** players SHALL be placed at their spawn positions defined in the map file, facing centre

### Requirement: Boost UI state
The system SHALL expose the boost state (ready, active, recharging) for each vehicle.

#### Scenario: Boost state query
- **WHEN** the UI requests boost state
- **THEN** the game state SHALL return the current state and remaining timer for each vehicle
