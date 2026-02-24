# Research: Stable Status Panel Height

**Feature**: 028-stable-panel-height  
**Date**: 2026-02-24

## Research Tasks

### 1. CSS approach for fixed panel height

**Context**: The `.status` container currently uses `min-height: 5rem` (desktop) / `min-height: 4rem` (mobile ≤480px). Content varies between input phase (round info + score + timer + CountdownBar) and feedback phase (result icon + text + completion count), causing height fluctuations.

**Decision**: Replace `min-height` with `height` on the `.status` class and add `overflow: hidden` as a safety net for extreme edge cases (e.g., browser zoom ≥200%).

**Rationale**: The current `min-height` values already match the natural rendered height of the tallest normal content variant (input phase with CountdownBar). Switching to a fixed `height` locks the container to the same pixel value it already renders at, preventing growth during feedback mode. This is a two-property CSS change with zero visual impact under normal conditions.

**Alternatives considered**:
- **Absolute positioning of CountdownBar**: Would remove the bar from flow and allow a shorter fixed height for the "content area" above it. Rejected — unnecessary complexity. The bar already fits within the current `min-height` values.
- **CSS Grid with explicit row templates**: Would allow precise row sizing. Rejected — the current flex layout works correctly; changing layout mode introduces regression risk for no benefit.
- **JavaScript-based height measurement**: Measure tallest state on mount and set height dynamically. Rejected — violates YAGNI. The current values are deterministic and predictable from CSS.

---

### 2. Height value analysis (desktop >480px)

**Context**: Need to verify that `height: 5rem` (80px) contains all content variants.

**Decision**: Use `height: 5rem` (unchanged from current `min-height` value).

**Rationale — content height calculations**:

| Phase / Mode | Content height (incl. padding) | Fits in 80px? |
|---|---|---|
| Input / play mode | 12px top padding + 23px row + 16px gap + 8px bar margin + 8px bar + 12px bottom padding = **~79px** | ✅ Yes (1px spare) |
| Input / practice mode | 12px + 23px + 12px = **~47px** | ✅ Yes (centered) |
| Feedback / correct | 12px + 29px main + 4px gap + 20px count + 12px = **~77px** | ✅ Yes |
| Feedback / incorrect | 12px + 29px main + 4px gap + 20px count + 12px = **~77px** (text fits on single row) | ✅ Yes |

**Alternatives considered**:
- **Larger height (e.g., 6rem)**: Would provide more breathing room but introduce unnecessary white space and deviate from the current visual appearance.
- **Smaller height (e.g., 4.5rem)**: Would clip the input phase CountdownBar. Rejected.

---

### 3. Height value analysis (mobile ≤480px)

**Context**: Need to verify that `height: 4rem` (64px) contains all mobile content variants.

**Decision**: Use `height: 4rem` (unchanged from current mobile `min-height` value).

**Rationale — content height calculations**:

| Phase / Mode | Content height (incl. padding) | Fits in 64px? |
|---|---|---|
| Input / play mode | 8px + 22px row + 8px gap + 8px margin + 8px bar + 8px = **~62px** | ✅ Yes (2px spare) |
| Input / practice mode | 8px + 22px + 8px = **~38px** | ✅ Yes (centered) |
| Feedback / correct | 8px + ~21px main + 4px gap + 18px count + 8px = **~59px** | ✅ Yes |
| Feedback / incorrect | 8px + ~21px main + 4px gap + 18px count + 8px = **~59px** | ✅ Yes |

---

### 4. Overflow handling strategy

**Context**: FR-006 requires that the fixed height contain all content without clipping "under normal conditions." Extreme zoom or very long translations could theoretically overflow.

**Decision**: Add `overflow: hidden` to `.status`.

**Rationale**: Under normal browser settings and supported locales (EN, PT), all content fits within the fixed heights. The `overflow: hidden` prevents any edge-case content overflow from pushing the layout — the panel simply clips at the bottom. This matches the spec's guidance: "content should remain readable through overflow handling rather than expanding the panel height." The clipping would only affect the bottom-most element (completion count line) in extreme scenarios, and the primary feedback (icon + result text) at the top would always remain visible.

**Alternatives considered**:
- **`overflow: auto` (scrollbar)**: Would show a scrollbar inside the panel on overflow. Rejected — scrollbars in a status panel are inappropriate for a children's app.
- **Text truncation with `text-overflow: ellipsis`**: Would require additional structural changes (single-line constraints). Rejected — over-engineering for an edge case that only appears at extreme zoom levels.
- **No overflow handling**: Content would overflow visually but wouldn't cause layout shifts (since `height` prevents container growth). Rejected — overflowing content overlapping elements below would look broken.
