# Iconify MCP 🔍✨

MCP server for searching, fetching, and discovering icons from [Iconify](https://icon-sets.iconify.design/) — the largest icon library with 200,000+ icons across 150+ sets.

Built for [Crush](https://crush.chat), Claude, and any MCP-compatible client.

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/entaytion/iconify-mcp.git
   cd iconify-mcp
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

## Tools

### `search_icons`
Search icons by keyword across all Iconify sets.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | `string` | — | Search query (e.g. `"honey"`, `"heart"`, `"settings"`) |
| `limit` | `number` | `20` | Max results (1–100) |

### `get_icon_svg`
Get raw SVG content for a specific icon.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `icon` | `string` | — | Icon identifier (e.g. `"mdi:heart"`, `"tabler:sun"`) |
| `width` | `string` | — | Custom width (e.g. `"24"`, `"48"`) |
| `height` | `string` | — | Custom height (e.g. `"24"`, `"48"`) |

### `get_icon_set`
Get metadata about an icon set — total icons, categories, sample icons.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `set` | `string` | — | Set prefix (e.g. `"mdi"`, `"tabler"`, `"solar"`) |

## Usage

### With Crush

Add to your `crush.json`:

```json
{
  "mcp": {
    "iconify": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "/path/to/iconify-mcp/index.js"]
    }
  }
}
```

### With Claude, Cline, or any MCP client

```json
{
  "mcpServers": {
    "iconify": {
      "command": "bun",
      "args": ["run", "/path/to/iconify-mcp/index.js"]
    }
  }
}
```

### Standalone test

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | bun index.js
```

```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_icons","arguments":{"query":"heart","limit":5}}}' | bun index.js
```

## Example queries

| What you want | How to find it |
|---------------|----------------|
| ❤️ Heart icon | `search_icons` → `"heart"` → `get_icon_svg` → `"mdi:heart"` |
| ☀️ Sun icon | `search_icons` → `"sun"` → `get_icon_svg` → `"tabler:sun"` |
| 🎂 Cake icon | `search_icons` → `"cake"` → `get_icon_svg` → `"mingcute:cake-fill"` |
| Browse Material Icons | `get_icon_set` → `"mdi"` |
| Browse Solar Icons | `get_icon_set` → `"solar"` |

## How it works

All requests go to the public [Iconify API](https://docs.iconify.design/api/) (`api.iconify.design`). No authentication needed.

1. **Search** → `GET /search?query=...`
2. **SVG** → `GET /{icon}.svg`
3. **Set info** → `GET /collection?prefix=...`

## License

MIT
