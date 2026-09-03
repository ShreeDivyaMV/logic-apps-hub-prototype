import { useMemo, useState } from 'react'
import { flowConnections, flowDependencies, initialBusinessFlows } from '../data/businessFlows'
import type { BusinessFlow, FlowConnection, FlowDependency, Health, Workflow } from '../types/hub'
import './BusinessFlows.css'

type DetailTab = 'Analytics' | 'Connections' | 'Dependencies'

const flowHealth = (items: Workflow[]): Health => {
  if (items.some((item) => item.health === 'Critical')) return 'Critical'
  if (items.some((item) => item.health === 'Warning')) return 'Warning'
  if (items.every((item) => item.health === 'Disabled')) return 'Disabled'
  return 'Healthy'
}

const healthClass = (health: string) => `bf-health bf-health-${health.toLowerCase()}`

function FlowStatus({ health }: { health: Health }) {
  return <span className={healthClass(health)}><i />{health}</span>
}

function ConnectorMark({ item }: { item: FlowConnection | FlowDependency }) {
  const name = 'connector' in item ? item.connector : item.service
  const initials = name.split(' ').filter((word) => !['Azure', 'Microsoft'].includes(word)).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
  return <span className={`connector-mark mark-${item.kind.toLowerCase()}`}>{initials}</span>
}

function FlowCard({ flow, workflows, onOpen }: { flow: BusinessFlow; workflows: Workflow[]; onOpen: () => void }) {
  const members = workflows.filter((workflow) => flow.workflowIds.includes(workflow.id))
  const health = flowHealth(members)
  const success = members.length ? members.reduce((total, item) => total + item.successRate, 0) / members.length : 0
  const runs = members.reduce((total, item) => total + item.runs24h, 0)
  const dependencies = flowDependencies.filter((item) => flow.dependencyIds.includes(item.id))
  return <article className="business-flow-card" onClick={onOpen} tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onOpen()}>
    <div className="bf-card-top"><div className="bf-flow-symbol"><span /><span /><span /></div><FlowStatus health={health} /></div>
    <h2>{flow.name}</h2><p>{flow.description}</p>
    <div className="bf-member-stack" aria-label={`${members.length} workflows`}>{members.slice(0, 4).map((item, index) => <span key={item.id} style={{ zIndex: 5 - index }} title={`${item.name} · ${item.logicAppName}`}>{item.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</span>)}<strong>{members.length} workflows · {new Set(members.map((item) => item.logicAppName)).size} Logic Apps</strong></div>
    <div className="bf-card-metrics"><div><span>Success rate</span><strong>{success.toFixed(1)}%</strong></div><div><span>Runs (24h)</span><strong>{runs.toLocaleString()}</strong></div><div><span>Dependencies</span><strong>{dependencies.length}</strong></div></div>
    <div className="bf-card-foot"><span>{flow.owner}</span><button>View analytics <b>›</b></button></div>
  </article>
}

