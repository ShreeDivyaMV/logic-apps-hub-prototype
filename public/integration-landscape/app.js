"use strict";

const GRAPH_LIMIT = 8;
const systems = [
  { id: "store", name: "Commerce storefront", kind: "HTTPS / REST API", icon: "ST" },
  { id: "sap", name: "SAP S/4HANA", kind: "Enterprise ERP", icon: "SA" },
  { id: "crm", name: "Dynamics 365", kind: "Customer platform", icon: "DY" },
  { id: "bus", name: "Azure Service Bus", kind: "Queues & topics", icon: "SB" },
  { id: "sql", name: "Azure SQL", kind: "Operational database", icon: "DB" },
  { id: "blob", name: "Azure Blob Storage", kind: "Documents & archives", icon: "BL" },
  { id: "mail", name: "Microsoft 365", kind: "Email & notifications", icon: "M" },
];
const connections = [
  { id: "commerce-api", connector: "HTTP", system: "store", health: "Healthy", type: "Built-in", auth: "Managed identity", checked: "08:59", endpoint: "https://store.contoso.example/api", parameters: { "Base URL": "https://store.contoso.example/api", Audience: "api://commerce", "Timeout": "30 seconds" }, note: "The illustrative endpoint is available and authentication is valid." },
  { id: "sap-erp", connector: "SAP", system: "sap", health: "Degraded", type: "Managed", auth: "Basic (Key Vault reference)", checked: "08:57", endpoint: "sap.contoso.example", parameters: { "Application server": "sap.contoso.example", "System number": "00", Client: "100", Gateway: "contoso-onprem-gateway" }, note: "Elevated response latency in the sample snapshot. Inspect the on-premises gateway and SAP endpoint before retrying." },
  { id: "dynamics-crm", connector: "Microsoft Dataverse", system: "crm", health: "Healthy", type: "Managed", auth: "OAuth 2.0", checked: "08:58", endpoint: "https://contoso.crm.example", parameters: { "Environment URL": "https://contoso.crm.example", "Tenant": "Contoso (sample)", "API version": "v9.2" }, note: "The illustrative OAuth session and endpoint are healthy." },
  { id: "servicebus-orders", connector: "Service Bus", system: "bus", health: "Healthy", type: "Built-in", auth: "Managed identity", checked: "08:59", endpoint: "sb-commerce.contoso.example", parameters: { Namespace: "sb-commerce.contoso.example", "Entity": "orders", Transport: "AMQP over WebSockets" }, note: "The sample orders queue is available." },
  { id: "sql-operations", connector: "SQL Server", system: "sql", health: "Healthy", type: "Built-in", auth: "Managed identity", checked: "08:59", endpoint: "sql-commerce.contoso.example", parameters: { Server: "sql-commerce.contoso.example", Database: "CommerceOperations", Encryption: "Required" }, note: "Database access is healthy in this sample snapshot." },
  { id: "blob-documents", connector: "Azure Blob Storage", system: "blob", health: "Healthy", type: "Built-in", auth: "Managed identity", checked: "08:58", endpoint: "stcommerce.contoso.example", parameters: { "Account endpoint": "https://stcommerce.contoso.example", Container: "integration-documents", "Access": "Private" }, note: "The sample document container is reachable." },
  { id: "office365-mail", connector: "Office 365 Outlook", system: "mail", health: "Error", type: "Managed", auth: "OAuth 2.0", checked: "08:55", endpoint: "notifications@contoso.example", parameters: { Mailbox: "notifications@contoso.example", "Connection owner": "Integration operations", "Permission": "Mail.Send" }, note: "The sample authorization has expired. Reauthorize the connection to restore email delivery." },
  { id: "servicebus-events", connector: "Service Bus", system: "bus", health: "Healthy", type: "Built-in", auth: "Managed identity", checked: "08:59", endpoint: "sb-commerce.contoso.example", parameters: { Namespace: "sb-commerce.contoso.example", Entity: "commerce-events", "Entity type": "Topic" }, note: "The sample events topic is available." },
];
const workflowSpecs = [
  ["Receive-order", "Orders", "commerce-api", "servicebus-orders"],
  ["Validate-order", "Orders", "servicebus-orders", "sql-operations"],
  ["Fulfill-order", "Orders", "servicebus-orders", "sap-erp"],
  ["Archive-order", "Orders", "servicebus-orders", "blob-documents"],
  ["Notify-customer", "Orders", "sql-operations", "office365-mail"],
  ["Update-order-status", "Orders", "sap-erp", "commerce-api"],
  ["Sync-order-to-CRM", "Orders", "servicebus-orders", "dynamics-crm"],
  ["Publish-order-event", "Orders", "sql-operations", "servicebus-events"],
  ["Receive-invoice", "Finance", "sap-erp", "servicebus-events"],
  ["Validate-invoice", "Finance", "servicebus-events", "sql-operations"],
  ["Archive-invoice", "Finance", "sap-erp", "blob-documents"],
  ["Send-invoice", "Finance", "blob-documents", "office365-mail"],
  ["Reconcile-payments", "Finance", "commerce-api", "sap-erp"],
  ["Record-payment", "Finance", "servicebus-events", "sql-operations"],
  ["Publish-refund", "Finance", "sap-erp", "servicebus-events"],
  ["Sync-customer", "Customers", "commerce-api", "dynamics-crm"],
  ["Enrich-customer", "Customers", "dynamics-crm", "sql-operations"],
  ["Send-welcome-email", "Customers", "dynamics-crm", "office365-mail"],
  ["Archive-customer", "Customers", "dynamics-crm", "blob-documents"],
  ["Publish-customer-event", "Customers", "dynamics-crm", "servicebus-events"],
  ["Update-preferences", "Customers", "commerce-api", "dynamics-crm"],
  ["Sync-inventory", "Inventory", "sap-erp", "sql-operations"],
  ["Publish-stock", "Inventory", "sql-operations", "commerce-api"],
  ["Receive-stock-event", "Inventory", "servicebus-events", "sql-operations"],
  ["Archive-stock", "Inventory", "sql-operations", "blob-documents"],
  ["Low-stock-alert", "Inventory", "sql-operations", "office365-mail"],
  ["Reserve-stock", "Inventory", "servicebus-orders", "sap-erp"],
  ["Release-stock", "Inventory", "servicebus-events", "sap-erp"],
];
const workflows = workflowSpecs.map(([name, domain, input, output], index) => ({
  id: `wf-${index + 1}`, name, domain, input, output,
  source: connections.find(c => c.id === input).system,
  target: connections.find(c => c.id === output).system,
  mode: index % 5 === 0 ? "Stateless" : "Stateful",
}));
const interactions = [
  ["wf-1", "wf-2"], ["wf-2", "wf-3"], ["wf-3", "wf-5"], ["wf-3", "wf-6"],
  ["wf-9", "wf-10"], ["wf-10", "wf-12"], ["wf-16", "wf-17"], ["wf-17", "wf-18"],
  ["wf-22", "wf-23"], ["wf-24", "wf-26"], ["wf-3", "wf-27"],
];
const artifactSpecs = [
  ["Order.xsd", "Schemas", "Artifacts/Schemas/Orders", "4.2 KB", ["wf-1", "wf-2", "wf-3"]],
  ["OrderResponse.xsd", "Schemas", "Artifacts/Schemas/Orders", "2.1 KB", ["wf-6"]],
  ["Invoice.xsd", "Schemas", "Artifacts/Schemas/Finance", "6.8 KB", ["wf-9", "wf-10"]],
  ["Customer.xsd", "Schemas", "Artifacts/Schemas/Customers", "3.5 KB", ["wf-16", "wf-17"]],
  ["Inventory.xsd", "Schemas", "Artifacts/Schemas/Inventory", "2.7 KB", ["wf-22", "wf-24"]],
  ["CommonTypes.xsd", "Schemas", "Artifacts/Schemas/Shared", "1.6 KB", ["wf-2", "wf-10"]],
  ["OrderToSAP.xslt", "Maps", "Artifacts/Maps/Orders", "8.3 KB", ["wf-3"]],
  ["OrderToCRM.liquid", "Maps", "Artifacts/Maps/Orders", "3.2 KB", ["wf-7"]],
  ["InvoiceToCanonical.xslt", "Maps", "Artifacts/Maps/Finance", "5.1 KB", ["wf-10"]],
  ["CustomerToCRM.liquid", "Maps", "Artifacts/Maps/Customers", "2.4 KB", ["wf-16"]],
  ["InventoryToStore.xslt", "Maps", "Artifacts/Maps/Inventory", "4.9 KB", ["wf-23"]],
  ["OrderValidator.dll", "Assemblies", "lib/custom/net8", "24 KB", ["wf-2"]],
  ["Commerce.Helpers.dll", "Assemblies", "lib/custom/net8", "18 KB", ["wf-13", "wf-27"]],
  ["PartnerSigning.cer", "Certificates", "References/Certificates", "1.4 KB", ["wf-9"]],
  ["PartnerEncryption.cer", "Certificates", "References/Certificates", "1.5 KB", ["wf-12"]],
  ["OrderPolicy.json", "Rules", "Artifacts/Rules", "2.2 KB", ["wf-2"]],
  ["RefundPolicy.json", "Rules", "Artifacts/Rules", "1.8 KB", ["wf-15"]],
  ["StockThresholds.json", "Rules", "Artifacts/Rules", "0.9 KB", ["wf-26"]],
  ["OrderConfirmation.html", "Templates", "Artifacts/Templates/Email", "7.1 KB", ["wf-5"]],
  ["Welcome.html", "Templates", "Artifacts/Templates/Email", "5.3 KB", ["wf-18"]],
  ["InvoiceEmail.html", "Templates", "Artifacts/Templates/Email", "6.2 KB", ["wf-12"]],
  ["LowStock.html", "Templates", "Artifacts/Templates/Email", "3.8 KB", ["wf-26"]],
];
const placements = {
  Schemas: ["Logic app project", "Deploy to Artifacts/Schemas with the Logic Apps Standard project."],
  Maps: ["Logic app project", "Deploy to Artifacts/Maps. XSLT and Liquid maps are included with the project."],
  Assemblies: ["Custom code package", "Package the assembly under lib/custom/net8 with its runtime dependencies. Validate compatibility with the chosen Logic Apps runtime."],
  Certificates: ["Certificate store", "Reference-only inventory. Provision the public certificate in the configured certificate store and reference its thumbprint through app settings; this path is documentation, not automatic deployment."],
  Rules: ["Application content", "Custom application content, not a native rules-engine artifact. Package with the project and load explicitly from workflow custom code."],
  Templates: ["Application content", "Custom application content. Package with the project and load explicitly before sending the email."],
};
const artifacts = artifactSpecs.map(([name, type, folder, size, usedBy], i) => ({ id: `art-${i + 1}`, name, type, folder, size, usedBy }));
const $ = id => document.getElementById(id);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const connectionById = id => connections.find(c => c.id === id);
const workflowById = id => workflows.find(w => w.id === id);
const systemById = id => systems.find(s => s.id === id);
const usage = id => workflows.filter(w => w.input === id || w.output === id);
const statusBadge = health => `<span class="status ${health.toLowerCase()}">${health}</span>`;
let selectedWorkflows = new Set(workflows.map(w => w.id));
let visibleWorkflows = [];
let artifactType = "";
let selectedFolder = "";
const expandedFolders = new Set(["Artifacts", "Artifacts/Schemas", "Artifacts/Maps", "lib", "lib/custom", "References"]);
let drawerReturnFocus = null;
let drawFrame = 0;

