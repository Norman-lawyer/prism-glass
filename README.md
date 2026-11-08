# Prism Glass

An Obsidian desktop theme inspired by the sidebar of DeepSeek Harness. It uses Obsidian's built-in styling as its base and adds a translucent sidebar, light and dark colors, and a vertical navigation layout.

> The theme is prepared for community review. The screenshot shows the optional companion plugin enabled; the file list and another tab are blurred for privacy.

![Prism Glass screenshot](screenshot.png)

## Requirements

- Obsidian 1.15.0 or later. Testing so far has been on macOS; other platforms have not yet been verified.
- The companion plugin is optional, but needed for the complete sidebar: it provides the branded header, new-note button, collapsed-sidebar button, and long-file-name reveal. Installing the theme alone does not install the plugin.
- The companion plugin uses Obsidian's localized new-note command label; if unavailable, it falls back to Chinese or English.

## Manual installation

1. Copy `manifest.json` and `theme.css` into your vault's `.obsidian/themes/Prism Glass/` folder.
2. In Obsidian, open **Settings → Appearance → Themes** and select **Prism Glass**.
3. For the complete sidebar, copy the contents of `companion-plugin/` into `.obsidian/plugins/deepseek-glass-sidebar/` and enable **DeepSeek Glass Sidebar** in **Settings → Community plugins**. Community plugins must be enabled first.

The theme also works without the companion, but those plugin-provided controls and behaviors will be absent. Native translucency depends on the operating system and Obsidian's window settings.

## Credits

Some sidebar assets and visual details are derived from [DeepSeek Harness](https://github.com/deepseek-ai/DeepSeek-Harness), distributed under the MIT license. See [its license](third-party/DeepSeek-Harness-LICENSE). Obsidian names and marks belong to their respective owner; this independent project is not affiliated with or endorsed by Obsidian.

The original local theme previously included Minimal; its base stylesheet was removed from this development version. The retained assets and attribution are still being reviewed before publication.
