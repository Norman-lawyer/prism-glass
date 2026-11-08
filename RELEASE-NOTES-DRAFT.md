# Prism Glass — local release checklist

The current files are a local development candidate. Do not submit the theme until the remaining checks are complete and submission is authorized.

## Verified in the user's vault

- Obsidian 1.15 on macOS: light and dark editor views, dark reading view, and light reading view. The Quiet Notes snippet was temporarily disabled during the independent reading check, then restored. Other personal settings and plugins remained enabled.
- The large custom new-note button is omitted; use Obsidian's built-in new-note control. The branded header and desktop sidebar are implemented in the theme.
- The macOS translucent-window sidebar uses a solid main panel to prevent stale views appearing underneath the active view. Light and dark file-list-to-calendar transitions were checked in the live vault.
- The title and navigation colors are defined in the theme, along with the Quiet Notes typography and table styles. Installed fonts and Obsidian settings can change the appearance.
- Installed the candidate previously labeled 1.0.2 in the existing vault as Prism Glass and verified its two files matched; the manifest was subsequently changed to 1.0.0 at the author’s request, with the stylesheet unchanged. With the sidebar companion disabled, a truncated 05 filename scrolled to its end on hover. The Rainbow Highlight plugin was separately disabled while checking all six editor heading colors.
- Both enabled CSS snippets were temporarily disabled together; the current note's table and sidebar remained styled. Other plugins and personal settings remained active.
- Quiet Notes matches the upstream CSS byte for byte; Andrew's MIT notice is included in `theme.css` and `third-party/Quiet-Notes-LICENSE`, with README attribution. The remaining embedded SVG paths were matched to DeepSeek Harness artwork or the official Obsidian lockup.

## Remaining checks

- Expand the independent demo-vault checks to other supported systems and mobile. Confirm the minimum Obsidian version; macOS 1.15.0 was checked in restricted mode with no enabled snippets.
- Recheck narrow and short windows, accessibility, and localized interface labels. The collapsed sidebar and long filename 05 were checked in the current macOS configuration; the user also confirmed that filenames 02 and 03 scroll normally when truncated.
- Retain the applicable DeepSeek Harness and Quiet Notes MIT attribution; ensure trademark use remains consistent with the official Obsidian brand guidelines.
- Update the screenshot if the final design changes. Prepare a new version and release only when the user authorizes publication.

## Release alignment checked 2026-11-08

- The repository root has `README.md`, `LICENSE`, `manifest.json`, `theme.css`, and a 2810 × 1946 screenshot captured in the independent demo vault. Its aspect ratio differs from the 16:9 recommendation; confirm presentation before submission.
- GitHub currently has 1.0.0 and 1.0.1 prereleases; the 1.0.1 release has both required attachment names, `manifest.json` and `theme.css`.
- The selected formal version is 1.0.0. GitHub already has a public 1.0.0 prerelease and tag with older assets, as well as a 1.0.1 prerelease. The existing 1.0.0 tag, release and attachments do not represent this candidate. Before submission, resolve that conflict explicitly, ensure the default branch and release tag point to the final source, and verify both release assets match the final files. Do not silently reuse the old assets.
- The screenshot was refreshed from the independent demo vault after the latest local color adjustments. It has been checked for personal information and should be reviewed for market presentation before publication.

Source: https://docs.obsidian.md/Themes/App%20themes/Submit%20your%20theme

## Draft release description for 1.0.0

Prism Glass brings a glass-inspired desktop sidebar, Obsidian branding, colorful editor headings, and Quiet Notes typography to Obsidian. The sidebar and note styles work without a companion plugin or CSS snippet. Tested on macOS with Obsidian 1.15.0; other platforms remain unverified.