function selectedValues(id) {
  return [...$(id).querySelectorAll('input:checked')].map(input => input.value);
}

function updateMultiSelect(id) {
  const control = $(id);
  const checked = [...control.querySelectorAll('input:checked')];
  const text = checked.length === 1 ? checked[0].dataset.label : checked.length ? `${checked.length} selected` : control.dataset.placeholder;
  control.querySelector(".selection-label").textContent = text;
}

function setMultiSelect(id, values = []) {
  $(id).querySelectorAll("input").forEach(input => { input.checked = values.includes(input.value); });
  updateMultiSelect(id);
}

function initMultiSelect(id, label, placeholder, options) {
  const control = $(id);
  control.dataset.placeholder = placeholder;
  control.innerHTML = `<summary><span class="sr-only">${label}: </span><span class="selection-label"></span><span aria-hidden="true">&#8964;</span></summary><div class="multi-select-menu"><button class="text-button" type="button">Clear selection (show all)</button><fieldset><legend class="sr-only">${label}</legend>${options.map(([value, name]) => `<label><input type="checkbox" value="${escapeHtml(value)}" data-label="${escapeHtml(name)}"><span>${escapeHtml(name)}</span></label>`).join("")}</fieldset><p>Choose multiple. No selection shows all.</p></div>`;
  control.addEventListener("change", () => updateMultiSelect(id));
  control.querySelector("button").addEventListener("click", () => {
    setMultiSelect(id);
    control.dispatchEvent(new Event("change", { bubbles: true }));
  });
  control.querySelector("summary").addEventListener("click", () => {
    document.querySelectorAll(".multi-select[open]").forEach(other => { if (other !== control) other.open = false; });
  });
  updateMultiSelect(id);
}

