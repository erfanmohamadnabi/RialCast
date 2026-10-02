# RialCast design system

Black surfaces, one phosphor-green accent. Tokens live in `src/index.css`.

**Color**: `--bg` #000 base, `--bg-1/2/3` raised surfaces, `--line / --line-strong` borders, `--text / --text-2 / --text-3` for primary, secondary and muted copy. `--neon` (#39ff14) is reserved for primary actions, active/selected state, live indicators and key numbers. `--danger` and `--warn` are status only.

**Type**: Geist (UI) and Geist Mono (addresses, hashes, step counters). Use `.num` for tabular figures.

**Radius scale**: 8 (small controls) / 10 (buttons, inputs) / 16 (cards) / 22 (feature tiles).

**Primitives**: `.btn` (`-primary`, `-secondary`, `-ghost`, `-danger`, `-lg`, `-block`), `.card` (`-interactive`), `.badge` (`-success`, `-accent`, `-warning`, `-danger`, `.cap`), `.form-group` / `.form-input`, `.icon-tile`, `.icon-btn`, `.state`.

**Shared components** (`src/components/ui`): `LogoMark`, `XIcon`, `PageHeader`, `LoadingState`, `EmptyState`.

**Icons**: `lucide-react` only, 16-20px, no emoji anywhere in the UI.

**Motion**: one hero entrance, plus feedback on interaction (dropdown, accordion, vote bars, button press). `prefers-reduced-motion` is respected.
