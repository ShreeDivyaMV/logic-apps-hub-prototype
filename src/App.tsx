import { useMemo, useState } from 'react'
import AIInsights from './components/AIInsights'
import BusinessFlows from './components/BusinessFlows'
import Configuration from './components/Configuration'
import IntegrationEstate from './components/IntegrationEstate'
import QueryEditor, { type QueryDraft } from './components/QueryEditor'
import RunDetails from './components/RunDetails'
import { initialBusinessFlows } from './data/businessFlows'
import { integrationArtifacts } from './data/integrationEstate'
import { alerts, runs, runVolume, workflows } from './data/mockData'
import type { Health, Workflow } from './types/hub'
import './App.css'

type View = 'Overview' | 'Integration Estate' | 'Business Flows' | 'Logic Apps' | 'Run Details' | 'Alerts' | 'Compare' | 'Custom Query' | 'AI Insights' | 'Configuration'
type IconName = 'grid' | 'estate' | 'business' | 'flow' | 'runs' | 'alert' | 'compare' | 'query' | 'ai' | 'settings' | 'search' | 'refresh' | 'chevron' | 'close' | 'menu' | 'spark' | 'clock' | 'check'

const iconPaths: Record<IconName, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  estate: <><path d="M4 20h16M6 20V9l6-4 6 4v11"/><path d="M9 12h2v2H9zM13 12h2v2h-2zM9 17h6"/></>,
  business: <><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M7.5 12h3a4 4 0 0 0 4-4 2 2 0 0 1 2-2M7.5 12h3a4 4 0 0 1 4 4 2 2 0 0 0 2 2"/></>,
  flow: <><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 6h4a5 5 0 0 1 5 5v4M15 18h-4a5 5 0 0 1-5-5V9"/></>,
  runs: <><path d="M4 6h16M4 12h10M4 18h7"/><path d="m17 15 4 3-4 3z"/></>,
  alert: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  compare: <><path d="M7 20V10M12 20V4M17 20v-7"/><path d="M3 20h18"/></>,
  query: <><path d="M5 5h14M5 10h9M5 15h6"/><path d="m15 14 3 3-3 3"/></>,
  ai: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z"/><path d="m18 14 .8 2.2 2.2.8-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  close: <path d="M18 6 6 18M6 6l12 12"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  spark: <path d="m3 17 5-5 4 3 8-9M16 6h4v4"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg className="line-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
}

function StatusBadge({ value }: { value: Health | 'Succeeded' | 'Failed' | 'Running' | 'Cancelled' }) {
  return <span className={`status-badge status-${value.toLowerCase()}`}><span className="status-dot" />{value}</span>
}