function renderGraph() {
  const search = $("graph-search").value.trim().toLowerCase();
  const source = selectedValues("source-filter");
  const target = selectedValues("target-filter");
  const connection = selectedValues("connection-filter");
  const matches = workflows.filter(w => selectedWorkflows.has(w.id) && w.name.toLowerCase().includes(search)
    && (!source.length || source.includes(w.source)) && (!target.length || target.includes(w.target))
    && (!connection.length || connection.includes(w.input) || connection.includes(w.output)));
  visibleWorkflows = matches.slice(0, GRAPH_LIMIT);
  $("graph-notice").hidden = matches.length <= GRAPH_LIMIT;
  const omitted = Math.max(0, matches.length - GRAPH_LIMIT);
  $("graph-notice").innerHTML = `<strong>Workflow display limit reached.</strong> ${matches.length} workflows match your filters. Showing the first ${GRAPH_LIMIT} of ${matches.length} in inventory order; ${omitted} workflow${omitted === 1 ? " is" : "s are"} not displayed. Narrow the source, target or connection filters, or select up to ${GRAPH_LIMIT} workflows. Only links between displayed workflows are shown.`;
  $("graph-summary").textContent = `${visibleWorkflows.length} of ${matches.length} matching workflows`;
  $("visible-count").textContent = visibleWorkflows.length;
  $("selected-count").textContent = `(${selectedWorkflows.size})`;
  const renderSystem = (id, side) => {
    const system = systemById(id);
    const count = visibleWorkflows.filter(w => w[side === "source" ? "source" : "target"] === id).length;
    return `<button class="system-node ${side}" data-system="${id}" id="${side}-${id}" aria-label="Explore ${escapeHtml(system.name)}"><span class="node-icon">${system.icon}</span><span><strong>${system.name}</strong><small>${system.kind} &middot; ${count} flow${count === 1 ? "" : "s"}</small></span></button>`;
  };
  $("source-nodes").innerHTML = [...new Set(visibleWorkflows.map(w => w.source))].map(id => renderSystem(id, "source")).join("");
  $("target-nodes").innerHTML = [...new Set(visibleWorkflows.map(w => w.target))].map(id => renderSystem(id, "target")).join("");
  $("workflow-nodes").innerHTML = visibleWorkflows.length ? visibleWorkflows.map(w => {
    const chip = id => `<button class="connection-chip ${connectionById(id).health !== "Healthy" ? "attention" : ""}" data-connection="${id}" title="${id}: ${connectionById(id).health}">${id}</button>`;
    return `<div class="workflow-card" id="${w.id}"><button class="workflow-title" data-workflow="${w.id}"><span aria-hidden="true">&#9671;</span>${w.name}<span class="domain-tag">${w.domain}</span></button><div class="workflow-meta">${chip(w.input)}<span aria-label="to">&#8594;</span>${chip(w.output)}</div></div>`;
  }).join("") : `<div class="empty-state"><strong>No matching workflows</strong>Change your filters or select additional workflows.</div>`;
  scheduleDraw();
}