function CreateFlowDialog({ workflows, onClose, onCreate }: { workflows: Workflow[]; onClose: () => void; onCreate: (flow: BusinessFlow) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [owner, setOwner] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [step, setStep] = useState<1 | 2>(1)
  const [query, setQuery] = useState('')
  const visible = workflows
    .filter((workflow) => `${workflow.logicAppName} ${workflow.name} ${workflow.subscription} ${workflow.environment}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.logicAppName.localeCompare(b.logicAppName) || a.name.localeCompare(b.name))
  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const submit = () => {
    if (!name.trim() || !owner.trim() || selectedIds.length < 2) return
    const connectionIds = flowConnections.filter((item) => item.workflowIds.some((id) => selectedIds.includes(id))).map((item) => item.id)
    const dependencyIds = flowDependencies.filter((item) => item.workflowIds.some((id) => selectedIds.includes(id))).map((item) => item.id)
    onCreate({ id: `flow-${Date.now()}`, name: name.trim(), description: description.trim() || 'Customer-defined business process.', owner: owner.trim(), workflowIds: selectedIds, connectionIds, dependencyIds, createdAt: 'Sep 3, 2026' })
  }
  return <div className="bf-modal-layer" role="presentation"><button className="bf-modal-backdrop" onClick={onClose} aria-label="Close create business flow dialog" /><section className="bf-modal" role="dialog" aria-modal="true" aria-labelledby="create-flow-title">
    <header><div><span>BUSINESS FLOW BUILDER</span><h2 id="create-flow-title">Create a business flow</h2><p>Group workflows from different Logic Apps into one customer journey.</p></div><button className="bf-close" onClick={onClose} aria-label="Close">×</button></header>
    <div className="bf-stepper"><div className={step === 1 ? 'current' : 'done'}><b>{step === 2 ? '✓' : '1'}</b><span>Flow details</span></div><i /><div className={step === 2 ? 'current' : ''}><b>2</b><span>Select workflows</span></div></div>
    {step === 1 ? <div className="bf-form"><label>Flow name <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Customer onboarding" autoFocus /></label><label>Description <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the business outcome and boundaries…" rows={4} /></label><label>Owner or team <input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="e.g. Customer Experience" /></label></div> : <div className="workflow-picker"><div className="picker-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Logic Apps, workflows, or subscriptions…" /><strong>{selectedIds.length} selected</strong></div><div className="picker-list">{visible.map((workflow, index) => <div className="picker-entry" key={workflow.id}>{(index === 0 || visible[index - 1].logicAppName !== workflow.logicAppName) && <div className="logic-app-group"><span>Logic App</span><strong>{workflow.logicAppName}</strong></div>}<label className={selectedIds.includes(workflow.id) ? 'selected' : ''}><input type="checkbox" checked={selectedIds.includes(workflow.id)} onChange={() => toggle(workflow.id)} /><span className="picker-check">✓</span><span className="picker-flow-icon">⌁</span><span><strong>{workflow.name}</strong><small>Workflow in {workflow.logicAppName} · {workflow.subscription} · {workflow.resourceGroup}</small></span><em>{workflow.environment}</em></label></div>)}</div><p className="picker-hint">Workflows are ordered by Logic App. Select at least two; connections and dependencies are discovered automatically.</p></div>}
    <footer>{step === 2 ? <button className="bf-secondary" onClick={() => setStep(1)}>Back</button> : <span />}<button className="bf-primary" disabled={step === 1 ? !name.trim() || !owner.trim() : selectedIds.length < 2} onClick={() => step === 1 ? setStep(2) : submit()}>{step === 1 ? 'Choose workflows' : `Create flow (${selectedIds.length})`} <span>→</span></button></footer>
  </section></div>
}

function Analytics({ members }: { members: Workflow[] }) {
  const runs = members.reduce((total, item) => total + item.runs24h, 0)
  const failed = members.reduce((total, item) => total + item.failed24h, 0)
  const success = members.length ? members.reduce((total, item) => total + item.successRate, 0) / members.length : 0
  return <div className="bf-analytics"><div className="bf-kpis"><article><span>End-to-end health</span><strong>{success.toFixed(1)}%</strong><small>Average workflow success</small></article><article><span>Total runs (24h)</span><strong>{runs.toLocaleString()}</strong><small>Across {members.length} workflows</small></article><article><span>Failed runs</span><strong className={failed ? 'metric-alert' : ''}>{failed}</strong><small>{runs ? ((failed / runs) * 100).toFixed(2) : 0}% failure rate</small></article><article><span>Systems involved</span><strong>{new Set(members.map((item) => item.subscription)).size + 2}</strong><small>Across the business flow</small></article></div>
    <section className="bf-section"><div className="bf-section-head"><div><h3>Workflow performance</h3><p>Health and execution analytics for each stage in this group</p></div><span>Last 24 hours</span></div><div className="bf-performance-head"><span>Workflow / Logic App</span><span>Health</span><span>Runs</span><span>Success</span><span>Failures</span><span>Duration</span></div>{members.map((workflow, index) => <div className="bf-performance-row" key={workflow.id}><div><b>{index + 1}</b><span><strong>{workflow.name}</strong><small>{workflow.logicAppName} · {workflow.subscription}</small></span></div><FlowStatus health={workflow.health} /><span>{workflow.runs24h.toLocaleString()}</span><span><strong>{workflow.successRate}%</strong><i className="success-bar"><i style={{ width: `${workflow.successRate}%` }} /></i></span><span className={workflow.failed24h ? 'failure-count' : ''}>{workflow.failed24h}</span><span>{workflow.avgDuration}</span></div>)}</section>
  </div>
}

function Connections({ flow, members }: { flow: BusinessFlow; members: Workflow[] }) {
  const items = flowConnections.filter((item) => flow.connectionIds.includes(item.id))
  return <div className="bf-two-column"><section className="bf-section"><div className="bf-section-head"><div><h3>Connections used</h3><p>Connector instances called by workflows in this group</p></div><span>{items.length} connections</span></div><div className="connection-list">{items.map((item) => <article key={item.id}><ConnectorMark item={item} /><div><strong>{item.name}</strong><span>{item.connector} · {item.kind}</span></div><div className={`connection-state state-${item.health.toLowerCase()}`}><i />{item.health}</div><div className="connection-ops"><strong>{item.operations24h.toLocaleString()}</strong><span>operations</span></div></article>)}</div></section><section className="bf-section flow-path"><div className="bf-section-head"><div><h3>Execution path</h3><p>Workflow sequence in this business flow</p></div></div><div className="path-list">{members.map((item, index) => <div key={item.id}><span>{index + 1}</span><section><strong>{item.name}</strong><small>{item.logicAppName} · {item.trigger} trigger</small></section>{index < members.length - 1 && <i />}</div>)}</div></section></div>
}

function Dependencies({ flow, members }: { flow: BusinessFlow; members: Workflow[] }) {
  const items = flowDependencies.filter((item) => flow.dependencyIds.includes(item.id))
  const azure = items.filter((item) => item.kind === 'Azure')
  const external = items.filter((item) => item.kind === 'External')
  return <div className="dependency-view"><section className="dependency-map bf-section"><div className="bf-section-head"><div><h3>System landscape</h3><p>Azure and non-Azure systems supporting this flow</p></div><span>{items.length} dependencies</span></div><div className="system-map"><div className="system-column"><h4><i className="azure-dot" />Azure services</h4>{azure.slice(0, 4).map((item) => <div className="system-node" key={item.id}><ConnectorMark item={item} /><span><strong>{item.name}</strong><small>{item.service}</small></span></div>)}</div><div className="map-center"><span className="map-lines left-lines"/><div className="map-flow-node"><div className="bf-flow-symbol"><span/><span/><span/></div><strong>{flow.name}</strong><small>{members.length} workflows</small></div><span className="map-lines right-lines"/></div><div className="system-column"><h4><i className="external-dot" />External systems</h4>{external.slice(0, 4).map((item) => <div className="system-node" key={item.id}><ConnectorMark item={item} /><span><strong>{item.name}</strong><small>{item.service}</small></span></div>)}</div></div></section><section className="bf-section"><div className="bf-section-head"><div><h3>Dependency inventory</h3><p>All systems with their purpose and affected workflows</p></div></div><div className="dependency-table"><div className="dependency-row header"><span>System</span><span>Type</span><span>Role</span><span>Used by</span></div>{items.map((item) => <div className="dependency-row" key={item.id}><div><ConnectorMark item={item}/><span><strong>{item.name}</strong><small>{item.service}</small></span></div><span className={`kind-pill kind-${item.kind.toLowerCase()}`}>{item.kind}</span><span>{item.role}</span><span>{item.workflowIds.filter((id) => flow.workflowIds.includes(id)).length} workflow{item.workflowIds.filter((id) => flow.workflowIds.includes(id)).length !== 1 ? 's' : ''}</span></div>)}</div></section></div>
}

export default function BusinessFlows({ workflows, onFlowCountChange }: { workflows: Workflow[]; onFlowCountChange?: (count: number) => void }) {
  const [flows, setFlows] = useState(initialBusinessFlows)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<DetailTab>('Analytics')
  const [creating, setCreating] = useState(false)
  const selected = flows.find((flow) => flow.id === selectedId)
  const members = useMemo(() => workflows.filter((workflow) => selected?.workflowIds.includes(workflow.id)), [selected, workflows])
  const create = (flow: BusinessFlow) => { const next = [flow, ...flows]; setFlows(next); onFlowCountChange?.(next.length); setCreating(false); setSelectedId(flow.id); setTab('Analytics') }

  if (selected) return <div className="business-flow-detail"><button className="bf-back" onClick={() => setSelectedId(null)}>← All business flows</button><div className="bf-detail-hero"><div><div className="bf-title-line"><div className="bf-flow-symbol large"><span/><span/><span/></div><div><p>BUSINESS FLOW</p><h2>{selected.name}</h2></div><FlowStatus health={flowHealth(members)} /></div><p>{selected.description}</p><div className="bf-meta"><span>Owner <strong>{selected.owner}</strong></span><i/><span>{members.length} workflows in {new Set(members.map((item) => item.logicAppName)).size} Logic Apps</span><i/><span>{new Set(members.map((item) => item.subscription)).size} subscriptions</span><i/><span>Created {selected.createdAt}</span></div></div><button className="bf-edit">Edit flow</button></div><nav className="bf-tabs" aria-label="Business flow details">{(['Analytics', 'Connections', 'Dependencies'] as DetailTab[]).map((item) => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}{item === 'Connections' && <span>{selected.connectionIds.length}</span>}{item === 'Dependencies' && <span>{selected.dependencyIds.length}</span>}</button>)}</nav>{tab === 'Analytics' && <Analytics members={members}/>} {tab === 'Connections' && <Connections flow={selected} members={members}/>} {tab === 'Dependencies' && <Dependencies flow={selected} members={members}/>}</div>

  return <div className="business-flows"><div className="bf-toolbar"><div><span className="bf-count">{flows.length} business flows</span><span>Customer-defined workflow groups</span></div><button className="bf-primary" onClick={() => setCreating(true)}>＋ Create business flow</button></div><div className="business-flow-grid">{flows.map((flow) => <FlowCard key={flow.id} flow={flow} workflows={workflows} onOpen={() => { setSelectedId(flow.id); setTab('Analytics') }}/>)}</div><section className="bf-info-banner"><div>◎</div><span><strong>Model complete business outcomes</strong><small>Business flows are logical groups for unified monitoring. They do not change or redeploy the underlying Logic Apps.</small></span><button onClick={() => setCreating(true)}>Create your own <b>→</b></button></section>{creating && <CreateFlowDialog workflows={workflows} onClose={() => setCreating(false)} onCreate={create}/>}</div>
}
