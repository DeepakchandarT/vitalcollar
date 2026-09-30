# Componentry development setup

This repository hosts FebFit Wellness as static HTML/CSS/JavaScript.

## Configuration

components.json registers the official @componentry registry. This registry-only configuration is for discovery; it is not a complete React/shadcn installation configuration.

.mcp.json configures the official shadcn MCP server for Claude Code. Open this repository in Claude Code with Node.js/npm installed, restart the client, and use /mcp to verify that shadcn reports Connected. Run the client from the repository root. The first launch requires internet access to download the CLI.

For Cursor, merge the mcpServers object into .cursor/mcp.json and enable the server in settings.

For Codex CLI, merge this into your user ~/.codex/config.toml and restart Codex from this repository root:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["-y", "shadcn@latest", "mcp"]
```

These files do not create an active ChatGPT connection or a hosted MCP endpoint. The server must be started by a compatible local MCP client. Runtime connection was not tested in ChatGPT.

## Using components

Ask the connected client to discover and inspect @componentry components. React components cannot render directly in the existing HTML pages. Before installing components, either adapt the selected interaction to vanilla JavaScript or add a separately tested React integration with a complete shadcn configuration, dependencies, Tailwind build, and aliases. Do not overwrite the existing website during framework setup.

## Official documentation

- https://componentry.dev/docs/mcp
- https://ui.shadcn.com/docs/mcp