function scheduleDraw() {
  cancelAnimationFrame(drawFrame);
  drawFrame = requestAnimationFrame(drawGraphEdges);
}

function drawGraphEdges() {
  const canvas = $("graph-canvas");
  const bounds = canvas.getBoundingClientRect();
  const svg = $("graph-lines");
  svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
  const point = (id, side) => {
    const rect = $(id).getBoundingClientRect();
    return { x: (side === "left" ? rect.left : rect.right) - bounds.left, y: rect.top + rect.height / 2 - bounds.top };
  };
  const edge = (from, to, label, attention = false, invocation = false, index = 0) => {
    const a = point(from, "right");
    const b = point(to, invocation ? "right" : "left");
    const color = invocation ? "#a087c8" : attention ? "#c7a86f" : "#b3c2d7";
    const middle = invocation ? Math.max(a.x, b.x) + 18 + index * 6 : (a.x + b.x) / 2;
    return `<path d="M ${a.x} ${a.y} C ${middle} ${a.y}, ${middle} ${b.y}, ${b.x} ${b.y}" fill="none" stroke="${color}" stroke-width="${invocation ? 1.6 : 1.2}" ${invocation ? 'stroke-dasharray="4 4"' : ""} marker-end="url(#${invocation ? "call" : attention ? "warn" : "arrow"})"><title>${escapeHtml(label)}</title></path>`;
  };
  const definitions = [["arrow", "#b3c2d7"], ["warn", "#c7a86f"], ["call", "#a087c8"]].map(([id, color]) => `<marker id="${id}" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6" fill="none" stroke="${color}"/></marker>`).join("");
  const edges = visibleWorkflows.flatMap(w => [
    edge(`source-${w.source}`, w.id, `${systemById(w.source).name} to ${w.name} via ${w.input}`, connectionById(w.input).health !== "Healthy"),
    edge(w.id, `target-${w.target}`, `${w.name} to ${systemById(w.target).name} via ${w.output}`, connectionById(w.output).health !== "Healthy"),
  ]);
  const ids = new Set(visibleWorkflows.map(w => w.id));
  interactions.filter(([a, b]) => ids.has(a) && ids.has(b)).forEach(([a, b], i) => edges.push(edge(a, b, `${workflowById(a).name} invokes ${workflowById(b).name}`, false, true, i)));
  svg.innerHTML = `<defs>${definitions}</defs>${edges.join("")}`;
}

