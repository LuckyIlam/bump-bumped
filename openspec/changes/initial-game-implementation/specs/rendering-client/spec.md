## ADDED Requirements

### Requirement: Phaser 4 game scenes
The system SHALL use Phaser 4 for rendering and scene management.

#### Scenario: Title screen
- **WHEN** the game starts
- **THEN** the title screen SHALL be displayed with game name and "Press any key / button to start"

#### Scenario: Player select screen
- **WHEN** a key or button is pressed on the title screen
- **THEN** the player select screen SHALL be displayed with 4 empty slots

#### Scenario: Join mechanism
- **WHEN** a player presses a key or button on the select screen
- **THEN** their slot SHALL light up with their assigned colour and show their controls

#### Scenario: Start condition
- **WHEN** at least 2 players have joined and START is pressed
- **THEN** the game SHALL transition to the countdown

### Requirement: Countdown
The system SHALL display a 3-2-1 countdown before each round.

#### Scenario: Countdown display
- **WHEN** a round is about to start
- **THEN** "3", "2", "1", "GO!" SHALL be displayed sequentially with 1-second intervals

### Requirement: In-game HUD
The system SHALL display a HUD during gameplay.

#### Scenario: HUD elements
- **WHEN** a round is in progress
- **THEN** the HUD SHALL show: round number, each player's colour, shape icon, and current score

#### Scenario: Boost indicator
- **WHEN** a player has boost available
- **THEN** a circular halo around their vehicle SHALL show the boost state (ready: pulsing glow; active: bright particles; recharging: filling ring)

### Requirement: Round end screen
The system SHALL display round results.

#### Scenario: Round winner display
- **WHEN** a round ends
- **THEN** "PLAYER X WINS THE ROUND!" SHALL be displayed with a scoreboard overlay

#### Scenario: Brief pause
- **WHEN** the round end screen is shown
- **THEN** it SHALL remain for 3 seconds before the next round starts

### Requirement: Match end screen
The system SHALL display match results after 3 rounds.

#### Scenario: Match winner
- **WHEN** all 3 rounds are complete
- **THEN** the match winner SHALL be highlighted on a full scoreboard

#### Scenario: Return to title
- **WHEN** the match end screen is shown
- **THEN** pressing any key SHALL return to the title screen

### Requirement: Arena rendering
The system SHALL render the arena, walls, pockets, vehicles, and zones.

#### Scenario: Arena drawn
- **WHEN** the game scene is active
- **THEN** the arena SHALL be rendered with walls, pockets as dark circles, and floor zones with distinct colours

#### Scenario: Vehicles rendered
- **WHEN** vehicles are in the arena
- **THEN** each SHALL be rendered as its assigned shape with the player's colour

#### Scenario: Elimination animation
- **WHEN** a player is eliminated
- **THEN** their vehicle SHALL animate (spin + shrink to 0) before disappearing

### Requirement: Sound effects
The system SHALL play sound effects for game events.

#### Scenario: Collision sounds
- **WHEN** vehicles collide
- **THEN** a "thud" sound SHALL play
- **WHEN** a vehicle hits a wall
- **THEN** a lighter "thud" sound SHALL play

#### Scenario: Boost sound
- **WHEN** boost is activated
- **THEN** an engine rev-up sound SHALL play

#### Scenario: Elimination sound
- **WHEN** a player is eliminated
- **THEN** a comedic "pop" sound SHALL play

#### Scenario: Round start sound
- **WHEN** the countdown reaches "GO!"
- **THEN** a bell/beep SHALL play

#### Scenario: Round end sound
- **WHEN** a round ends
- **THEN** a fanfare jingle SHALL play
