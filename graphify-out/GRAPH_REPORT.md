# Graph Report - .  (2026-07-19)

## Corpus Check
- 72 files · ~50,547 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 106 nodes · 69 edges · 45 communities (9 shown, 36 thin omitted)
- Extraction: 71% EXTRACTED · 29% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- OpenCode OpsX Workflow
- Game Engine Design
- Engine Physics
- CI & Agent Setup
- Rendering & Scene
- Map & Physics Plugin
- Input & Timing
- Audio & Game Config
- Scene Management
- Graphics & Shapes
- Zoom & Camera
- Particles
- Tweens & Animation
- OpenSpec Config
- Proposal Workflow
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44

## God Nodes (most connected - your core abstractions)
1. `MatterPhysicsEngine` - 8 edges
2. `GameScene` - 6 edges
3. `MatterPhysicsEngine` - 5 edges
4. `VehicleSystem` - 5 edges
5. `MapData` - 4 edges
6. `CI Pipeline` - 4 edges
7. `OpenSpec Apply Change Skill` - 4 edges
8. `BodyId` - 3 edges
9. `OpenSpec Archive Change Skill` - 3 edges
10. `OpenSpec Propose Skill` - 3 edges

## Surprising Connections (you probably didn't know these)
- `MatterPhysicsEngine` --semantically_similar_to--> `Phaser this.matter plugin`  [INFERRED] [semantically similar]
  openspec/specs/engine.md → .opencode/skills/phaser/physics-matter/SKILL.md
- `bump-bumped` --conceptually_related_to--> `CI Pipeline`  [INFERRED]
  README.md → .github/workflows/ci.yml
- `bump-bumped` --conceptually_related_to--> `Graphify Agent Configuration`  [INFERRED]
  README.md → AGENTS.md
- `bump-bumped` --conceptually_related_to--> `Project Knowledge Graph`  [INFERRED]
  README.md → AGENTS.md
- `Match structure (3 rounds, scoring, tiebreaker)` --calls--> `Phaser Clock and TimerEvent`  [INFERRED]
  openspec/specs/game-spec.md → .opencode/skills/phaser/time-and-timers/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **OpenSpec Change Workflow** — opencode_skills_openspec_propose_skill_openspec_propose, opencode_skills_openspec_apply_change_skill_openspec_apply_change, opencode_skills_openspec_archive_change_skill_openspec_archive_change, opencode_skills_openspec_explore_skill_openspec_explore, opencode_skills_openspec_sync_specs_skill_openspec_sync_specs, opencode_skills_openspec_update_change_skill_openspec_update_change, opencode_commands_opsx_propose_opsx_propose_command, opencode_commands_opsx_apply_opsx_apply_command, opencode_commands_opsx_archive_opsx_archive_command, opencode_commands_opsx_explore_opsx_explore_command, opencode_commands_opsx_sync_opsx_sync_command, opencode_commands_opsx_update_opsx_update_command [EXTRACTED 1.00]
- **Phaser 4 Skill Set** — opencode_skills_phaser_audio_and_sound_skill_phaser_audio_skill, opencode_skills_phaser_game_setup_and_config_skill_phaser_game_setup_skill, opencode_skills_phaser_graphics_and_shapes_skill_phaser_graphics_skill, opencode_skills_phaser_input_keyboard_mouse_touch_skill_phaser_input_skill [EXTRACTED 1.00]
- **Engine Package Architecture** — openspec_specs_engine_md_i_physics_engine, openspec_specs_engine_md_matter_physics_engine, openspec_specs_engine_md_vehicle_command, openspec_specs_engine_md_wall_behaviour_types, openspec_specs_engine_md_vehicle_shape_types, openspec_specs_engine_md_boost_state_machine, openspec_specs_engine_md_zone_modifiers, openspec_changes_initial_game_implementation_specs_physics_engine_spec_md_collision_events [EXTRACTED 1.00]
- **Game Screen Flow** — openspec_changes_initial_game_implementation_specs_rendering_client_spec_md_phaser_scenes, openspec_specs_game_spec_md_screen_flow, openspec_specs_game_spec_md_match_structure, openspec_specs_game_spec_md_elimination_spectator [EXTRACTED 1.00]
- **Physics-to-Visual Rendering Pipeline** — openspec_specs_engine_md_i_physics_engine, openspec_changes_initial_game_implementation_design_md_physics_visual_sync, openspec_changes_initial_game_implementation_specs_rendering_client_spec_md_arena_renderer, openspec_changes_initial_game_implementation_specs_rendering_client_spec_md_vehicle_renderer, opencode_skills_phaser_physics_matter_skill_md_matter_physics_plugin [EXTRACTED 1.00]

