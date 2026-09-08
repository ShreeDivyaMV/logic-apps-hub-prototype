import { useState } from 'react'
import { artifacts, commonFailures, connections, insights, logicApp, logicAppHealth, recentFailures, runs, systems, traceHops, workflows, type Health, type Tab, type Workflow } from './data'
import './App.css'
import './AppEnhancements.css'

const tabs: Tab[] = ['Operational insights', 'Run analytics', 'AI Insights']
const tabIcons: Record<Tab, string> = { 'Operational insights': '▦', 'Run analytics': '▶', 'AI Insights': '✦' }
type ExecutionMode = 'Runs' | 'Message Trace' | 'Query Editor'
type SavedView = { id: string; name: string; query: string }
type TimeRange = '1h' | '24h' | '7d' | '30d'
type QueryTarget = 'Runs' | 'Common failures' | 'Recent failures' | 'Connections' | 'Artifacts'
const timeRangeFactors: Record<TimeRange, number> = { '1h': .06, '24h': 1, '7d': 6.6, '30d': 27 }
const timeRangeLabels: Record<TimeRange, string> = { '1h': 'last hour', '24h': 'last 24 hours', '7d': 'last 7 days', '30d': 'last 30 days' }

function Status({ value }: { value: Health | string }) {
  return <span className={`status status-${value.toLowerCase().replace(' ', '-')}`}><i />{value}</span>
}

function Panel({ title, subtitle, action, children, className = '' }: { title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><header><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</header>{children}</section>
}

function TableQueryButton({ target, selectedIds, timeRange }: { target: QueryTarget; selectedIds: string[]; timeRange: TimeRange }) {
  const workflowNames = workflows.filter((workflow) => selectedIds.includes(workflow.id)).map((workflow) => `"${workflow.name}"`).join(', ') || '"No workflow selected"'
  const sourceByTarget: Record<QueryTarget, string> = {
    Runs: 'LogicAppWorkflowRuntime',
    'Common failures': 'LogicAppWorkflowRuntime | where Status == "Failed"',
    'Recent failures': 'LogicAppWorkflowRuntime | where Status == "Failed"',
    Connections: 'LogicAppConnectorMetrics',
    Artifacts: 'LogicAppArtifactInventory',
  }
  const defaultQuery = `${sourceByTarget[target]}\n| where LogicAppName == "${logicApp.name}"\n| where WorkflowName in (${workflowNames})\n| where TimeGenerated > ago(${timeRange})\n| take 100`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(defaultQuery)
  const [ran, setRan] = useState(false)
  const openEditor = () => { setQuery(defaultQuery); setRan(false); setOpen(true) }
  return <><button className="text-button table-query-button" onClick={openEditor}>⌕ Query Editor</button>{open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}><section className="table-query-dialog" role="dialog" aria-modal="true" aria-labelledby={`query-${target.replaceAll(' ', '-').toLowerCase()}`}><header><div><span>SCOPED KQL</span><h2 id={`query-${target.replaceAll(' ', '-').toLowerCase()}`}>{target} query</h2><p>{selectedIds.length} workflows · {timeRangeLabels[timeRange]}</p></div><button className="icon-button" title="Close query editor" onClick={() => setOpen(false)}>×</button></header><textarea className="query-editor" value={query} onChange={(event) => setQuery(event.target.value)} spellCheck={false} aria-label={`${target} KQL query`} /><footer><span>{ran ? 'Query completed · fictional preview refreshed' : 'Edit and run this dataset query'}</span><button className="primary-button" onClick={() => setRan(true)}>▶ Run query</button></footer></section></div>}</>
}

function Metric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return <article className="metric"><span className={`metric-mark ${tone}`} /><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article>
}

