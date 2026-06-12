# Component Registry

This file is the source of truth for reusable UI compositions in `src/components/ui/`. Every component in that directory must have a corresponding entry below. The `verify` step enforces this.

### How entries are formatted

Each registered component gets a level-2 heading whose text matches the component's filename, followed by a short list of facts. For example, for a component at `src/components/ui/CurrencyInput.tsx`, the entry would look like a heading `## CurrencyInput` followed by:

- a `**Location**:` line with the file path
- a `**Purpose**:` line describing what it does and when to use it
- a `**Props**:` line summarizing the props (or pointing at the type definition)

The level-2 heading is what `verify` parses. It must match the filename exactly. Other section headings in this file (like the one above this paragraph) use level-3 (`###`) so they aren't confused with components.

### Why this exists

Without a single source of truth for "what's reusable here," Claude (and humans) re-create primitives that already exist. The registry is the first thing the planning checklist reads. As long as it stays up to date, duplicate components stop being a thing.

### Registered components

<!-- The first time `view-component` or `form` creates a reusable component, its `## <Name>` entry will be appended below this comment. The list starts empty. -->
