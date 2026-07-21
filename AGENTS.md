## Project

**bump-bumped** — jeu de combat de véhicules local multiplayer.
- Phaser 4 + Matter.js + TypeScript
- Monorepo (npm workspaces) : `packages/engine` + `packages/client`

## Code structure

```
packages/engine/src/       ← logique de jeu (tests dans __tests__/)
  state/                   ← GameState, CollisionTracker, ScoringService, VehicleId
  systems/                 ← VehicleSystem, ZoneSystem, GameEngine, GamePhaseManager
  physics/                 ← MatterPhysicsEngine, IPhysicsEngine
  events/                  ← EventBus
  map/                     ← types, parser
  config/                  ← constantes de jeu
packages/client/src/       ← rendu Phaser
  scenes/                  ← GameScene, MatchEndScene
  renderers/               ← HUD, BoostEffects, VehicleRenderer, ArenaRenderer, etc.
  input/                   ← KeyboardManager, GamepadManager
  shapes/                  ← VehicleShapeDrawer
```

## Architecture decisions

- **GameEngine** = composition root : seul point d'entrée du client vers la logique de jeu (Phases 4-5)
- **EventBus** = canal de communication engine → client (Phase 2)
- **IPhysicsEngine** = abstraction physique (LSP), injectée partout (Phase 5)
- **BoostStatusReader** = interface étroite pour le client (ISP), implémentée par VehicleSystem (Phase 5)
- **CollisionTracker / ScoringService** extraits de GameState (SRP, Phase 3)
- **VehicleId** (`vehicleId(index)` / `vehicleIndex(id)`) = helper centralisé pour les IDs de véhicules (Phase 6)
- **Engine exports** : seuls GameEngine, BoostStatusReader, GamePhaseManager, types et constantes sont exportés publiquement (Phase 6)

## Workflow

- **SOLID first** : toute modification doit respecter les principes SOLID (pas de god class, dépendances vers les abstractions, interfaces étroites, etc.)
- **Découpage par tâche** : chaque fonctionnalité est décomposée en tâches atomiques
  - Une tâche = un commit
  - Écrire ou mettre à jour les tests unitaires avant ou avec le code
  - Lancer `npm -w packages/client run build` + `npm -w @bump-bumped/engine test` entre chaque tâche
  - Ne pas commit sans validation explicite du build et des tests
- **Relecture** : avant chaque commit, montrer le diff à l'utilisateur et attendre son approbation
- **Un commit par tâche** : pas de commits géants, chaque commit couvre une seule responsabilité

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
