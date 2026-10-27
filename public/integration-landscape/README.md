# Integration Landscape

A unified view of all workflows, connections and artifacts with their dependencies.

A standalone, single-page design prototype for understanding a Logic Apps Standard project's dependencies, connections and artifacts. All three inventory sections are displayed together without tabs; sidebar links jump to each section. Open `index.html` in a current browser; no build, dependencies or Azure credentials are needed.

## Inventory sections

- **Dependency graph:** 28 sample workflows across seven systems, eight connections and four domains. Filter by workflow name, source system, target system, connection or explicit workflow selection. Source, target and connection dropdowns support multiple selections: values within a dropdown match with OR; different filters combine with AND. No selection in a dropdown shows all values; Clear selection restores that state. Explicit workflow selection remains separate, where clearing every workflow shows an empty graph. The graph displays the first eight matching workflows in inventory order and explicitly reports omitted workflows. Solid directional links represent connection dependencies; dashed links represent direct workflow invocations between visible workflows. Select nodes or connection chips for details. Fit to view scales the map to its viewport.
- **Connections:** All eight connections, with searchable names/endpoints and multi-select health and connector-type dropdowns, using the same OR-within/AND-across behavior. Details include authentication, nonsecret basic parameters, sample validation times and every referencing workflow. Jump from connection details to its filtered graph. Dropdowns support keyboard checkbox selection, Escape to close and closing on outside clicks.
- **Artifacts:** 22 sample schemas, maps, assemblies, certificate references, rules and templates. Filter by type, folder or path/name search. Expand the project folder tree; select files for placement notes and workflow references. Show all clears artifact filters.

## Scope

All data and health states are deterministic illustrative fixtures in `app.js`, including the 27 October 2026 snapshot. No live health checks, Azure access, artifact contents, uploads or deployment are implemented. All endpoints use the reserved `.example` domain. Folder paths are project-relative sample metadata, not files created on disk. Rules and email templates are custom application content, not native Logic Apps artifact types. Certificate entries document externally provisioned references rather than automatic project deployment.

The prototype includes responsive layouts, keyboard-operable section links and folder controls, visible focus states, empty states and a modal detail panel with focus trapping and Escape-to-close support. Large graphs remain horizontally scrollable on small screens; Fit to view provides a scaled overview.

## Validation

JavaScript syntax can be checked with `node --check app.js` if Node.js is installed. There is no package installation or build step.

## GitHub Pages

The published prototype is hosted at:
https://shreedivyamv.github.io/logic-apps-hub-prototype/integration-landscape/

In the GitHub repository, the four prototype files are stored under `public/integration-landscape/`. The existing Vite build copies that directory into the Pages site, alongside the multi-app and single-app hub prototypes. To publish updates, replace those files and commit to `main`; the existing Deploy Logic Apps Hub to GitHub Pages workflow builds and deploys the site.