function WorkflowScope({ selectedIds, onChange, timeRange, onTimeRangeChange }: { selectedIds: string[]; onChange: (ids: string[]) => void; timeRange: TimeRange; onTimeRangeChange: (value: TimeRange) => void }) {
  const allSelected = selectedIds.length === workflows.length
  const toggle = (id: string) => onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id])
  return <section className="context-bar workflow-scope"><div><span>Workflow scope</span><label className="scope-option all"><input type="checkbox" checked={allSelected} onChange={() => onChange(allSelected ? [] : workflows.map((item) => item.id))} /><i />All workflows</label>{workflows.map((workflow) => <label className="scope-option" key={workflow.id}><input type="checkbox" checked={selectedIds.includes(workflow.id)} onChange={() => toggle(workflow.id)} /><i />{workflow.name}</label>)}</div><div className="scope-controls"><p>{selectedIds.length || 'No'} of {workflows.length} workflows</p><label>Time range<select value={timeRange} onChange={(event) => onTimeRangeChange(event.target.value as TimeRange)}><option value="1h">Last hour</option><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></label></div></section>
}

function RunStatusChart({ items, timeRange }: { items: Workflow[]; timeRange: TimeRange }) {
  const maxRuns = Math.max(...items.map((item) => item.runs), 1)
  const factor = timeRangeFactors[timeRange]
  return <div className="workflow-run-chart vertical-chart"><div className="run-legend"><span><i className="succeeded" />Succeeded</span><span><i className="failed" />Failed</span><span><i className="running" />Running</span></div><div className="vertical-plot">{items.length ? items.map((workflow) => {
    const succeeded = workflow.runs - workflow.failures - workflow.running
    const totalHeight = Math.max(48, workflow.runs / maxRuns * 190)
    return <article key={workflow.id}><strong>{Math.round(workflow.runs * factor).toLocaleString()}</strong><div className="stacked-bar vertical" style={{ height: `${totalHeight}px` }} title={`${Math.round(succeeded * factor)} succeeded, ${Math.round(workflow.failures * factor)} failed, ${Math.max(1, Math.round(workflow.running * factor))} running`}><i className="succeeded" style={{ flex: succeeded }} /><i className="failed" style={{ flex: Math.max(workflow.failures, workflow.runs * .025) }} /><i className="running" style={{ flex: Math.max(workflow.running, workflow.runs * .025) }} /></div><div><b>{workflow.name}</b><small>{workflow.successRate}% success</small></div></article>
  }) : <div className="empty-scope">Select one or more workflows to compare run volume.</div>}</div></div>
}