function Sparkline({ values, health }: { values: number[]; health: Health }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 110},${32 - (value / 100) * 28}`).join(' ')
  return <svg className={`sparkline spark-${health.toLowerCase()}`} viewBox="0 0 110 36" role="img" aria-label="12-hour success-rate trend"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function EmptyState() {
  return <div className="empty-state"><div className="empty-icon"><Icon name="search" size={22} /></div><h3>No workflows found</h3><p>Try changing or clearing your current filters.</p></div>
}

function App() {
  const [activeView, setActiveView] = useState<View>('Overview')
  const [search, setSearch] = useState('')
  const [subscription, setSubscription] = useState('All subscriptions')
  const [health, setHealth] = useState('All statuses')
  const [region, setRegion] = useState('All regions')
  const [selected, setSelected] = useState<Workflow | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [updated, setUpdated] = useState('Just now')
  const [businessFlowCount, setBusinessFlowCount] = useState(3)
  const [overviewBusinessFlow, setOverviewBusinessFlow] = useState('All business flows')
  const [queryDraft, setQueryDraft] = useState<QueryDraft>({ name: 'Integration estate overview', sourceView: 'Overview', query: 'LogicAppWorkflowRuntime\n| where TimeGenerated > ago(24h)\n| summarize Runs=count(), SuccessRate=100.0 * countif(Status == "Succeeded") / count() by LogicAppName\n| order by Runs desc' })

  const filtered = useMemo(() => workflows.filter((workflow) => {
    const query = search.toLowerCase()
    const selectedFlow = initialBusinessFlows.find((flow) => flow.name === overviewBusinessFlow)
    return (!query || `${workflow.name} ${workflow.logicAppName} ${workflow.subscription} ${workflow.resourceGroup}`.toLowerCase().includes(query))
      && (subscription === 'All subscriptions' || workflow.subscription === subscription)
      && (health === 'All statuses' || workflow.health === health)
      && (region === 'All regions' || workflow.region === region)
      && (!selectedFlow || selectedFlow.workflowIds.includes(workflow.id))
  }), [search, subscription, health, region, overviewBusinessFlow])

  const resetFilters = () => { setSearch(''); setSubscription('All subscriptions'); setHealth('All statuses'); setRegion('All regions'); setOverviewBusinessFlow('All business flows') }
  const visibleRuns = filtered.length === workflows.length ? runs : runs.filter((run) => filtered.some((workflow) => workflow.id === run.workflowId))
  const visibleAlerts = alerts.filter((alert) => filtered.some((workflow) => workflow.name === alert.workflowName))
  const visibleBusinessFlows = overviewBusinessFlow === 'All business flows'
    ? initialBusinessFlows
    : initialBusinessFlows.filter((flow) => flow.name === overviewBusinessFlow)
  const overviewRuns = filtered.reduce((total, workflow) => total + workflow.runs24h, 0)
  const overviewFailures = filtered.reduce((total, workflow) => total + workflow.failed24h, 0)
  const overviewSuccess = overviewRuns ? ((overviewRuns - overviewFailures) / overviewRuns) * 100 : 0
  const durationInSeconds = (value: string) => value.endsWith('ms') ? Number.parseFloat(value) / 1000 : value.endsWith('s') ? Number.parseFloat(value) : 0
  const overviewDuration = filtered.length ? filtered.reduce((total, workflow) => total + durationInSeconds(workflow.avgDuration), 0) / filtered.length : 0
  const overviewHealth = {
    Healthy: filtered.filter((workflow) => workflow.health === 'Healthy').length,
    Warning: filtered.filter((workflow) => workflow.health === 'Warning').length,
    Critical: filtered.filter((workflow) => workflow.health === 'Critical').length,
    Disabled: filtered.filter((workflow) => workflow.health === 'Disabled').length,
  }
  const runVolumeScale = overviewRuns / Math.max(1, workflows.reduce((total, workflow) => total + workflow.runs24h, 0))
  const navItems: { label: View; icon: IconName; count?: number }[] = [
    { label: 'Overview', icon: 'grid' }, { label: 'Integration Estate', icon: 'estate' }, { label: 'Business Flows', icon: 'business', count: businessFlowCount }, { label: 'Logic Apps', icon: 'flow', count: new Set(workflows.map((workflow) => workflow.logicAppName)).size },
    { label: 'Run Details', icon: 'runs' }, { label: 'Alerts', icon: 'alert', count: 2 }, { label: 'Compare', icon: 'compare' }, { label: 'Custom Query', icon: 'query' }, { label: 'AI Insights', icon: 'ai' }, { label: 'Configuration', icon: 'settings' },
  ]

  const openWithQueryEditor = () => {
    const drafts: Record<View, QueryDraft> = {
      Overview: { name: 'Integration estate overview', sourceView: 'Overview', query: 'LogicAppWorkflowRuntime\n| where TimeGenerated > ago(24h)\n| summarize Runs=count(), SuccessRate=100.0 * countif(Status == "Succeeded") / count() by LogicAppName\n| order by Runs desc' },
      'Integration Estate': { name: 'Integration Estate inventory', sourceView: 'Integration Estate', query: 'LogicAppInventory\n| join kind=leftouter WorkflowArtifacts on LogicAppName, WorkflowName\n| summarize Workflows=dcount(WorkflowName), Connections=dcount(ConnectionName), Systems=dcount(SystemName), Artifacts=dcount(ArtifactName) by LogicAppName, Subscription, ResourceGroup\n| order by LogicAppName asc' },
      'Business Flows': { name: 'Business Flow health', sourceView: 'Business Flows', query: 'LogicAppWorkflowRuntime\n| where TimeGenerated > ago(24h)\n| extend BusinessFlow=tostring(customDimensions.BusinessFlow)\n| summarize Runs=count(), Failures=countif(Status == "Failed") by BusinessFlow, LogicAppName, WorkflowName' },
      'Logic Apps': { name: 'Logic App workflow inventory', sourceView: 'Logic Apps', query: 'LogicAppWorkflowRuntime\n| where TimeGenerated > ago(24h)\n| summarize LastRun=max(TimeGenerated), Runs=count() by LogicAppName, WorkflowName, ResourceGroup\n| order by LogicAppName asc' },
      'Run Details': { name: 'Detailed workflow runs', sourceView: 'Run Details', query: 'LogicAppWorkflowRuntime\n| where TimeGenerated > ago(24h)\n| project TimeGenerated, LogicAppName, WorkflowName, Status, DurationMs, CorrelationId\n| order by TimeGenerated desc' },
      Alerts: { name: 'Active failures and alerts', sourceView: 'Alerts', query: 'LogicAppActionRuntime\n| where TimeGenerated > ago(24h)\n| where Status == "Failed"\n| summarize Failures=count() by LogicAppName, WorkflowName, ActionName, ConnectorName\n| order by Failures desc' },
      Compare: { name: 'Workflow comparison', sourceView: 'Compare', query: 'LogicAppWorkflowRuntime\n| where TimeGenerated > ago(24h)\n| summarize Runs=count(), P95Latency=percentile(DurationMs, 95) by LogicAppName, WorkflowName\n| order by P95Latency desc' },
      Configuration: { name: 'Configuration audit', sourceView: 'Configuration', query: 'LogicAppsHubConfigurationAudit\n| where TimeGenerated > ago(30d)\n| project TimeGenerated, ConfigurationArea, ChangedBy, Result\n| order by TimeGenerated desc' },
      'AI Insights': { name: 'AI insight evidence', sourceView: 'AI Insights', query: 'LogicAppWorkflowRuntime\n| where TimeGenerated > ago(7d)\n| summarize Failures=countif(Status == "Failed"), P95Latency=percentile(DurationMs, 95) by bin(TimeGenerated, 1h), LogicAppName\n| order by TimeGenerated asc' },
      'Custom Query': queryDraft,
    }
    setQueryDraft(drafts[activeView]); setActiveView('Custom Query')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><span /><span /><span /></div><div><strong>Logic Apps Hub</strong><small>Unified operations</small></div></div>
        <nav aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map((item) => <button key={item.label} className={activeView === item.label ? 'active' : ''} onClick={() => { setActiveView(item.label); setMobileNav(false) }}><Icon name={item.icon} /><span>{item.label}</span>{item.count && <em>{item.count}</em>}</button>)}
        </nav>
        <div className="sidebar-foot"><div className="tenant-avatar">CO</div><div><strong>Contoso</strong><small>Global tenant</small></div><Icon name="chevron" size={16} /></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation"><Icon name="menu" /></button>
          <div className="global-search"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Logic Apps, workflows, subscriptions…" aria-label="Search Logic Apps and workflows" /><kbd>⌘ K</kbd></div>
          <div className="top-actions"><span className="updated">Updated {updated}</span><button className="refresh-button" onClick={() => setUpdated('Just now')}><Icon name="refresh" size={16} /> Refresh</button><button className="avatar" aria-label="User profile">AS</button></div>
        </header>

        <div className="page">
          <div className="page-heading"><div><p className="eyebrow">OPERATIONS CENTER</p><h1>{activeView === 'Integration Estate' ? 'Integration estate' : activeView === 'Business Flows' ? 'Business flows' : activeView === 'Logic Apps' ? 'Logic Apps inventory' : activeView === 'Run Details' ? 'Run details' : activeView === 'Alerts' ? 'Alerts & issues' : activeView === 'Compare' ? 'Workflow comparison' : activeView === 'Custom Query' ? 'Custom query editor' : activeView === 'AI Insights' ? 'AI insights' : activeView === 'Configuration' ? 'Hub configuration' : 'Integration estate overview'}</h1><p>{activeView === 'Overview' ? 'A unified snapshot of Logic Apps, business outcomes, runs, and operational health.' : activeView === 'Integration Estate' ? 'Explore Logic Apps, workflows, connections, dependent systems, and integration artifacts.' : activeView === 'Business Flows' ? 'Connect workflows into end-to-end business outcomes and monitor them as one.' : activeView === 'Run Details' ? 'Analyze execution health, performance, failures, and individual run results.' : activeView === 'Custom Query' ? 'Explore fictional Application Insights telemetry and save reusable monitoring views.' : activeView === 'AI Insights' ? 'Use customer-selected GitHub models to surface explainable operational patterns.' : activeView === 'Configuration' ? 'Configure telemetry, business flow behavior, access, and security policies.' : `Monitor and manage ${activeView.toLowerCase()} across every connected subscription.`}</p></div><div className="page-heading-actions">{activeView !== 'Custom Query' && <button className="open-query-button" onClick={openWithQueryEditor}><Icon name="query" size={14}/> Open with query editor</button>}<div className="live-pill"><span /> Live monitoring</div></div></div>

          {(activeView === 'Overview' || activeView === 'Logic Apps') && <div className="filter-bar">
            <div className="filter-search"><Icon name="search" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter Logic Apps or workflows…" aria-label="Filter Logic Apps or workflows" /></div>
            <select value={subscription} onChange={(event) => setSubscription(event.target.value)} aria-label="Subscription"><option>All subscriptions</option>{[...new Set(workflows.map((workflow) => workflow.subscription))].sort().map((item) => <option key={item}>{item}</option>)}</select>
            <select value={health} onChange={(event) => setHealth(event.target.value)} aria-label="Status"><option>All statuses</option><option>Healthy</option><option>Warning</option><option>Critical</option><option>Disabled</option></select>
            <select value={region} onChange={(event) => setRegion(event.target.value)} aria-label="Region"><option>All regions</option><option>East US 2</option><option>Central US</option><option>West Europe</option><option>North Europe</option></select>
            {activeView === 'Overview' && <select value={overviewBusinessFlow} onChange={(event) => setOverviewBusinessFlow(event.target.value)} aria-label="Business Flow"><option>All business flows</option>{initialBusinessFlows.map((flow) => <option key={flow.id}>{flow.name}</option>)}</select>}
            <button className="clear-button" onClick={resetFilters}>Clear</button>
          </div>}

          {activeView === 'Overview' && <>
            <section className="kpi-grid" aria-label="Key metrics">
              <article className="kpi-card"><div className="kpi-icon purple"><Icon name="flow" /></div><div><span>Workflows in scope</span><strong>{filtered.length}</strong><small><b>{new Set(filtered.map((workflow) => workflow.logicAppName)).size}</b> Logic Apps</small></div></article>
              <article className="kpi-card"><div className="kpi-icon green"><Icon name="check" /></div><div><span>Success rate</span><strong>{overviewSuccess.toFixed(1)}%</strong><small><b>{overviewRuns.toLocaleString()}</b> executions analyzed</small></div></article>
              <article className="kpi-card"><div className="kpi-icon blue"><Icon name="spark" /></div><div><span>Runs today</span><strong>{overviewRuns.toLocaleString()}</strong><small><b>{overviewFailures}</b> failed runs</small></div></article>
              <article className="kpi-card"><div className="kpi-icon amber"><Icon name="clock" /></div><div><span>Avg. duration</span><strong>{overviewDuration ? `${overviewDuration.toFixed(1)}s` : '—'}</strong><small className="neutral">Across filtered workflows</small></div></article>
            </section>
            <section className="overview-grid">
              <article className="panel volume-panel"><div className="panel-heading"><div><h2>Run volume</h2><p>Executions across filtered workflows</p></div><select aria-label="Run volume period"><option>Last 24 hours</option><option>Last 7 days</option></select></div><div className="chart-summary"><strong>{overviewRuns.toLocaleString()}</strong><span>total runs</span><em>{overviewBusinessFlow === 'All business flows' ? 'All flows' : overviewBusinessFlow}</em></div><div className="bar-chart" aria-label="Run volume chart">{runVolume.map((value, index) => <div key={index} className="bar-wrap"><div className="bar" style={{ height: `${Math.max(3, (value / Math.max(...runVolume)) * 100 * runVolumeScale)}%` }} /></div>)}</div><div className="chart-axis"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>Now</span></div></article>
              <article className="panel health-panel"><div className="panel-heading"><div><h2>Estate health</h2><p>Current filtered workflow status</p></div><button onClick={() => setActiveView('Logic Apps')}>View all <Icon name="chevron" size={14} /></button></div><div className="donut-row"><div className="donut" style={{ background: filtered.length ? `conic-gradient(var(--green) 0 ${(overviewHealth.Healthy / filtered.length) * 100}%, var(--amber) ${(overviewHealth.Healthy / filtered.length) * 100}% ${((overviewHealth.Healthy + overviewHealth.Warning) / filtered.length) * 100}%, var(--red) ${((overviewHealth.Healthy + overviewHealth.Warning) / filtered.length) * 100}% ${((overviewHealth.Healthy + overviewHealth.Warning + overviewHealth.Critical) / filtered.length) * 100}%, #aeb2bd ${((overviewHealth.Healthy + overviewHealth.Warning + overviewHealth.Critical) / filtered.length) * 100}% 100%)` : '#e7e8ed' }}><div><strong>{filtered.length}</strong><span>workflows</span></div></div><ul><li><span className="legend healthy" />Healthy <strong>{overviewHealth.Healthy}</strong></li><li><span className="legend warning" />Warning <strong>{overviewHealth.Warning}</strong></li><li><span className="legend critical" />Critical <strong>{overviewHealth.Critical}</strong></li><li><span className="legend disabled" />Disabled <strong>{overviewHealth.Disabled}</strong></li></ul></div></article>
            </section>
            <section className="panel business-flow-snapshot"><div className="panel-heading"><div><h2>Business Flows snapshot</h2><p>{overviewBusinessFlow === 'All business flows' ? 'End-to-end outcomes across workflows and Logic Apps' : `Filtered to ${overviewBusinessFlow}`}</p></div><button onClick={() => setActiveView('Business Flows')}>Open Business Flows <Icon name="chevron" size={14} /></button></div><div className="snapshot-grid"><div className="snapshot-summary"><div className="snapshot-ring"><div><strong>{visibleBusinessFlows.length}</strong><span>flows</span></div></div><div className="snapshot-stats"><span><i className="healthy"/>{visibleBusinessFlows.filter((flow) => !workflows.some((workflow) => flow.workflowIds.includes(workflow.id) && (workflow.health === 'Critical' || workflow.health === 'Warning'))).length} healthy</span><span><i className="critical"/>{visibleBusinessFlows.filter((flow) => workflows.some((workflow) => flow.workflowIds.includes(workflow.id) && (workflow.health === 'Critical' || workflow.health === 'Warning'))).length} need attention</span><p><strong>{filtered.length}</strong> workflows across <strong>{new Set(filtered.map((workflow) => workflow.logicAppName)).size}</strong> Logic Apps</p></div></div><div className="snapshot-flows">{visibleBusinessFlows.map((flow) => { const members = workflows.filter((workflow) => flow.workflowIds.includes(workflow.id)); const hasCritical = members.some((workflow) => workflow.health === 'Critical'); const hasWarning = members.some((workflow) => workflow.health === 'Warning'); const flowStatus = hasCritical ? 'Critical' : hasWarning ? 'Warning' : 'Healthy'; return <button key={flow.id} onClick={() => setActiveView('Business Flows')}><span className={`snapshot-status ${flowStatus.toLowerCase()}`}><i/></span><span><strong>{flow.name}</strong><small>{members.length} workflows · {new Set(members.map((member) => member.logicAppName)).size} Logic Apps</small></span><b>{members.reduce((total, member) => total + member.runs24h, 0).toLocaleString()}<small> runs</small></b><Icon name="chevron" size={14}/></button> })}</div></div></section>
            <section className="panel estate-overview-snapshot"><div className="panel-heading"><div><h2>Integration Estate snapshot</h2><p>Logic Apps and their complete integration footprint</p></div><button onClick={() => setActiveView('Integration Estate')}>Explore estate <Icon name="chevron" size={14}/></button></div><div className="estate-snapshot-grid"><div><span className="estate-snapshot-icon purple"><Icon name="estate" size={18}/></span><span><strong>{new Set(workflows.map((workflow) => workflow.logicAppName)).size}</strong><small>Logic Apps</small></span></div><div><span className="estate-snapshot-icon green"><Icon name="flow" size={18}/></span><span><strong>{workflows.length}</strong><small>Workflows</small></span></div><div><span className="estate-snapshot-icon blue">◇</span><span><strong>{new Set(initialBusinessFlows.flatMap((flow) => flow.dependencyIds)).size}</strong><small>Dependent systems</small></span></div><div><span className="estate-snapshot-icon amber">↗</span><span><strong>{new Set(initialBusinessFlows.flatMap((flow) => flow.connectionIds)).size}</strong><small>Connections</small></span></div><div><span className="estate-snapshot-icon rose">{`{}`}</span><span><strong>{integrationArtifacts.length}</strong><small>Artifacts</small></span></div></div><div className="estate-snapshot-detail"><span><b>{integrationArtifacts.filter((item) => item.type === 'Schema').length}</b> schemas</span><i/><span><b>{integrationArtifacts.filter((item) => item.type === 'Map').length}</b> maps</span><i/><span><b>{integrationArtifacts.filter((item) => item.type === 'Assembly').length}</b> assemblies</span><i/><span><b>{integrationArtifacts.filter((item) => item.status === 'Review').length}</b> require review</span><button onClick={() => setActiveView('Integration Estate')}>View complete inventory →</button></div></section>
          </>}

          {(activeView === 'Overview' || activeView === 'Logic Apps') && <section className="panel table-panel"><div className="panel-heading"><div><h2>{activeView === 'Overview' ? 'Workflow health' : `${filtered.length} workflows across ${new Set(filtered.map((workflow) => workflow.logicAppName)).size} Logic Apps`}</h2><p>Live performance across connected Logic Apps and subscriptions</p></div>{activeView === 'Overview' && <button onClick={() => setActiveView('Logic Apps')}>View inventory <Icon name="chevron" size={14} /></button>}</div>{filtered.length === 0 ? <EmptyState /> : <div className="table-scroll"><table><thead><tr><th>Workflow / Logic App</th><th>Status</th><th>Environment</th><th>Success rate</th><th>Runs (24h)</th><th>Avg. duration</th><th>Trend</th><th /></tr></thead><tbody>{filtered.slice(0, activeView === 'Overview' ? 5 : filtered.length).map((workflow) => <tr key={workflow.id} onClick={() => setSelected(workflow)} tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && setSelected(workflow)}><td><div className="workflow-cell"><div className="workflow-icon"><Icon name="flow" size={17} /></div><div><strong>{workflow.name}</strong><span>{workflow.logicAppName} · {workflow.subscription} · {workflow.region}</span></div></div></td><td><StatusBadge value={workflow.health} /></td><td><span className={`env-tag env-${workflow.environment.toLowerCase()}`}>{workflow.environment}</span></td><td><strong>{workflow.successRate}%</strong></td><td>{workflow.runs24h.toLocaleString()}</td><td>{workflow.avgDuration}</td><td><Sparkline values={workflow.trend} health={workflow.health} /></td><td><Icon name="chevron" size={16} /></td></tr>)}</tbody></table></div>}</section>}

          {activeView === 'Overview' && <section className="panel table-panel runs-panel"><div className="panel-heading"><div><h2>Recent runs</h2><p>Latest executions from your monitored workflows</p></div><button onClick={() => setActiveView('Run Details')}>View run details <Icon name="chevron" size={14} /></button></div><div className="table-scroll"><table><thead><tr><th>Workflow / Logic App</th><th>Run ID</th><th>Status</th><th>Started</th><th>Duration</th><th>Trigger</th><th>Correlation ID</th></tr></thead><tbody>{visibleRuns.slice(0, 5).map((run) => { const workflow = workflows.find((item) => item.id === run.workflowId); return <tr key={run.id} onClick={() => setSelected(workflow ?? null)}><td><div className="run-workflow"><strong>{run.workflowName}</strong><small>{workflow?.logicAppName}</small></div></td><td className="mono">{run.id}</td><td><StatusBadge value={run.status} /></td><td>{run.started}</td><td>{run.duration}</td><td>{run.trigger}</td><td className="mono">{run.correlationId}</td></tr> })}</tbody></table></div></section>}

          {(activeView === 'Alerts' || activeView === 'Overview') && <section className={`panel alerts-panel ${activeView === 'Overview' ? 'overview-alerts' : ''}`}><div className="panel-heading"><div><h2>Active issues</h2><p>Signals requiring your attention</p></div><button onClick={() => setActiveView('Alerts')}>{activeView === 'Overview' ? 'View all' : 'Notification settings'} <Icon name="chevron" size={14} /></button></div><div className="alert-list">{(activeView === 'Overview' ? visibleAlerts : alerts).map((alert) => { const workflow = workflows.find((item) => item.name === alert.workflowName); return <article key={alert.id} className={`alert-item severity-${alert.severity.toLowerCase()}`}><div className="alert-symbol"><Icon name="alert" size={18} /></div><div><div className="alert-title"><strong>{alert.title}</strong><span>{alert.time}</span></div><p>{alert.message}</p><button onClick={() => setSelected(workflow ?? null)}>{alert.workflowName} · {workflow?.logicAppName} <Icon name="chevron" size={13} /></button></div></article> })}{activeView === 'Overview' && visibleAlerts.length === 0 && <div className="overview-no-alerts"><Icon name="check" size={16}/><span><strong>No active issues</strong><small>No alerts match the selected Business Flow and filters.</small></span></div>}</div></section>}

          {activeView === 'Compare' && <section className="comparison-grid">{workflows.filter((workflow) => workflow.environment === 'Production').map((workflow) => <article className="compare-card" key={workflow.id}><div className="compare-top"><div className="workflow-icon"><Icon name="flow" /></div><StatusBadge value={workflow.health} /></div><h2>{workflow.name}</h2><span className="logic-app-label">Logic App · {workflow.logicAppName}</span><p>{workflow.description}</p><Sparkline values={workflow.trend} health={workflow.health} /><div className="compare-metrics"><div><span>Success</span><strong>{workflow.successRate}%</strong></div><div><span>Runs</span><strong>{workflow.runs24h.toLocaleString()}</strong></div><div><span>Duration</span><strong>{workflow.avgDuration}</strong></div></div><button onClick={() => setSelected(workflow)}>Open details <Icon name="chevron" size={14} /></button></article>)}</section>}
          {activeView === 'Business Flows' && <BusinessFlows workflows={workflows} onFlowCountChange={setBusinessFlowCount} />}
          {activeView === 'Integration Estate' && <IntegrationEstate workflows={workflows} />}
          {activeView === 'Run Details' && <RunDetails workflows={workflows} runs={runs} onSelectWorkflow={setSelected} />}
          {activeView === 'Configuration' && <Configuration />}
          {activeView === 'Custom Query' && <QueryEditor key={`${queryDraft.sourceView}-${queryDraft.name}`} initialDraft={queryDraft} />}
          {activeView === 'AI Insights' && <AIInsights />}
        </div>
      </main>

      {selected && <><button className="drawer-backdrop" onClick={() => setSelected(null)} aria-label="Close workflow details" /><aside className="detail-drawer" aria-label={`${selected.name} details`}><div className="drawer-head"><div className="workflow-icon large"><Icon name="flow" size={22} /></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close"><Icon name="close" /></button></div><p className="eyebrow">WORKFLOW DETAILS</p><h2>{selected.name}</h2><span className="logic-app-label">Logic App · {selected.logicAppName}</span><p className="drawer-description">{selected.description}</p><div className="drawer-status"><StatusBadge value={selected.health} /><span>Last run {selected.lastRun}</span></div><div className="drawer-chart"><div><span>12-hour success rate</span><strong>{selected.successRate}%</strong></div><Sparkline values={selected.trend} health={selected.health} /></div><dl><div><dt>Logic App</dt><dd>{selected.logicAppName}</dd></div><div><dt>Environment</dt><dd>{selected.environment}</dd></div><div><dt>Workflow type</dt><dd>{selected.type}</dd></div><div><dt>Subscription</dt><dd>{selected.subscription}</dd></div><div><dt>Resource group</dt><dd>{selected.resourceGroup}</dd></div><div><dt>Region</dt><dd>{selected.region}</dd></div><div><dt>Trigger</dt><dd>{selected.trigger}</dd></div></dl><div className="drawer-kpis"><div><span>Runs (24h)</span><strong>{selected.runs24h.toLocaleString()}</strong></div><div><span>Failed</span><strong>{selected.failed24h}</strong></div><div><span>Avg. duration</span><strong>{selected.avgDuration}</strong></div></div><h3>Tags</h3><div className="tag-list">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="primary-button" onClick={() => { setActiveView('Run Details'); setSelected(null) }}>Explore run details <Icon name="chevron" size={15} /></button><p className="prototype-note">Prototype data · No live Azure connection</p></aside></>}
    </div>
  )
}

export default App
