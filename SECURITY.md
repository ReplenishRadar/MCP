# Security policy

Report a vulnerability in this server, the ReplenishRadar API it calls, or the Claude plugin in `claude-plugin/` to security@replenishradar.com. Please do not open a public issue for it.

Our full policy, including what is in scope and how we acknowledge reports, is at https://replenishradar.com/security.

## How the server handles your key

- The server is a bridge: it reads your API key from the `REPLENISHRADAR_API_KEY` environment variable and sends each tool call with that key to `https://api.replenishradar.com/api/mcp/call` (or to the host in `REPLENISHRADAR_API_URL`, if you set one). It stores nothing and sends nothing anywhere else.
- Keys are scoped to one organization. A read-only key cannot call write tools, and what a key can do is set when it is created in ReplenishRadar, not by the agent.
- Purchase orders created through the server start as drafts. Sending one to a supplier requires it to be approved first.
- Revoke a key at any time in ReplenishRadar under Settings, API Keys.