function RunTable({ items }: { items: typeof runs }) {
  const [runIdFilter, setRunIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [correlationFilter, setCorrelationFilter] = useState('')
  const filteredItems = items.filter((run) => {
    const runIdMatches = run.id.toLowerCase().includes(runIdFilter.trim().toLowerCase())
    const statusMatches = statusFilter === 'All statuses' || run.status === statusFilter
    const correlationMatches = run.correlationId.toLowerCase().includes(correlationFilter.trim().toLowerCase())
    return runIdMatches && statusMatches && correlationMatches
  })
  const hasFilters = Boolean(runIdFilter || correlationFilter || statusFilter !== 'All statuses')
  const clearFilters = () => { setRunIdFilter(''); setStatusFilter('All statuses'); setCorrelationFilter('') }
  return <div className="run-table"><section className="run-filters" aria-label="Run filters"><label>Run ID<input value={runIdFilter} onChange={(event) => setRunIdFilter(event.target.value)} placeholder="Filter run ID" /></label><label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option><option>Succeeded</option><option>Failed</option><option>Running</option></select></label><label>Correlation ID<input value={correlationFilter} onChange={(event) => setCorrelationFilter(event.target.value)} placeholder="Filter correlation ID" /></label><div><span>{filteredItems.length} of {items.length} runs</span><button className="text-button" disabled={!hasFilters} onClick={clearFilters}>Clear filters</button></div></section><div className="table-scroll"><table><thead><tr><th>Run ID</th><th>Workflow</th><th>Status</th><th>Started</th><th>Duration</th><th>Correlation ID</th></tr></thead><tbody>{filteredItems.map((run) => <tr key={run.id}><td className="mono">{run.id}</td><td><strong>{workflows.find((item) => item.id === run.workflowId)?.name}</strong></td><td><Status value={run.status} /></td><td>{run.started}</td><td>{run.duration}</td><td className="mono">{run.correlationId}</td></tr>)}</tbody></table>{!filteredItems.length && <div className="empty-scope">No runs match the current filters.</div>}</div></div>
}

function SystemList({ items, side, selectedIds }: { items: typeof systems; side: 'source' | 'target'; selectedIds: string[] }) {
  return <div className="system-stack">{items.map((system) => {
    const owners = workflows.filter((workflow) => selectedIds.includes(workflow.id) && system.workflowIds.includes(workflow.id))
    const linked = connections.filter((connection) => system.connectionIds.includes(connection.id) && connection.workflowIds.some((id) => selectedIds.includes(id)))
    return <article className={`system-node ${side}`} key={system.id}><span>{system.type === 'Azure' ? 'AZ' : 'EX'}</span><div><strong>{system.name}</strong><small>{system.type} system</small><em>{linked.map((item) => item.name).join(', ')}</em><b>{owners.map((item) => item.name).join(' · ')}</b></div></article>
  })}</div>
}

function DependencyGraph({ selected }: { selected: Workflow[] }) {
  const selectedIds = selected.map((item) => item.id)
  const linkedSystems = systems.filter((item) => item.workflowIds.some((id) => selectedIds.includes(id)))
  const sources = linkedSystems.filter((item) => item.direction === 'Source')
  const targets = linkedSystems.filter((item) => item.direction === 'Target')
  const linkedConnections = connections.filter((item) => item.workflowIds.some((id) => selectedIds.includes(id)))
  return <Panel title="Dependency graph" subtitle={`Runtime topology and operational details for ${selected.length} selected workflow${selected.length === 1 ? '' : 's'}`} className="graph-panel"><div className="graph-head"><span>SOURCE SYSTEMS</span><strong>LOGIC APP &amp; WORKFLOWS</strong><span>TARGET SYSTEMS</span></div><div className="dependency-map"><SystemList items={sources} side="source" selectedIds={selectedIds} /><div className="logic-app-node"><header><span>LA</span><div><small>LOGIC APP</small><strong>{logicApp.name}</strong></div></header><div className="graph-workflows">{selected.map((workflow) => <article key={workflow.id}><span>WF</span><div className="graph-workflow-main"><div><strong>{workflow.name}</strong><small>{workflow.description}</small></div><Status value={workflow.health} /><dl><div><dt>Trigger</dt><dd>{workflow.trigger}</dd></div><div><dt>Runs</dt><dd>{workflow.runs.toLocaleString()}</dd></div><div><dt>Success</dt><dd>{workflow.successRate}%</dd></div><div><dt>Avg duration</dt><dd>{workflow.avgDuration}</dd></div><div><dt>Failures</dt><dd>{workflow.failures}</dd></div><div><dt>Last run</dt><dd>{workflow.lastRun}</dd></div></dl></div></article>)}</div><div className="connection-strip">{linkedConnections.map((item) => <span key={item.id}><i className={item.health.toLowerCase()} />{item.name}</span>)}</div></div><SystemList items={targets} side="target" selectedIds={selectedIds} /></div></Panel>
}

function ResourceHealth() {
  return <Panel title="Logic App health" subtitle={`Platform metrics from Application Insights · checked ${logicAppHealth.checkedAt}`} action={<Status value={logicAppHealth.status} />}><div className="resource-health"><article><span>♥</span><div><small>AVAILABILITY</small><strong>{logicAppHealth.availability}%</strong><p>{logicAppHealth.workers} healthy workers</p></div></article><article><span>CPU</span><div><small>CPU USAGE</small><strong>{logicAppHealth.cpuPercent}%</strong><div className="usage-track"><i style={{ width: `${logicAppHealth.cpuPercent}%` }} /></div><p>Peak {logicAppHealth.cpuPeakPercent}% in 24 hours</p></div></article><article><span>MEM</span><div><small>MEMORY USAGE</small><strong>{logicAppHealth.memoryPercent}%</strong><div className="usage-track memory"><i style={{ width: `${logicAppHealth.memoryPercent}%` }} /></div><p>{logicAppHealth.memoryUsed} of {logicAppHealth.memoryTotal}</p></div></article></div></Panel>
}

function FailureIntelligence({ selectedIds, onNavigate, timeRange }: { selectedIds: string[]; onNavigate: (tab: Tab, mode?: ExecutionMode) => void; timeRange: TimeRange }) {
  const common = commonFailures.filter((failure) => failure.workflows.some((id) => selectedIds.includes(id)))
  const recent = recentFailures.filter((failure) => selectedIds.includes(failure.workflowId))
  return <section className="failure-grid"><Panel title="Common failures" subtitle="Recurring failure patterns and recommended actions" action={<TableQueryButton target="Common failures" selectedIds={selectedIds} timeRange={timeRange} />}><div className="common-failures">{common.map((failure) => <article key={failure.id}><span>{failure.count}</span><div><h3>{failure.title}</h3><p>{failure.cause}</p><aside><strong>Recommendation</strong>{failure.recommendation}</aside><small>{failure.workflows.filter((id) => selectedIds.includes(id)).map((id) => workflows.find((workflow) => workflow.id === id)?.name).join(' · ')}</small></div></article>)}</div></Panel><Panel title="Recent failures" subtitle="Latest failed operations in the selected scope" action={<div className="panel-actions"><TableQueryButton target="Recent failures" selectedIds={selectedIds} timeRange={timeRange} /><button className="text-button" onClick={() => onNavigate('Run analytics', 'Message Trace')}>Open traces →</button></div>}><div className="recent-failures">{recent.map((failure) => <article key={failure.id}><header><div><strong>{workflows.find((workflow) => workflow.id === failure.workflowId)?.name}</strong><small>{failure.id} · {failure.occurred}</small></div><span>{failure.code}</span></header><h3>{failure.operation}</h3><p>{failure.message}</p><aside><strong>Recommended action</strong>{failure.recommendation}</aside></article>)}</div></Panel></section>
}

function AppInsightsDialog({ resource, onSave, onClose }: { resource: string; onSave: (resource: string) => void; onClose: () => void }) {
  const [selection, setSelection] = useState(resource)
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="config-dialog" role="dialog" aria-modal="true" aria-labelledby="config-title"><header><div><span>APPLICATION INSIGHTS</span><h2 id="config-title">Configure telemetry source</h2><p>Choose the resource used for Overview metrics and diagnostics.</p></div><button className="icon-button" title="Close configuration" onClick={onClose}>×</button></header><div className="config-dialog-body"><label className="field">Subscription<select defaultValue="Contoso Commerce"><option>Contoso Commerce</option><option>Contoso Shared Services</option></select></label><label className="field">Application Insights resource<select value={selection} onChange={(event) => setSelection(event.target.value)}><option>appi-commerce-prod</option><option>appi-commerce-stage</option><option>appi-integration-shared</option></select></label><div className="resource-preview"><span>AI</span><div><strong>{selection}</strong><small>East US 2 · Connected · Log Analytics workspace</small></div><Status value="Healthy" /></div></div><footer><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={() => onSave(selection)}>Use resource</button></footer></section></div>
}

function ConnectionsDirectory({ selectedIds, timeRange }: { selectedIds: string[]; timeRange: TimeRange }) {
  const items = connections.filter((item) => item.workflowIds.some((id) => selectedIds.includes(id)))
  return <Panel title="Connections health" subtitle="Connector health and workflow references" action={<TableQueryButton target="Connections" selectedIds={selectedIds} timeRange={timeRange} />}><div className="connection-directory">{items.map((item) => <article key={item.id}><div className="connector-symbol">↗</div><div><strong>{item.name}</strong><small>{item.connector}</small></div><Status value={item.health} /><div className="reference-list"><small>USED BY</small>{item.workflowIds.filter((id) => selectedIds.includes(id)).map((id) => <span key={id}>{workflows.find((workflow) => workflow.id === id)?.name}</span>)}</div></article>)}</div></Panel>
}

function ArtifactsDirectory({ selectedIds, timeRange }: { selectedIds: string[]; timeRange: TimeRange }) {
  const items = artifacts.filter((item) => item.workflowIds.some((id) => selectedIds.includes(id)))
  return <Panel title="Artifacts directory" subtitle="Schemas, maps, and assemblies with workflow references" action={<TableQueryButton target="Artifacts" selectedIds={selectedIds} timeRange={timeRange} />}><div className="artifact-directory">{items.map((item) => <article key={item.id}><b>{item.type.slice(0, 2).toUpperCase()}</b><div><strong>{item.name}</strong><small>{item.type} · v{item.version}</small></div><Status value={item.status} /><div className="reference-list"><small>REFERENCED BY</small>{item.workflowIds.filter((id) => selectedIds.includes(id)).map((id) => <span key={id}>{workflows.find((workflow) => workflow.id === id)?.name}</span>)}</div></article>)}</div></Panel>
}

function Overview({ selected, onNavigate, timeRange }: { selected: Workflow[]; onNavigate: (tab: Tab, mode?: ExecutionMode) => void; timeRange: TimeRange }) {
  const selectedIds = selected.map((item) => item.id)
  const factor = timeRangeFactors[timeRange]
  const totalRuns = Math.round(selected.reduce((sum, item) => sum + item.runs, 0) * factor)
  const failures = Math.round(selected.reduce((sum, item) => sum + item.failures, 0) * factor)
  const running = Math.max(selected.length ? 1 : 0, Math.round(selected.reduce((sum, item) => sum + item.running, 0) * factor))
  const success = totalRuns ? (totalRuns - failures - running) / totalRuns * 100 : 0
  const scopedConnections = connections.filter((item) => item.workflowIds.some((id) => selectedIds.includes(id)))
  const scopedArtifacts = artifacts.filter((item) => item.workflowIds.some((id) => selectedIds.includes(id)))
  return <div className="view-stack">
    <section className="metric-grid"><Metric label={`Runs · ${timeRangeLabels[timeRange]}`} value={totalRuns.toLocaleString()} detail={`${failures} failed · ${running} still running`} tone="blue" /><Metric label="Execution success" value={`${success.toFixed(1)}%`} detail={`Across ${selected.length} selected workflows`} tone="green" /><Metric label="Connections" value={String(scopedConnections.length)} detail={`${scopedConnections.filter((item) => item.health === 'Connected').length} connected`} tone="teal" /><Metric label="Artifacts" value={String(scopedArtifacts.length)} detail="Referenced by selected workflows" tone="rose" /></section>
    <ResourceHealth />
    <FailureIntelligence selectedIds={selectedIds} onNavigate={onNavigate} timeRange={timeRange} />
    <Panel title="Runs by workflow" subtitle={`Execution status for the ${timeRangeLabels[timeRange]}`} action={<button className="text-button" onClick={() => onNavigate('Run analytics', 'Runs')}>Open run analytics →</button>}><RunStatusChart items={selected} timeRange={timeRange} /></Panel>
    <section className="overview-grid"><ConnectionsDirectory selectedIds={selectedIds} timeRange={timeRange} /><ArtifactsDirectory selectedIds={selectedIds} timeRange={timeRange} /></section>
    <DependencyGraph selected={selected} />
    <section className="overview-links"><button onClick={() => onNavigate('Run analytics', 'Message Trace')}><span>↝</span><div><strong>Explore message traces</strong><small>Follow correlation IDs across selected workflows</small></div><b>→</b></button><button onClick={() => onNavigate('AI Insights')}><span>✦</span><div><strong>Open AI insights</strong><small>Review evidence-based operational findings</small></div><b>→</b></button></section>
  </div>
}

function MessageTrace({ selected }: { selected: Workflow[] }) {
  const availableRuns = runs.filter((run) => selected.some((workflow) => workflow.id === run.workflowId))
  const [selectedRunId, setSelectedRunId] = useState(availableRuns[0]?.id ?? '')
  const selectedRun = availableRuns.find((run) => run.id === selectedRunId) ?? availableRuns[0]
  if (!selectedRun) return <div className="empty-scope panel">Select at least one workflow to inspect message traces.</div>
  const workflow = workflows.find((item) => item.id === selectedRun.workflowId) ?? selected[0]
  const hops = traceHops.map((hop, index) => ({ ...hop, name: index === 2 ? workflow.name : hop.name, status: selectedRun.status === 'Failed' && index === 3 ? 'Failed' : hop.status, diagnostic: selectedRun.status === 'Failed' && index === 3 ? 'Connector returned HTTP 429 after retry policy was exhausted.' : hop.diagnostic }))
  return <div className="view-stack"><section className="trace-toolbar"><label>Run to inspect<select value={selectedRun.id} onChange={(event) => setSelectedRunId(event.target.value)}>{availableRuns.map((run) => <option key={run.id} value={run.id}>{run.id} · {workflows.find((item) => item.id === run.workflowId)?.name} · {run.status}</option>)}</select></label><button className="secondary-button">Export trace</button></section><section className="trace-summary"><div><small>CORRELATION ID</small><strong className="mono">{selectedRun.correlationId}-22f1</strong></div><div><small>RUN ID</small><strong className="mono">{selectedRun.id}</strong></div><div><small>WORKFLOW</small><strong>{workflow.name}</strong></div><div><small>STATUS</small><Status value={selectedRun.status} /></div><div><small>STARTED</small><strong>{selectedRun.started}</strong></div><div><small>ELAPSED</small><strong>{selectedRun.duration}</strong></div></section><Panel title="End-to-end message trace" subtitle={`${hops.length} correlated operations from source to target`}><div className="trace-details">{hops.map((hop, index) => <article key={hop.operationId}><div className="trace-rail"><span className={`hop-mark ${hop.status.toLowerCase()}`}>{index + 1}</span>{index < hops.length - 1 && <i />}</div><div className="trace-operation"><header><div><span>{hop.kind}</span><h3>{hop.name}</h3><p>{hop.detail}</p></div><Status value={hop.status} /></header><dl><div><dt>Timestamp</dt><dd className="mono">{hop.timestamp}</dd></div><div><dt>Duration</dt><dd>{hop.duration}</dd></div><div><dt>Operation ID</dt><dd className="mono">{hop.operationId}</dd></div><div><dt>Protocol</dt><dd>{hop.protocol}</dd></div><div><dt>Retries</dt><dd>{hop.retries}</dd></div><div><dt>Payload</dt><dd>{hop.payload}</dd></div></dl><aside><strong>Diagnostic</strong><span>{hop.diagnostic}</span></aside></div></article>)}</div></Panel></div>
}

function Queries({ selected, timeRange }: { selected: Workflow[]; timeRange: TimeRange }) {
  const [ran, setRan] = useState(false)
  const [viewName, setViewName] = useState('')
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
    try { return JSON.parse(localStorage.getItem('logic-app-custom-views') ?? '[]') as SavedView[] } catch { return [] }
  })
  const names = selected.map((item) => `"${item.name}"`).join(', ')
  const defaultQuery = `LogicAppWorkflowRuntime\n| where LogicAppName == "${logicApp.name}"\n| where WorkflowName in (${names || '"No workflow selected"'})\n| where TimeGenerated > ago(${timeRange})\n| summarize Runs=count(), Failures=countif(Status == "Failed") by WorkflowName`
  const [query, setQuery] = useState(defaultQuery)
  const saveView = () => {
    const name = viewName.trim()
    if (!name) return
    const next = [...savedViews, { id: String(Date.now()), name, query }]
    setSavedViews(next)
    localStorage.setItem('logic-app-custom-views', JSON.stringify(next))
    setViewName('')
  }
  const removeView = (id: string) => {
    const next = savedViews.filter((view) => view.id !== id)
    setSavedViews(next)
    localStorage.setItem('logic-app-custom-views', JSON.stringify(next))
  }
  return <div className="query-workspace"><div className="query-layout"><Panel title="Query Editor" subtitle="Explore selected workflow telemetry"><div className="query-toolbar"><span className="mono">KQL</span><button className="primary-button" onClick={() => setRan(true)}>▶ Run query</button></div><textarea className="query-editor" value={query} onChange={(event) => setQuery(event.target.value)} spellCheck={false} aria-label="KQL query" /><div className="save-view-bar"><label>Custom view name<input value={viewName} onChange={(event) => setViewName(event.target.value)} placeholder="e.g. Daily failure watch" /></label><button className="secondary-button" disabled={!viewName.trim()} onClick={saveView}>＋ Save as custom view</button></div></Panel><Panel title="Results" subtitle={ran ? 'Query completed in 0.4s' : 'Run the query to refresh results'}><div className="query-result-list">{selected.map((workflow) => <article key={workflow.id}><strong>{workflow.name}</strong><span>{ran ? workflow.runs.toLocaleString() : '—'} runs</span><span>{ran ? workflow.failures : '—'} failures</span></article>)}</div></Panel></div><Panel title="Custom views" subtitle="Saved query definitions available from this browser"><div className="saved-view-list">{savedViews.map((view) => <article key={view.id}><span>QV</span><div><strong>{view.name}</strong><small>{view.query.split('\n')[0]}</small></div><button className="text-button" onClick={() => setQuery(view.query)}>Open</button><button className="icon-button" title={`Delete ${view.name}`} onClick={() => removeView(view.id)}>×</button></article>)}{!savedViews.length && <div className="empty-scope">No custom views saved yet.</div>}</div></Panel></div>
}