## Communities (45 total, 36 thin omitted)

### Community 0 - "OpenCode OpsX Workflow"
Cohesion: 0.18
Nodes (12): OPSX Apply Command, OPSX Archive Command, OPSX Explore Command, OPSX Propose Command, OPSX Sync Command, OPSX Update Command, OpenSpec Apply Change Skill, OpenSpec Archive Change Skill (+4 more)

### Community 1 - "Game Engine Design"
Cohesion: 0.18
Nodes (11): Timer-based burst boost, Decoupled physics from rendering, Fixed 60Hz timestep for determinism, Physics-visual sync pattern (read don't couple), Boost state machine (IDLE, ACTIVE, RECHARGING), IPhysicsEngine, MatterPhysicsEngine, VehicleCommand (+3 more)

### Community 2 - "Engine Physics"
Cohesion: 0.25
Nodes (9): BoostConfig, VehicleCommand, CollisionCallback, IPhysicsEngine, MatterPhysicsEngine, BodyId, WallType, BoostState (+1 more)

### Community 3 - "CI & Agent Setup"
Cohesion: 0.33
Nodes (7): Graphify Agent Configuration, Project Knowledge Graph, Biome Check, CI Pipeline, Client Build, Vitest Runner, bump-bumped

### Community 4 - "Rendering & Scene"
Cohesion: 0.38
Nodes (7): ArenaRenderer, VehicleRenderer, GameScene, MapData, WallSegment, ZoneSegment, ZoneSystem

### Community 5 - "Map & Physics Plugin"
Cohesion: 0.33
Nodes (6): Phaser this.matter plugin, JSON map format with pure function parser, Map parser and validator (pure function), ArenaRenderer, Classic map (1200x800, 6 pockets), Map JSON schema

### Community 6 - "Input & Timing"
Cohesion: 0.40
Nodes (5): Phaser Clock and TimerEvent, Direct key mapping without rebinding, KeyboardManager (AZERTY + Arrows), Collision event system, Match structure (3 rounds, scoring, tiebreaker)

### Community 7 - "Audio & Game Config"
Cohesion: 0.50
Nodes (4): Phaser Audio and Sound Skill, SoundManager, GameConfig, Phaser Game Setup and Config Skill

### Community 8 - "Scene Management"
Cohesion: 0.67
Nodes (3): Phaser Scene systems and lifecycle, Phaser scenes (Title, PlayerSelect, Game, Results), Screen flow (title, select, countdown, game, results)

## Knowledge Gaps
- **66 isolated node(s):** `VehicleRenderer`, `BoostConfig`, `VehicleCommand`, `parseMap`, `Pocket` (+61 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MatterPhysicsEngine` connect `Game Engine Design` to `Map & Physics Plugin`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `GameScene` connect `Rendering & Scene` to `Engine Physics`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `Phaser this.matter plugin` connect `Map & Physics Plugin` to `Game Engine Design`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `VehicleRenderer`, `BoostConfig`, `VehicleCommand` to the rest of the system?**
  _66 weakly-connected nodes found - possible documentation gaps or missing edges._