function resetGraph() {
  $("graph-search").value = "";
  ["source-filter", "target-filter", "connection-filter"].forEach(id => { setMultiSelect(id); $(id).open = false; });
  selectedWorkflows = new Set(workflows.map(w => w.id));
  renderWorkflowPicker();
  renderGraph();
}

function renderWorkflowPicker() {
  $("workflow-checkboxes").innerHTML = workflows.map(w => `<label><input type="checkbox" value="${w.id}" ${selectedWorkflows.has(w.id) ? "checked" : ""}>${w.name}</label>`).join("");
}

function renderConnections() {
  const search = $("connections-search").value.trim().toLowerCase();
  const health = selectedValues("health-filter");
  const type = selectedValues("connection-type-filter");
  const items = connections.filter(c => `${c.id} ${c.connector} ${c.endpoint}`.toLowerCase().includes(search)
    && (!health.length || health.includes(c.health))
    && (!type.length || type.includes(c.type)));
  $("connections-count").textContent = `${items.length} of ${connections.length} connections`;
  $("connections-body").innerHTML = items.length ? items.map(c => `<tr><td><button class="table-link" data-connection="${c.id}">${c.id}</button><small>${c.connector}</small></td><td>${statusBadge(c.health)}</td><td><span class="type-tag">${c.type}</span></td><td>${c.auth}</td><td><button class="usage-button" data-connection="${c.id}">${usage(c.id).length} workflows &#8599;</button></td><td>27 Oct, ${c.checked}</td><td><button class="text-button" data-connection="${c.id}" aria-label="Details for ${c.id}">&#8594;</button></td></tr>`).join("") : `<tr><td colspan="7" class="empty-state"><strong>No matching connections</strong>Try another search or health filter.</td></tr>`;
}

function detailGrid(entries) {
  return `<dl class="detail-grid">${entries.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>`;
}

function openDrawer(html) {
  if ($("detail-drawer").hidden) drawerReturnFocus = document.activeElement;
  $("drawer-content").innerHTML = html;
  $("detail-drawer").hidden = false;
  $("drawer-backdrop").hidden = false;
  document.body.classList.add("drawer-open");
  document.querySelector(".app").inert = true;
  document.querySelector(".sidebar").inert = true;
  $("detail-drawer").scrollTop = 0;
  $("close-drawer").focus();
}