function Execution({ selected, mode, onModeChange, timeRange }: { selected: Workflow[]; mode: ExecutionMode; onModeChange: (mode: ExecutionMode) => void; timeRange: TimeRange }) {
  const ids = selected.map((item) => item.id)
  const filteredRuns = runs.filter((run) => ids.includes(run.workflowId))
  return <div className="view-stack"><nav className="mode-tabs" aria-label="Execution tools">{(['Runs', 'Message Trace', 'Query Editor'] as ExecutionMode[]).map((item) => <button className={mode === item ? 'active' : ''} key={item} onClick={() => onModeChange(item)}>{item}</button>)}</nav>{mode === 'Runs' && <Panel title="Workflow runs" subtitle={`Execution history for ${selected.length} selected workflow${selected.length === 1 ? '' : 's'}`} action={<TableQueryButton target="Runs" selectedIds={ids} timeRange={timeRange} />}><RunTable items={filteredRuns} /></Panel>}{mode === 'Message Trace' && <MessageTrace selected={selected} />}{mode === 'Query Editor' && <Queries selected={selected} timeRange={timeRange} />}</div>
}

function AIInsights({ selected }: { selected: Workflow[] }) {
  const items = insights.filter((item) => selected.some((workflow) => workflow.id === item.workflowId))
  return <div className="view-stack"><section className="ai-header"><div className="ai-mark">✦</div><div><span>AI OPERATIONS ANALYST</span><h2>Selected workflow briefing</h2><p>Evidence-based findings from fictional telemetry.</p></div><select aria-label="AI model"><option>GPT-5 mini</option><option>Claude Sonnet 4</option></select></section><div className="insight-grid">{items.map((item, index) => <article className={index === 0 ? 'insight-primary' : ''} key={item.workflowId}><span>{item.severity}</span><h2>{item.title}</h2><p>{item.body}</p><strong>{item.evidence}</strong></article>)}</div></div>
}

