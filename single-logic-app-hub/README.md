# Single Logic App Hub

A responsive operations prototype scoped to one Azure Logic App. Horizontal tabs expose Logic App and workflow-level monitoring without a Business Flow layer.

## Included views

- Logic App overview with workflow-rich dependency topology
- Resource header with subscription, resource group, runtime URL, location, and App Service plan
- Time-range filtering for run metrics, charts, and generated KQL
- Six fictional workflows with vertically stacked run-status comparisons
- Logic App availability, CPU, memory, and worker health metrics
- Common and recent failures with operational recommendations
- Run analytics with combined run ID, status, correlation ID, and workflow filters
- Run-selectable correlation traces with operation diagnostics
- AI operational insights and a cross-view KQL query editor
- Browser-local named custom query views
- Header Configure dialog for selecting the Application Insights resource

All data is fictional and local. No Azure credentials or live service calls are used.

## Development

1. Run `npm install`.
2. Run `npm run dev`.
3. Use `npm run build` and `npm run lint` for validation.