function closeDrawer() {
  $("detail-drawer").hidden = true;
  $("drawer-backdrop").hidden = true;
  document.body.classList.remove("drawer-open");
  document.querySelector(".app").inert = false;
  document.querySelector(".sidebar").inert = false;
  if (drawerReturnFocus && drawerReturnFocus.isConnected && drawerReturnFocus.getClientRects().length) drawerReturnFocus.focus();
  else $("view-graph").focus();
}

function workflowList(items) {
  return `<ul class="detail-list">${items.map(w => `<li><button class="table-link" data-workflow="${w.id}">${w.name}</button><small>${w.domain} &middot; ${w.mode}</small></li>`).join("")}</ul>`;
}

function openConnection(id) {
  const c = connectionById(id);
  const usedBy = usage(id);
  openDrawer(`<div class="drawer-eyebrow">CONNECTION DETAILS</div><h2 id="drawer-title">${c.id}</h2><p>${c.connector} &middot; ${c.type} connector</p><div style="margin-top:15px">${statusBadge(c.health)}</div>${detailGrid([["Logic app", "la-commerce-prod"], ["System", systemById(c.system).name], ["Authentication", c.auth], ["Last checked", `27 Oct 2026, ${c.checked} UTC (sample)`]])}<div class="detail-note">${c.note}</div><h3>Basic parameters</h3>${detailGrid(Object.entries(c.parameters))}<p>Parameter values are illustrative. Credentials and secrets are not included.</p><h3>Used by ${usedBy.length} workflows</h3><button class="primary-button" data-graph-connection="${id}">Explore in dependency graph &#8594;</button>${workflowList(usedBy)}`);
}

function openWorkflow(id) {
  const w = workflowById(id);
  const related = interactions.filter(([a, b]) => a === id || b === id);
  const files = artifacts.filter(a => a.usedBy.includes(id));
  openDrawer(`<div class="drawer-eyebrow">WORKFLOW DETAILS</div><h2 id="drawer-title">${w.name}</h2><p>${w.domain} integration workflow</p>${detailGrid([["Logic app", "la-commerce-prod"], ["Execution mode", w.mode], ["Source system", systemById(w.source).name], ["Target system", systemById(w.target).name]])}<h3>Connections</h3><ul class="detail-list">${[w.input, w.output].map((c, i) => `<li><button class="table-link" data-connection="${c}">${c}</button><small>${i ? "Outbound" : "Inbound"} &middot; ${connectionById(c).health}</small></li>`).join("")}</ul><h3>Workflow interactions (${related.length})</h3>${related.length ? `<ul class="detail-list">${related.map(([a, b]) => `<li><small>${a === id ? "Invokes" : "Invoked by"}</small><button class="table-link" data-workflow="${a === id ? b : a}">${workflowById(a === id ? b : a).name}</button></li>`).join("")}</ul>` : "<p>No direct workflow calls in the sample inventory.</p>"}<h3>Referenced artifacts (${files.length})</h3>${files.length ? `<ul class="detail-list">${files.map(a => `<li><button class="table-link" data-artifact="${a.id}">${a.name}</button><small>${a.type}</small></li>`).join("")}</ul>` : "<p>No artifact references in this sample workflow.</p>"}`);
}

function openSystem(id) {
  const system = systemById(id);
  openDrawer(`<div class="drawer-eyebrow">CONNECTED SYSTEM</div><h2 id="drawer-title">${system.name}</h2><p>${system.kind}</p><h3>Connections</h3><ul class="detail-list">${connections.filter(c => c.system === id).map(c => `<li><button class="table-link" data-connection="${c.id}">${c.id}</button><small>${c.connector} &middot; ${c.health}</small></li>`).join("")}</ul><h3>Related workflows</h3>${workflowList(workflows.filter(w => w.source === id || w.target === id))}`);
}

function renderArtifactTypes() {
  $("artifact-types").innerHTML = Object.keys(placements).map(type => `<button class="artifact-type ${artifactType === type ? "active" : ""}" data-artifact-type="${type}" aria-pressed="${artifactType === type}"><span aria-hidden="true">&#9635;</span>${type}<strong>${artifacts.filter(a => a.type === type).length}</strong></button>`).join("");
}

