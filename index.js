#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://api.iconify.design";

const server = new McpServer({
  name: "iconify-mcp",
  version: "1.0.0",
});

server.tool(
  "search_icons",
  "Search icons on Iconify by keyword",
  {
    query: z.string().describe("Search query (e.g. 'honey', 'heart', 'settings')"),
    limit: z.number().min(1).max(100).default(20).describe("Max results (default 20)"),
  },
  async ({ query, limit }) => {
    const url = `${API_BASE}/search?query=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { content: [{ type: "text", text: `Error: ${res.status} ${res.statusText}` }], isError: true };
    }
    const data = await res.json();
    if (!data.icons?.length) {
      return { content: [{ type: "text", text: "No icons found." }] };
    }
    const lines = data.icons.map((icon, i) => {
      const set = data.collections?.[icon]?.prefix || icon.split("-")[0];
      return `${i + 1}. \`${icon}\` — ${data.collections?.[icon]?.name || set}`;
    });
    const txt = [`Found ${data.icons.length} icons for "${query}":`, ...lines].join("\n");
    // Also include raw JSON for programmatic use
    return {
      content: [
        { type: "text", text: txt },
        {
          type: "text",
          text: JSON.stringify({ icons: data.icons, total: data.total, collections: data.collections }),
        },
      ],
    };
  },
);

server.tool(
  "get_icon_svg",
  "Get SVG content of a specific Iconify icon",
  {
    icon: z.string().describe("Icon identifier (e.g. 'mdi:heart', 'material-symbols:settings')"),
    width: z.string().optional().describe("Custom width (e.g. '24', '48')"),
    height: z.string().optional().describe("Custom height (e.g. '24', '48')"),
  },
  async ({ icon, width, height }) => {
    const params = new URLSearchParams();
    if (width) params.set("width", width);
    if (height) params.set("height", height);
    const qs = params.toString();
    const url = `${API_BASE}/${encodeURIComponent(icon)}.svg${qs ? "?" + qs : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { content: [{ type: "text", text: `Error: ${res.status} ${res.statusText}` }], isError: true };
    }
    const svg = await res.text();
    return { content: [{ type: "text", text: svg }] };
  },
);

server.tool(
  "get_icon_set",
  "Get metadata about an Iconify icon set (prefix, name, total icons, license, samples)",
  {
    set: z.string().describe("Icon set prefix (e.g. 'mdi', 'material-symbols', 'fa')"),
  },
  async ({ set }) => {
    const url = `${API_BASE}/collection?prefix=${encodeURIComponent(set)}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { content: [{ type: "text", text: `Error: ${res.status} ${res.statusText}` }], isError: true };
    }
    const data = await res.json();
    const info = [
      `Prefix: ${data.prefix}`,
      `Name: ${data.title || "N/A"}`,
      `Total icons: ${data.total}`,
    ].join("\n");
    const samples = (data.uncategorized || []).slice(0, 10);
    const cats = data.categories ? Object.keys(data.categories).slice(0, 8).join(", ") : "N/A";
    const sampleStr = samples.length ? `\n\nSample icons:\n${samples.map((s, i) => `${i + 1}. \`${data.prefix}:${s}\``).join("\n")}` : "";
    return { content: [{ type: "text", text: info + `\nCategories: ${cats}` + sampleStr }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
