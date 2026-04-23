---
Task ID: 2a
Agent: Super Z (main)
Task: Stage 2a — Content System (65 practices, JSON texts, registry wiring, progression)

Work Log:
- Analyzed current project state: 107 files from Stage 1 with stub contentStore and empty textLoader
- Identified 7 critical gaps: contentStore stub, no JSON texts, empty textLoader, duplicated SystemMeta, duplicated makePractice, stub validation, unused systemProgress in checkUnlock
- Created src/content/types.ts — shared SystemMeta interface (eliminated 5 copies)
- Created src/content/utils.ts — shared makePractice factory + DIFF_MAP_5/DIFF_MAP_4 (eliminated 5 copies)
- Refactored all 5 system meta.ts files to import shared SystemMeta
- Refactored all 5 system practices.ts files to use shared makePractice
- Wired contentStore.loadPractices() to actually register all systems from registry
- Updated app/_layout.tsx: removed duplicate registerAllSystems(), added loadAllTexts() call
- Created 65 JSON text files across 5 systems with authentic Russian meditation/breathwork/somatic narration
- Fixed textKey format inconsistency (transurfing/silva had short keys, now all use full-path format)
- Verified 521 textKeys: 100% sync between TypeScript definitions and JSON content
- Implemented real textLoader with Metro require.context and typed declarations
- Rewrote checkUnlock.ts: proper system-level progression checking with SystemProgressSnapshot
- Added computeSystemLevel(), getLockReason() with Russian pluralization, getNextLevelProgress()
- Rewrote validate-content.ts: full 3-phase pipeline (directory structure, JSON schema, TS↔JSON sync)
- Final validation: 65 files, 521 textKeys, 0 errors
- TypeScript strict: 0 errors

Stage Summary:
- 211 total files (up from 107 in Stage 1)
- 65 JSON content files with ~5,200 words of Russian narration
- 521 textKey references verified (100% sync)
- contentStore fully wired: loadPractices() registers from registry, loadTexts() loads from JSON
- textLoader implements Metro require.context with proper TypeScript typing
- checkUnlock.ts properly uses system-level progression rules (not per-practice)
- validate-content.ts: full pipeline catches schema errors, TS↔JSON mismatches, text length warnings