function renderFolders() {
  const folders = new Set();
  artifacts.forEach(a => a.folder.split("/").forEach((_, i, parts) => folders.add(parts.slice(0, i + 1).join("/"))));
  const branch = (parent = "", depth = 0) => [...folders].filter(path => path.includes("/") ? path.slice(0, path.lastIndexOf("/")) === parent : !parent).sort().map(path => {
    const children = [...folders].some(p => p.startsWith(`${path}/`));
    const expanded = expandedFolders.has(path);
    const count = artifacts.filter(a => a.folder === path || a.folder.startsWith(`${path}/`)).length;
    return `<div class="tree-row" style="padding-left:${depth * 12}px">${children ? `<button class="tree-toggle" data-toggle-folder="${path}" aria-expanded="${expanded}" aria-label="${expanded ? "Collapse" : "Expand"} ${path}">${expanded ? "&#8964;" : "&#8250;"}</button>` : '<span style="width:24px"></span>'}<button class="tree-folder ${selectedFolder === path ? "active" : ""}" data-folder="${path}" ${selectedFolder === path ? 'aria-current="true"' : ""}><span class="folder-symbol" aria-hidden="true">&#9649;</span>${path.split("/").pop()} <span style="color:#afb6c2">(${count})</span></button></div>${children && expanded ? branch(path, depth + 1) : ""}`;
  }).join("");
  $("folder-tree").innerHTML = branch();
}

function renderArtifacts() {
  const search = $("artifact-search").value.trim().toLowerCase();
  const items = artifacts.filter(a => (!artifactType || a.type === artifactType)
    && (!selectedFolder || a.folder === selectedFolder || a.folder.startsWith(`${selectedFolder}/`))
    && `${a.name} ${a.folder}`.toLowerCase().includes(search));
  $("artifact-results").textContent = `${items.length} of ${artifacts.length} artifacts`;
  $("artifact-path").textContent = `la-commerce-prod / ${selectedFolder || "All artifacts"}${artifactType ? ` / ${artifactType}` : ""}`;
  $("artifacts-body").innerHTML = items.length ? items.map(a => `<tr><td><button class="table-link" data-artifact="${a.id}"><span class="file-symbol" aria-hidden="true">&#9707;</span>${a.name}</button><small>${a.folder}</small></td><td><span class="type-tag">${a.type}</span></td><td>${a.size}</td><td><button class="usage-button" data-artifact="${a.id}">${a.usedBy.length} workflow${a.usedBy.length === 1 ? "" : "s"}</button></td><td>${placements[a.type][0]}</td></tr>`).join("") : `<tr><td colspan="5" class="empty-state"><strong>No matching artifacts</strong>Change the search, toggle the active type, or select Show all.</td></tr>`;
}

function openArtifact(id) {
  const a = artifacts.find(item => item.id === id);
  openDrawer(`<div class="drawer-eyebrow">ARTIFACT DETAILS</div><h2 id="drawer-title">${a.name}</h2><p>${a.type} &middot; Sample project inventory</p>${detailGrid([["Project path", `${a.folder}/${a.name}`], ["Size", a.size], ["Type", a.type], ["Placement", placements[a.type][0]]])}<div class="detail-note">${placements[a.type][1]}</div><h3>Referenced by ${a.usedBy.length} workflows</h3>${workflowList(a.usedBy.map(workflowById))}<p>This prototype shows metadata and placement only. Artifact content, uploads and deployment are not implemented.</p>`);
}

