# Prism Glass — release checklist

This directory is a development preview, not a published release. The live vault is using the candidate theme and companion plugin. The theme uses Obsidian's built-in styling as its base; the previous bundled Minimal base was removed.

## Observed locally

- On macOS with Obsidian 1.15, the sidebar header, vertical navigation and file list were displayed with the candidate plugin. A local check was also performed with Minimal Theme Settings disabled; other plugins and snippets were still enabled.
- Light and dark appearance, the search suggestion popup, a narrower sidebar, and fullscreen layout were checked in the live vault. This is not a clean-install or cross-platform test.
- With the companion temporarily disabled, the vertical navigation and file list remained visible; the custom new-note button disappeared; a later CSS fallback restored the branded header without the plugin. The companion was then re-enabled and the complete sidebar returned. Other plugins and snippets remained active.
- The companion now obtains its new-note label from Obsidian; Chinese was checked in the live UI and the English label was checked with a simulated command name. A full interface-language switch has not yet been tested.
- A CSS-only hover reveal was observed on a long file name with the companion disabled. Test slightly clipped names, narrow panes, accessibility, and other platforms before release.
- A prior title-reveal fix was confirmed by the user on clipped file names. A repeat hover test after the later theme/plugin changes remains open.

## Before publication

- Verify the current title-reveal behavior by hovering (a click is not an equivalent test), short windows and collapsed sidebar; repeat the theme-only check in a clean installation.
- Test a clean installation and other supported platforms, and verify the minimum supported Obsidian version.
- Complete an asset provenance and branding review. DeepSeek Harness's MIT license is included; the Minimal license is retained as an audit record while the remaining assets are reviewed.
- Decide how to distribute the companion plugin; the theme marketplace installs only the theme. Test actual interface-language switching.
- Prepare a privacy-safe screenshot, finalize license and release metadata, create a public repository and release, then submit the theme for community review.

## Native new-note investigation

In Obsidian 1.15 on macOS, the file explorer leaf stays in the DOM but is `display: none` when Search is active. A CSS-only attempt to expose its action with anchor positioning failed to resolve the anchor and did not produce a usable button. The experiment was reverted. Further testing is required across navigation, collapsed sidebar and window sizes before replacing the companion.
