# Logic Apps Hub Prototype

A static, responsive operations dashboard that demonstrates a unified management experience across multiple Azure Logic Apps. The app uses fictional local data only—there are no Azure credentials, SDK calls, or backend services.

## Included experiences

- Estate-wide KPIs, run-volume chart, and health breakdown
- Neutral integration-estate overview with a linked Business Flows snapshot
- Integration Estate inventory grouped by Logic App with expandable workflow, connection, system, and artifact views
- Workflow artifact tracking for schemas, maps, custom assemblies/DLLs, and certificates
- Integration Estate snapshot on Overview with direct inventory navigation
- Customer-defined Business Flows grouping workflows across different Logic Apps
- Per-group analytics, connector usage, execution paths, and Azure/external dependency maps
- Per-flow dependency graphs covering systems, connections, Logic Apps, workflows, schemas, maps, and assemblies
- Correlation-ID message tracing with ordered cross-system hops, timings, status, and payload metadata
- Guided in-memory group builder with automatic dependency discovery
- Explicit Logic App-to-workflow hierarchy throughout the UI, with workflow selection grouped and sorted by Logic App name
- Run Details workspace with Success %, throughput, latency, and action-duration trend graphs
- Failure-by-action and failure-by-connector analysis
- Run filtering by Logic App, Business Flow, resource group, subscription, and status
- Run results enriched with parent Logic App and Business Flow columns
- Configuration workspace for Application Insights, Business Flow policies, access roles, and security posture
- Application Insights-style custom KQL query editor with browser-session saved views
- Context-aware **Open with query editor** actions across every monitoring and configuration view
- AI Insights workspace with explainable findings and a simulated GitHub model/repository chooser
- Overview filtering by Business Flow
- Search and environment, status, and region filters
- Logic Apps inventory with health and performance trends
- Recent workflow runs and active operational issues
- Workflow comparison cards
- Interactive workflow details drawer
- Responsive desktop and mobile navigation
- Accessible keyboard states and a filtered empty state

## Local development

Requirements: Node.js 20.19+ or 22.12+ and npm.

1. Install dependencies with `npm install`.
2. Start the development server with `npm run dev`.
3. Open the local URL printed by Vite.

The VS Code task **Start Logic Apps Hub** also launches the development server.

## Validation

- `npm run lint` checks the TypeScript and React source.
- `npm run build` creates the optimized static output in `dist`.
- `npm run preview` serves the production build locally.

## Prototype data

All workflow, run, subscription, alert, business-flow, connection, and dependency records live in local mock-data modules. Newly created groups remain in memory for the current browser session. Replace those modules with a secured server-side API when evolving the prototype. Azure management credentials must not be placed in browser code; use managed identity and least-privilege RBAC in a backend integration.
