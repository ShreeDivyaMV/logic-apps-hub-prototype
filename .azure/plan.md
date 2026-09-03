# Unified Multi-Logic Apps Hub Prototype Plan

## Status
Integration Estate enhancement completed and validated

## Goal
Build a polished static website prototype for a unified hub that presents operational data across multiple Azure Logic Apps. The prototype will use realistic local dummy data and will not connect to Azure APIs.

## Requirements and assumptions
- New project in an empty workspace.
- Static, client-side application suitable for stakeholder demos.
- React, TypeScript, and Vite.
- Responsive desktop/tablet/mobile design.
- No authentication, secrets, backend, or live Azure management calls.
- Accessible interactions and clear loading/empty/error-style UI states.
- Architecture should make replacing dummy data with an Azure API straightforward later.

## Prototype experience
1. Global overview with KPI cards for Logic Apps, runs, success rate, failures, and average duration.
2. Logic Apps inventory spanning multiple subscriptions, resource groups, regions, and workflow types.
3. Search and filters for subscription, environment, status, region, and health.
4. Workflow detail panel with metadata, run trends, trigger information, and recent runs.
5. Recent runs table with status, timestamps, duration, correlation ID, and drill-down details.
6. Alerts and issues area highlighting failed, throttled, and disabled workflows.
7. Multi-workflow comparison view for health and performance.
8. Local mock-data/service layer with realistic data and deterministic behavior.
9. Business Flows tab where customers create named groups from workflows across different Logic Apps.
10. Group detail experience with aggregate analytics, workflow-level performance, connector inventory, and Azure/non-Azure dependency maps.
11. Static create-flow dialog with validation and local in-memory persistence for the prototype session.

## Visual direction
- Modern Azure-inspired operations console without copying the Azure portal.
- Dark navigation shell with a bright, information-dense workspace.
- Clear status colors, compact charts, subtle gradients, and responsive cards/tables.
- Use icons and lightweight CSS/SVG visualizations; avoid requiring a charting backend.

## Project structure
- `src/components`: reusable navigation, cards, tables, filters, badges, charts, and panels.
- `src/data`: dummy subscriptions, Logic Apps, runs, and alerts.
- `src/types`: typed prototype domain model.
- `src/styles`: design tokens and responsive application styles.
- `src/App.tsx`: prototype composition and client-side interactions.

## Implementation steps
- [x] Scaffold a Vite React TypeScript application.
- [x] Define typed dummy data and selectors.
- [x] Build the shell, navigation, overview KPIs, and filter bar.
- [x] Build inventory, recent-run, alert, and comparison experiences.
- [x] Add workflow drill-down interactions and responsive behavior.
- [x] Add accessibility details and polished empty states.
- [x] Run lint and production build validation.
- [x] Review the result in a browser and fix visual/runtime issues.

## Business Flows enhancement
- [x] Add typed business-flow, connection, and dependency mock data.
- [x] Add a Business Flows navigation tab and group overview cards.
- [x] Add an interactive create-flow dialog for selecting workflows across Logic Apps.
- [x] Add group analytics with aggregate KPIs and workflow-level metrics.
- [x] Add connection and dependency views distinguishing Azure and external systems.
- [x] Validate responsive interactions, lint, and production build.
- [x] Update documentation and mark the enhancement complete.

## Run Details analytics enhancement
- [x] Rename Runs to Run Details and update headings.
- [x] Replace the environment filter with subscription and add Logic App, Business Flow, and resource group filters.
- [x] Add Success %, throughput, latency, and action-duration charts.
- [x] Add failure-by-action and failure-by-connector sections.
- [x] Add Logic App and Business Flow columns to run results.
- [x] Validate filters, responsive layout, lint, and production build.

## Overview and configuration enhancement
- [x] Replace the personalized greeting with a neutral operations overview heading.
- [x] Add a Business Flows snapshot with health, workflow, Logic App, and run metrics plus navigation.
- [x] Add a Configuration link and dedicated tab.
- [x] Add static Application Insights, Business Flow, access, and security configuration sections.
- [x] Keep configuration values fictional and avoid collecting or displaying secrets.
- [x] Validate navigation, responsive layout, lint, and production build.

## Query and AI insights enhancement
- [x] Rename Flowboard branding to Logic Apps Hub.
- [x] Add a Custom Query tab with a KQL-style editor, sample results, saved queries, and local save/update behavior.
- [x] Add Open with query editor actions to every primary view, preloading a relevant editable query.
- [x] Add a Business Flow filter to the Overview page and apply it to workflow-level overview content.
- [x] Add an AI Insights tab with anomaly and optimization insights.
- [x] Add a simulated GitHub connection and model chooser without requesting or storing credentials.
- [x] Keep all query execution, GitHub connection, AI output, and saved views fictional and local.
- [x] Validate navigation, interactions, responsive layout, lint, and production build.

## Integration Estate enhancement
- [x] Add typed integration artifact data for schemas, maps, assemblies, and certificates used by workflows.
- [x] Add an Integration Estate tab grouped by Logic App, with expandable workflows.
- [x] Show each workflow's dependent Azure/external systems, connection instances, and artifacts.
- [x] Add estate-wide filters and inventory summary metrics.
- [x] Add an Integration Estate snapshot and navigation link to Overview.
- [x] Add a context-aware query editor action for the new estate view.
- [x] Keep inventory and artifact records fictional and local.
- [x] Validate responsive interactions, lint, production build, and published-site compatibility.

## Security and Azure considerations
- Keep all data fictional and local.
- Do not include Azure credentials, tokens, resource IDs tied to real tenants, or management-plane calls.
- If live integration is added later, place Azure access behind a secured API and use managed identity plus least-privilege RBAC rather than exposing credentials in browser code.
- A later deployment phase can target Azure Static Web Apps after separate Azure context confirmation and pre-deployment validation.

## Deliverable
A runnable, production-buildable static prototype with realistic dummy data and documented local run/build commands.