function ResourceEssentials() {
  const fields = [
    { label: 'Resource group', value: logicApp.resourceGroup, linked: true },
    { label: 'Status', value: logicApp.state },
    { label: 'Location', value: logicApp.region, linked: true },
    { label: 'Subscription', value: logicApp.subscription, linked: true },
    { label: 'Subscription ID', value: logicApp.subscriptionId, mono: true },
    { label: 'Tags', value: logicApp.tags, linked: true },
    { label: 'Default domain', value: logicApp.runtimeUrl, linked: true, mono: true },
    { label: 'Health Check', value: logicApp.healthCheck, linked: true },
    { label: 'Operating System', value: logicApp.operatingSystem },
    { label: 'App Service Plan', value: logicApp.appServicePlan, linked: true },
    { label: 'Runtime version', value: logicApp.runtimeVersion, mono: true },
    { label: 'MCP Server', value: logicApp.mcpServer },
  ]
  return <section className="resource-essentials"><header><h1>Essentials</h1></header><dl>{fields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd className={`${field.linked ? 'resource-link' : ''} ${field.mono ? 'mono' : ''}`}>{field.value}</dd></div>)}</dl></section>
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Operational insights')
  const [selectedIds, setSelectedIds] = useState(workflows.map((item) => item.id))
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('Runs')
  const [updated, setUpdated] = useState('Just now')
  const [appInsightsResource, setAppInsightsResource] = useState('appi-commerce-prod')
  const [configurationOpen, setConfigurationOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const selected = workflows.filter((item) => selectedIds.includes(item.id))
  const navigate = (tab: Tab, mode?: ExecutionMode) => { if (mode) setExecutionMode(mode); setActiveTab(tab) }
  const scopeLabel = selected.length === workflows.length ? 'All workflows' : `${selected.length} selected`
  const saveAppInsightsResource = (resource: string) => { setAppInsightsResource(resource); setConfigurationOpen(false); setUpdated('Just now') }

  return <div className="app-shell"><header className="global-header"><div className="brand"><span className="brand-mark"><i /><i /><i /></span><div><strong>Logic Apps Hub</strong><small>Single app operations</small></div></div><div className="header-actions"><span>Updated {updated}</span><button className="icon-button" onClick={() => setUpdated('Just now')} title="Refresh">↻</button><button className="avatar" title="User profile">AS</button></div></header><main><ResourceEssentials /><div className="tabs-toolbar"><nav className="horizontal-tabs" aria-label="Logic App views">{tabs.map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}><span>{tabIcons[tab]}</span>{tab}</button>)}</nav><button className="secondary-button configure-button" onClick={() => setConfigurationOpen(true)}>⚙ Configure</button></div><WorkflowScope selectedIds={selectedIds} onChange={setSelectedIds} timeRange={timeRange} onTimeRangeChange={setTimeRange} /><div className="content"><header className={`view-heading ${activeTab === 'Operational insights' ? 'overview-toolbar' : ''}`}>{activeTab !== 'Operational insights' && <div><span>{activeTab.toUpperCase()}</span><h2>{activeTab}</h2></div>}<div className="view-heading-actions"><span className="scope-chip">⌁ {scopeLabel} · {timeRange}</span><button className="secondary-button query-link" onClick={() => navigate('Run analytics', 'Query Editor')}>⌕ Query Editor</button></div></header>{activeTab === 'Operational insights' && <Overview selected={selected} onNavigate={navigate} timeRange={timeRange} />}{activeTab === 'Run analytics' && <Execution selected={selected} mode={executionMode} onModeChange={setExecutionMode} timeRange={timeRange} />}{activeTab === 'AI Insights' && <AIInsights selected={selected} />}</div></main>{configurationOpen && <AppInsightsDialog resource={appInsightsResource} onSave={saveAppInsightsResource} onClose={() => setConfigurationOpen(false)} />}</div>
}

export default App
