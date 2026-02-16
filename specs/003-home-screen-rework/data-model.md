# Data Model: Home Screen Rework

**Feature**: 003-home-screen-rework  
**Date**: 2026-02-15  
**Source**: [spec.md](spec.md), [research.md](research.md)

---

## Entity Changes

### Player (modified)

The `Player` interface gains two fields for score tracking.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | 1–20 chars, trimmed. Unique key (case-insensitive). |
| avatarId | string | yes | References an avatar from the reduced set of 8. |
| colorId | string | yes | References a color from the reduced set of 6. |
| lastActive | number | yes | Epoch ms, updated on session start and visibility changes. |
| createdAt | number | yes | Epoch ms, immutable after creation. |
| **totalScore** | **number** | **yes** | **NEW. Sum of all completed game scores. Default 0.** |
| **gamesPlayed** | **number** | **yes** | **NEW. Count of completed games. Default 0.** |

**Computed property** (not stored): `averageScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0`

### PlayerStore (modified)

| Field | Type | Notes |
|-------|------|-------|
| version | number | Incremented from 1 → 2 to trigger migration. |
| players | Player[] | Max 50, sorted by lastActive desc. |

**Migration (v1 → v2)**: When loading a v1 store, set `totalScore = 0` and `gamesPlayed = 0` for every player, then write as v2.

### Session (unchanged)

No changes to the Session type.

---

## Constants Changes

### AVATARS (reduced: 12 → 8)

Retained (in order):

| # | id | label | emoji |
|---|-----|-------|-------|
| 1 | rocket | Rocket | 🚀 |
| 2 | star | Star | ⭐ |
| 3 | cat | Cat | 🐱 |
| 4 | turtle | Turtle | 🐢 |
| 5 | robot | Robot | 🤖 |
| 6 | dinosaur | Dinosaur | 🦕 |
| 7 | unicorn | Unicorn | 🦄 |
| 8 | lightning | Lightning | ⚡ |

**Removed**: dog, planet, flower, crown

### AVATAR_REMAP (new)

Mapping from removed avatar IDs to their replacement:

| Removed ID | Remap to |
|------------|----------|
| dog | cat |
| planet | rocket |
| flower | star |
| crown | star |

### COLORS (reduced: 8 → 6)

Retained (in order):

| # | id | label | hex | textColor |
|---|----|-------|-----|-----------|
| 1 | red | Red | #D32F2F | #FFFFFF |
| 2 | gold | Gold | #F9A825 | #1A1A1A |
| 3 | teal | Teal | #00796B | #FFFFFF |
| 4 | blue | Blue | #1565C0 | #FFFFFF |
| 5 | purple | Purple | #6A1B9A | #FFFFFF |
| 6 | pink | Pink | #C2185B | #FFFFFF |

**Removed**: orange, green

### COLOR_REMAP (new)

| Removed ID | Remap to |
|------------|----------|
| orange | red |
| green | teal |

---

## State Transitions

### Clear All Profiles Flow

```
[PlayerList visible] 
    → user taps "Clear all profiles"
    → [ClearAllConfirmation dialog shown]
        → user confirms
            → localStorage.clear()
            → sessionStorage.clear()
            → window.location.reload()
            → [Page reloads → first-visit NewPlayerForm]
        → user cancels (or presses Escape)
            → [Dialog closes → PlayerList unchanged]
```

### Avatar/Color Remap on Load

```
[App loads → readStore()]
    → for each player in store:
        if player.avatarId in AVATAR_REMAP:
            player.avatarId = AVATAR_REMAP[player.avatarId]
            dirty = true
        if player.colorId in COLOR_REMAP:
            player.colorId = COLOR_REMAP[player.colorId]
            dirty = true
    → if dirty: writeStore(store)
```

### Score Update on Game Completion

```
[Game status → 'completed']
    → player.totalScore += gameState.score
    → player.gamesPlayed += 1
    → writeStore(store)
```

---

## Validation Rules

- **avatarId**: Must be one of the 8 retained avatar IDs. If not, remap via AVATAR_REMAP; if still unknown, fallback to DEFAULT_AVATAR_ID.
- **colorId**: Must be one of the 6 retained color IDs. If not, remap via COLOR_REMAP; if still unknown, fallback to DEFAULT_COLOR_ID.
- **totalScore**: Non-negative integer. Default 0.
- **gamesPlayed**: Non-negative integer. Default 0.
- **averageScore display**: `gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0`. Shown as "Avg: {n}" or "—" if no games played.