document.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  const data = button.dataset;
  if (data.connection) openConnection(data.connection);
  else if (data.workflow) openWorkflow(data.workflow);
  else if (data.system) openSystem(data.system);
  else if (data.artifact) openArtifact(data.artifact);
  else if (data.graphConnection) {
    const id = data.graphConnection;
    closeDrawer();
    resetGraph();
    setMultiSelect("connection-filter", [id]);
    renderGraph();
    $("view-graph").scrollIntoView({ block: "start" });
    $("connection-filter").querySelector("summary").focus({ preventScroll: true });
  } else if (data.artifactType) {
    artifactType = artifactType === data.artifactType ? "" : data.artifactType;
    renderArtifactTypes();
    document.querySelector(`[data-artifact-type="${data.artifactType}"]`).focus();
    renderArtifacts();
  } else if (data.toggleFolder) {
    expandedFolders.has(data.toggleFolder) ? expandedFolders.delete(data.toggleFolder) : expandedFolders.add(data.toggleFolder);
    renderFolders();
    document.querySelector(`[data-toggle-folder="${data.toggleFolder}"]`).focus();
  } else if (data.folder) {
    selectedFolder = data.folder;
    renderFolders();
    document.querySelector(`[data-folder="${data.folder}"]`).focus();
    renderArtifacts();
  }
});
$("close-drawer").addEventListener("click", closeDrawer);
$("drawer-backdrop").addEventListener("click", closeDrawer);
document.addEventListener("click", event => {
  document.querySelectorAll(".multi-select[open]").forEach(control => {
    if (!control.contains(event.target)) control.open = false;
  });
});
document.addEventListener("keydown", event => {
  if (!$("detail-drawer").hidden) {
    if (event.key === "Escape") closeDrawer();
    if (event.key === "Tab") {
      const focusable = [...$("detail-drawer").querySelectorAll('button, a[href], input, select, [tabindex="0"]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  } else if (event.key === "Escape" && document.querySelector(".multi-select[open]")) {
    const control = document.querySelector(".multi-select[open]");
    control.open = false;
    control.querySelector("summary").focus();
  } else if (event.key === "Escape" && !$("workflow-options").hidden) {
    $("workflow-options").hidden = true;
    $("workflow-picker").setAttribute("aria-expanded", "false");
    $("workflow-picker").focus();
  }
});
$("workflow-picker").addEventListener("click", () => {
  $("workflow-options").hidden = !$("workflow-options").hidden;
  $("workflow-picker").setAttribute("aria-expanded", String(!$("workflow-options").hidden));
});
$("workflow-checkboxes").addEventListener("change", event => {
  event.target.checked ? selectedWorkflows.add(event.target.value) : selectedWorkflows.delete(event.target.value);
  renderGraph();
});
$("select-all-workflows").addEventListener("click", () => { selectedWorkflows = new Set(workflows.map(w => w.id)); renderWorkflowPicker(); renderGraph(); });
$("clear-workflows").addEventListener("click", () => { selectedWorkflows.clear(); renderWorkflowPicker(); renderGraph(); });
$("reset-graph").addEventListener("click", resetGraph);
$("fit-graph").addEventListener("click", () => {
  const viewport = $("graph-viewport");
  const canvas = $("graph-canvas");
  canvas.style.zoom = "1";
  canvas.style.zoom = String(Math.min(1, viewport.clientWidth / canvas.scrollWidth, 700 / canvas.scrollHeight));
  viewport.scrollTo({ top: 0, left: 0 });
  scheduleDraw();
});
["graph-search", "source-filter", "target-filter", "connection-filter"].forEach(id => $(id).addEventListener(id === "graph-search" ? "input" : "change", renderGraph));
["connections-search", "health-filter", "connection-type-filter"].forEach(id => $(id).addEventListener(id === "connections-search" ? "input" : "change", renderConnections));
$("artifact-search").addEventListener("input", renderArtifacts);
["all-folders", "root-folder"].forEach(id => $(id).addEventListener("click", () => {
  selectedFolder = "";
  artifactType = "";
  $("artifact-search").value = "";
  renderArtifactTypes();
  renderFolders();
  renderArtifacts();
}));
["source-filter", "target-filter"].forEach(id => {
  initMultiSelect(id, id === "source-filter" ? "Source systems" : "Target systems", id === "source-filter" ? "All sources" : "All targets", systems.map(s => [s.id, s.name]));
});
initMultiSelect("connection-filter", "Connections", "All connections", connections.map(c => [c.id, c.id]));
initMultiSelect("health-filter", "Connection health", "All health states", ["Healthy", "Degraded", "Error"].map(value => [value, value]));
initMultiSelect("connection-type-filter", "Connection types", "All connection types", ["Built-in", "Managed"].map(value => [value, value]));
$("workflow-count").textContent = workflows.length;
["artifact-count", "artifact-nav-count"].forEach(id => { $(id).textContent = artifacts.length; });
renderWorkflowPicker();
renderGraph();
renderConnections();
renderArtifactTypes();
renderFolders();
renderArtifacts();
new ResizeObserver(scheduleDraw).observe($("graph-canvas"));
