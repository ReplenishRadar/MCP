# ReplenishRadar for Claude

ReplenishRadar connects your Shopify and Amazon sales and stock into one view. This plugin gives Claude the ReplenishRadar connector plus six skills that turn its tools into the inventory routines sellers actually run: a weekly reorder plan, a daily stockout check, a deep dive on one product, purchase order follow-through, an overstock review, and a data health check.

You need a ReplenishRadar account with a connected store. Sign up at https://replenishradar.com.

## Use it

1. Install the plugin, then open its Connectors tab and connect ReplenishRadar. You sign in with your ReplenishRadar account and pick the organization.
2. On the sign-in screen you choose what Claude may do. Reading is always included. Making changes (adding notes, creating and editing purchase orders, sending an approved order to a supplier, setting stock counts) and seeing costs and revenue are off until you tick them.
3. Ask in plain language. For example:
   - "What should I reorder this week? Group it by supplier."
   - "Which products are about to run out?"
   - "Tell me everything about SKU BLUE-MUG-12."
   - "Which purchase orders are still open, and did the supplier get PO-1042?"
   - "What stock is not selling and how much money is tied up in it?"
   - "Is my Amazon store syncing?"

Claude asks before every change. Sending a purchase order emails your supplier, so Claude shows you the order and waits for your yes first.

## Skills

| Skill | Use it for |
|---|---|
| weekly-reorder-review | What to buy, grouped by supplier, net of what is already on order |
| stockout-check | What is about to run out and which alerts are open |
| sku-deep-dive | One product's stock by location, sales trend and forecast |
| purchase-order-follow-through | Reading, changing, approving and sending purchase orders |
| overstock-review | Slow movers, dead stock and the cash tied up in them |
| data-health-check | Store connection, sync freshness and setup next steps |

## Data

The plugin itself stores nothing and runs no code. Its skills are instructions for Claude. All data goes through one connector at `https://api.replenishradar.com/api/mcp/oauth`, operated by ReplenishRadar, which sends Claude the inventory, sales, forecast, supplier and purchase order data of the organization you connected, and carries out the changes you approve. Nothing is sent anywhere else.

You can disconnect at any time from Connected apps in ReplenishRadar settings, or from Claude's connector settings.

- Documentation: https://replenishradar.com/docs/connector
- Privacy policy: https://replenishradar.com/privacy
- Terms: https://replenishradar.com/terms
- Support: support@replenishradar.com
