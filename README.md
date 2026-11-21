# @replenishradar/mcp-server

[![smithery badge](https://smithery.ai/badge/pro/replenishradar)](https://smithery.ai/servers/pro/replenishradar)

Connect AI agents to live [ReplenishRadar](https://replenishradar.com) inventory data. Works with Claude Desktop, OpenClaw, and any MCP-compatible client.

## Setup

1. Get your API key from **ReplenishRadar > Settings > Apps and AI**, under API keys.
2. Add this server to your MCP client config. In Claude Desktop, open **Settings > Developer > Edit Config**:

```json
{
  "mcpServers": {
    "replenishradar": {
      "command": "npx",
      "args": ["-y", "@replenishradar/mcp-server"],
      "env": {
        "REPLENISHRADAR_API_KEY": "rr_sk_your_key_here"
      }
    }
  }
}
```

3. Restart Claude Desktop and ask: "What are my top stockout risks?"

## Claude or ChatGPT without an API key

Claude and ChatGPT can connect with your ReplenishRadar sign-in instead of a key.
Add a custom connector named ReplenishRadar with this address:

```text
https://api.replenishradar.com/api/mcp/oauth?via=mcp-readme
```

The [connector guide](https://replenishradar.com/docs/connector) covers each step
and what each permission allows.

## No account? Try it with a single GET

You do not need a ReplenishRadar account, a store connection, an API key, or a
POST. Fetch this URL and you get a fit verdict plus a short-lived read-only
sandbox key:

```text
GET https://api.replenishradar.com/api/public/agent-intake?tier=B&channels=shopify,amazon&sku_count_band=500_2k&store_count=2&primary_pain=stockouts&autonomy_intent=read
```

The same endpoint accepts a `POST` with a JSON body if you have one, and returns
an identical verdict and key. `GET` is listed first because the assistants that
evaluate this server most often can fetch a URL and nothing else.

**If you cannot hold a key at all**, the read tools run keyless against the same
synthetic catalog, and so does our forecasting math on numbers you supply:

```text
GET https://api.replenishradar.com/api/public/try        # what this is, plus a live computation
GET https://api.replenishradar.com/api/public/demo       # the read tools, no key
GET https://api.replenishradar.com/api/public/calc       # reorder point, safety stock and more, on your own numbers
```

The sandbox key lasts 24 hours and is read-only. It is pinned to a shared
synthetic demo organization, never production tenant data, and responses are
tagged `sandbox=true`. Treat the one-time key as a secret and never publish it.

If a positive verdict comes back without a key, that is a fault on our side
rather than a limit you have hit, and the keyless endpoints above still work.
Earlier wording here blamed capacity or attribution, which sent at least one
evaluating agent to the wrong conclusion about a real outage.

## Available Tools

<!-- generated:tools:start -->
53 tools. Generated from `tools.manifest.json`; do not edit by hand.

### Read (33)

Standard includes limited read API access. Growth adds diagnosis/status read tools.

| Tool | Description |
|------|-------------|
| `rr_list_suggested_purchase_orders` | Get AI-suggested purchase orders based on stockout risk, demand, and supplier reliability. |
| `rr_list_purchase_orders` | List purchase orders with status, amounts, and delivery info. |
| `rr_get_purchase_order` | Get detailed info for a specific purchase order. |
| `rr_get_purchase_order_pdf` | Find where to open a purchase order as a PDF. |
| `rr_list_purchase_order_documents` | List the documents attached to a purchase order, newest first. |
| `rr_list_purchase_order_notes` | Get all notes for a purchase order, most recent first. |
| `rr_list_recommendations` | List recommendations: the buying and transfer work ReplenishRadar has prepared that is still waiting, as supplier orders, transfers between locations, or both. |
| `rr_get_recommendation` | Get one recommendation with child item provenance, snapshots, linked execution records, and event history. |
| `rr_list_transfer_decisions` | Why products were, or were not, moved between the seller's own locations on the last transfer run. |
| `rr_list_stockout_risks` | Get stockout risk assessment for SKUs. |
| `rr_get_inventory_position` | Get current inventory positions (on-hand, in-transit, sellable) for a SKU. |
| `rr_get_demand_forecast` | Get demand forecast for a SKU including predicted demand, seasonal factors, and the item's forecast track record: whether its forecast has historically beaten a naive same-as-last-week baseline, or whether there is too little scored history to judge. |
| `rr_list_products` | List inventory items with optional filters. |
| `rr_list_suppliers` | List suppliers with performance metrics. |
| `rr_list_sales_history` | Get sales history rows, newest first, over a time period. |
| `rr_list_top_sellers` | Get top-selling products ranked by units sold over the whole window, one row per product however many SKU labels its sales carry. |
| `rr_list_slow_movers` | Overstock / dead-stock / slow movers: SKUs you are HOLDING (on-hand &gt; 0) that aren't selling - capital tied up. |
| `rr_get_inventory_value` | Get total inventory value (units and value across all active locations). |
| `rr_get_inventory_health` | Store-wide inventory health summary: stockout-risk counts by level and active alert counts by type. |
| `rr_list_lost_sales` | Get estimated lost sales due to stockouts. |
| `rr_get_product_expiry_risk` | Expiry risk for one product marked as expiring: at each location holding it, the recorded lots estimated to be still on hand (lot code, expiry date, and the date the lot becomes unusable), whether each is expected to sell before that date, and the units and cost at risk. |
| `rr_list_expiring_lots` | List the lots across the whole catalog that are estimated to be left unsold when they become unusable (status at_risk), or that have already reached that date with units left (past_cutoff), earliest unusable date first, at Amazon FBA and at the seller's own locations. |
| `rr_get_sync_status` | Get sync status for connected stores. |
| `rr_get_store_health` | Diagnose each connected store's health. |
| `rr_get_data_freshness` | Get per-dimension freshness status (sync, positions, demand, risk, recommendations) with staleness thresholds and a primary_concern summary. |
| `rr_get_setup_status` | Check onboarding milestones and compute the next setup step. |
| `rr_get_recent_activity` | Summarize the last N days of org activity (default 7, max 30). |
| `rr_list_alerts` | Get active alerts (stockout warnings, sync failures, anomalies). |
| `rr_get_memory_entry` | Read one saved memory entry by namespace and key. |
| `rr_list_memory_entries` | List the entries stored under a memory namespace, most recently updated first. |
| `rr_search_knowledge` | Search the ReplenishRadar knowledge base for product features, best practices, and inventory management concepts: the answers the seller's live data does not hold. |
| `rr_evaluate_fit` | Check whether ReplenishRadar fits a seller from a few facts about their business, and get a fit verdict. |
| `rr_submit_feedback` | Sends feedback the user has agreed to pass on to the ReplenishRadar product team, on the user's behalf. |

### Basic write (Standard tier and up) (12)

Safe, low-blast-radius writes - no money or stock mutation.

| Tool | Description |
|------|-------------|
| `rr_add_purchase_order_note` | Add a note to a purchase order: context the seller wants kept on the order record (e.g., 'supplier confirmed lead time'). |
| `rr_request_purchase_order_approval` | Ask a manager to approve a draft/review PO. |
| `rr_record_proforma_invoice` | Record a supplier's proforma invoice (PI) on a purchase order: its number, date, total and payment terms. |
| `rr_add_recommendation_note` | Add a note to a recommendation: context the seller wants kept on the recommendation itself rather than on a purchase order. |
| `rr_dismiss_recommendation` | Dismiss a recommendation when the seller decides no buyer work is needed. |
| `rr_preview_recommendation` | Preview a recommendation before acting on it: its kind, status, products, supplier and locations, and its current updated_at. |
| `rr_create_draft_from_recommendation` | Turn a recommendation into its draft purchase order or draft transfer, for a person to review. |
| `rr_close_recommendation` | Close a recommendation with a reason when no purchase order or transfer is needed, for example because the stock was bought another way. |
| `rr_retry_recommendation_draft` | Try again to turn a recommendation into its draft purchase order or draft transfer after an earlier attempt was blocked or failed. |
| `rr_acknowledge_alert` | Acknowledge an open alert. |
| `rr_save_memory_entry` | Save a small JSON object under a namespace and key, for an agent to read back later. |
| `rr_delete_memory_entry` | Delete one saved memory entry by namespace and key. |

### Sensitive write (Growth tier and up) (8)

Money / stock mutation.

| Tool | Description |
|------|-------------|
| `rr_create_purchase_order` | Create a draft purchase order for a supplier. |
| `rr_import_purchase_orders` | Import open and historical purchase orders from a CSV export (the way in for a seller moving from another inventory tool). |
| `rr_update_purchase_order` | Update a draft or suggested PO. |
| `rr_send_purchase_order` | Send an approved PO: marks it sent (status='sent', sent_at=now) and emails the supplier the PO packet at the supplier's contact on file. |
| `rr_cancel_purchase_order` | Cancel a PO (status='cancelled'). |
| `rr_create_location` | Create a manual stocking location: a warehouse, 3PL, FBA, WFS, in-transit or inbound location, with an optional address. |
| `rr_set_stock_at_location` | Set the on-hand quantity of one SKU at one manual location to an absolute number, replacing the stored count. |
| `rr_trigger_sync` | Trigger an inventory sync for a connected Shopify or Amazon store. |
<!-- generated:tools:end -->

PO creation always starts as a **draft**. `rr_send_purchase_order` only sends a PO that was already human-approved.

Action execution has two modes. `rr_create_draft_from_recommendation` with `mode="draft"` (the default) creates a draft PO and/or draft transfer for an action's items and never auto-sends to a supplier or commits stock. With `mode="autonomous"` it additionally sends the PO or commits the transfer, but only when the key has `sensitive_write` + the operation's tool group + an enabled per-key budget (`autonomous_enabled=true`) and every guardrail passes; otherwise it leaves a draft and returns an `rr_request_purchase_order_approval` hint (`draft_fallback`) or refuses without mutating (`hard_refuse`). Call `rr_preview_recommendation` first to get the action's current `updated_at`, then pass it as `expected_updated_at` so a stale action is rejected before any write. Pass a stable `idempotency_key` so a retried call replays the original result instead of double-creating artifacts or double-sending.

### Agent context store

A small, org-scoped, auditable key/value memory so an agent can remember bounded workflow state. `rr_get_memory_entry` / `rr_list_memory_entries` are read-capability; `rr_save_memory_entry` / `rr_delete_memory_entry` are basic-write. All four are in the `agent_context` tool group.

The four tools are listed above with the read and basic-write tools.

Rules and limits:

- **Namespaces are code-owned and per-key allowlisted.** A human admin must grant your API key read/write/delete on each namespace in Settings > Apps and AI (API keys card). Same-organization access alone is **not** sufficient.
- **No secrets, no raw PII.** Writes that look like tokens, passwords, private keys, credentials, or raw emails/phones/addresses are rejected.
- `value` must be a **JSON object** (not a scalar or array), capped at **16 KiB** serialized.
- `ttl_seconds` is optional and capped at **90 days**; with no TTL the entry persists while the organization exists.
- `rr_list_memory_entries` **requires** `namespace` and never lists across namespaces.
- `scope_ref` is descriptive metadata only and is **not** part of uniqueness - encode per-scope entries into the `key` (for example `supplier_rules/sku:ABC123`).
- Sensitive namespaces (for example `sourcing_economics`) additionally require the key to hold the sensitive economics read capability + tool group.

## Spend budgets (admin-managed, no MCP tool)

Per-API-key spend budgets - per-PO value cap, rolling-24h daily cap, max transfer quantity delta, an `autonomous_enabled` flag, and vendor / destination / transfer-source (or route-pair) allowlists - constrain what an autonomous key may buy or move. They are managed **only** by a human admin in Settings > Apps and AI (API keys card) (a JWT-admin Settings API); there is no MCP tool to read or change a budget, and an API key cannot reach the budget routes, not even for its own caps. Budgets are consumed only by autonomous send/commit, autonomous mode is off by default, and a denied autonomous action receives only a short decision reason - never the cap amounts, the allowlists, or another key's ledger.

## Rate Limits

- **Standard** ($99/mo): 10 calls/hour, read + basic-write tools
- **Growth** ($199/mo): 100 calls/hour, read + basic + sensitive read/write + diagnosis/status tools
- **Scale** ($499/mo): 1,000 calls/hour, full read + write capability set

## Learn More

- [MCP Setup Guide](https://replenishradar.com/blog/connect-ai-agent-amazon-shopify-inventory)
- [ReplenishRadar](https://replenishradar.com)
