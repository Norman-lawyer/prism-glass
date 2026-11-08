# Prism Glass — release checklist

This directory is a development preview, not a published release. The live vault is using the candidate theme and companion plugin. The theme uses Obsidian's built-in styling as its base; the previous bundled Minimal base was removed.

## Observed locally

- On macOS with Obsidian 1.15, the sidebar header, vertical navigation and file list were displayed with the candidate plugin. A local check was also performed with Minimal Theme Settings disabled; other plugins and snippets were still enabled.
- Light and dark appearance, the search suggestion popup, a narrower sidebar, and fullscreen layout were checked in the live vault. This is not a clean-install or cross-platform test.
- With the companion temporarily disabled, the vertical navigation and file list remained visible; the branded header and custom new-note button disappeared. The companion was then re-enabled and the complete sidebar returned. Other plugins and snippets remained active.
- The companion now obtains its new-note label from Obsidian; Chinese was checked in the live UI and the English label was checked with a simulated command name. A full interface-language switch has not yet been tested.
- A prior title-reveal fix was confirmed by the user on clipped file names. A repeat hover test after the later theme/plugin changes remains open.

## Before publication

- Verify the current title-reveal behavior by hovering (a click is not an equivalent test), short windows and collapsed sidebar; repeat the theme-only check in a clean installation.
- Test a clean installation and other supported platforms, and verify the minimum supported Obsidian version.
- Complete an asset provenance and branding review. DeepSeek Harness's MIT license is included; the Minimal license is retained as an audit record while the remaining assets are reviewed.
- Decide how to distribute the companion plugin; the theme marketplace installs only the theme. Test actual interface-language switching.
- Prepare a privacy-safe screenshot, finalize license and release metadata, create a public repository and release, then submit the theme for community review.
