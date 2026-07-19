## ADDED Requirements

### Requirement: Keyboard input
The system SHALL support 2 simultaneous keyboard players.

#### Scenario: Player 1 controls (AZERTY)
- **WHEN** Player 1 presses Z
- **THEN** throttle SHALL be set to 1 (forward)
- **WHEN** Player 1 presses Q
- **THEN** turn SHALL be set to -1 (left)
- **WHEN** Player 1 presses D
- **THEN** turn SHALL be set to 1 (right)
- **WHEN** Player 1 presses Shift (left)
- **THEN** boost SHALL be activated

#### Scenario: Player 2 controls (Arrow keys)
- **WHEN** Player 2 presses ↑
- **THEN** throttle SHALL be set to 1 (forward)
- **WHEN** Player 2 presses ←
- **THEN** turn SHALL be set to -1 (left)
- **WHEN** Player 2 presses →
- **THEN** turn SHALL be set to 1 (right)
- **WHEN** Player 2 presses Shift (right)
- **THEN** boost SHALL be activated

### Requirement: Gamepad input
The system SHALL support 2 simultaneous gamepads.

#### Scenario: Gamepad detected
- **WHEN** a gamepad is connected
- **THEN** the system SHALL detect and assign it to an available player slot

#### Scenario: Gamepad controls
- **WHEN** right trigger is pressed
- **THEN** throttle SHALL be proportional to trigger pressure
- **WHEN** left stick is pushed left/right
- **THEN** turn SHALL be proportional to stick deflection
- **WHEN** X button or left shoulder is pressed
- **THEN** boost SHALL be activated

### Requirement: Input device assignment
Input devices SHALL be assigned to player slots on the player select screen.

#### Scenario: First keyboard input is P1
- **WHEN** the first keyboard key is pressed on the select screen
- **THEN** the input device SHALL be assigned to Player 1 slot

#### Scenario: Second keyboard input is P2
- **WHEN** a keyboard key is pressed while P1 is already assigned
- **THEN** the second distinct keyboard layout SHALL be assigned to Player 2 slot

#### Scenario: Gamepad assigned to available slot
- **WHEN** a gamepad button is pressed
- **THEN** it SHALL be assigned to the next available player slot (P3 or P4)

### Requirement: Analog throttle
Gamepad throttle SHALL be proportional to trigger pressure.

#### Scenario: Partial throttle
- **WHEN** the trigger is pressed halfway
- **THEN** throttle value SHALL be 0.5
