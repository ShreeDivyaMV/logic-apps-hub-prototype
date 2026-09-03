import { useMemo, useState } from 'react'
import { initialBusinessFlows } from '../data/businessFlows'
import type { Workflow, WorkflowRun } from '../types/hub'
import './RunDetails.css'

const successSeries = [98.2, 98.8, 99.1, 97.9, 98.6, 99.3, 98.9, 99.5, 98.7, 99.2, 98.4, 98.7]
const throughputSeries = [186, 224, 201, 268, 246, 312, 294, 338, 319, 365, 341, 388]
const latencySeries = [3.8, 3.1, 2.9, 3.4, 2.7, 2.5, 2.8, 2.3, 2.6, 2.2, 2.5, 2.4]
const durationSeries = [1.7, 2.1, 1.8, 2.5, 2.2, 2.9, 2.6, 3.1, 2.7, 3.4, 3.0, 3.2]

const actionFailures = [
  { name: 'Transform invoice payload', workflowId: 'wf-invoices', count: 31 },
  { name: 'Post to SAP', workflowId: 'wf-invoices', count: 18 },
  { name: 'Update inventory record', workflowId: 'wf-stock', count: 11 },
  { name: 'Refresh customer profile', workflowId: 'wf-customer-sync', count: 2 },
]

const connectorFailures = [
  { name: 'SAP ERP', type: 'External', count: 24 },
  { name: 'Microsoft Dataverse', type: 'Azure', count: 17 },
  { name: 'Azure Blob Storage', type: 'Azure', count: 9 },
  { name: 'Service Bus', type: 'Azure', count: 4 },
]

type MetricCardProps = { title: string; value: string; detail: string; series: number[]; color: string; format: (value: number) => string }

function MetricCard({ title, value, detail, series, color, format }: MetricCardProps) {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min || 1
  const points = series.map((item, index) => `${(index / (series.length - 1)) * 220},${58 - ((item - min) / range) * 42}`).join(' ')
  return <article className="run-metric-card">
    <div><span>{title}</span><strong>{value}</strong><small>{detail}</small></div>
    <svg viewBox="0 0 220 66" role="img" aria-label={`${title} trend`} style={{ color }}><defs><linearGradient id={`fill-${title.replaceAll(' ', '-')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".2"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><polygon points={`0,66 ${points} 220,66`} fill={`url(#fill-${title.replaceAll(' ', '-')})`}/><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="220" cy={58 - ((series.at(-1)! - min) / range) * 42} r="3" fill="currentColor"/></svg>
    <div className="run-chart-axis"><span>12 AM</span><span>{format(series.at(-1)!)}</span><span>Now</span></div>
  </article>
}

function RunStatus({ status }: { status: WorkflowRun['status'] }) {
  return <span className={`rd-status rd-${status.toLowerCase()}`}><i />{status}</span>
}

export default function RunDetails({ workflows, runs, onSelectWorkflow }: { workflows: Workflow[]; runs: WorkflowRun[]; onSelectWorkflow: (workflow: Workflow) => void }) {
  const [search, setSearch] = useState('')
  const [logicApp, setLogicApp] = useState('All Logic Apps')
  const [businessFlow, setBusinessFlow] = useState('All business flows')
  const [resourceGroup, setResourceGroup] = useState('All resource groups')
  const [subscription, setSubscription] = useState('All subscriptions')
  const [status, setStatus] = useState('All statuses')

  const workflowToFlows = useMemo(() => new Map(workflows.map((workflow) => [workflow.id, initialBusinessFlows.filter((flow) => flow.workflowIds.includes(workflow.id)).map((flow) => flow.name)])), [workflows])
  const filteredRuns = useMemo(() => runs.filter((run) => {
    const workflow = workflows.find((item) => item.id === run.workflowId)
    if (!workflow) return false
    const flowNames = workflowToFlows.get(workflow.id) ?? []
    const query = search.toLowerCase()
    return (!query || `${run.id} ${workflow.name} ${workflow.logicAppName} ${flowNames.join(' ')}`.toLowerCase().includes(query))
      && (logicApp === 'All Logic Apps' || workflow.logicAppName === logicApp)
      && (businessFlow === 'All business flows' || flowNames.includes(businessFlow))
      && (resourceGroup === 'All resource groups' || workflow.resourceGroup === resourceGroup)
      && (subscription === 'All subscriptions' || workflow.subscription === subscription)
      && (status === 'All statuses' || run.status === status)
  }), [businessFlow, logicApp, resourceGroup, runs, search, status, subscription, workflowToFlows, workflows])

  const reset = () => { setSearch(''); setLogicApp('All Logic Apps'); setBusinessFlow('All business flows'); setResourceGroup('All resource groups'); setSubscription('All subscriptions'); setStatus('All statuses') }
  const unique = (values: string[]) => [...new Set(values)].sort()

  return <div className="run-details-view">
    <section className="run-filter-panel">
      <div className="run-filter-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search run ID, Logic App, workflow, or business flow…" /></div>
      <div className="run-filter-grid">
        <label>Logic App<select value={logicApp} onChange={(event) => setLogicApp(event.target.value)}><option>All Logic Apps</option>{unique(workflows.map((item) => item.logicAppName)).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Business flow<select value={businessFlow} onChange={(event) => setBusinessFlow(event.target.value)}><option>All business flows</option>{initialBusinessFlows.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
        <label>Resource group<select value={resourceGroup} onChange={(event) => setResourceGroup(event.target.value)}><option>All resource groups</option>{unique(workflows.map((item) => item.resourceGroup)).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Subscription<select value={subscription} onChange={(event) => setSubscription(event.target.value)}><option>All subscriptions</option>{unique(workflows.map((item) => item.subscription)).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>Succeeded</option><option>Failed</option><option>Running</option><option>Cancelled</option></select></label>
        <button onClick={reset}>Clear filters</button>
      </div>
    </section>

    <section className="run-metrics-grid" aria-label="Run analytics">
      <MetricCard title="Success %" value="98.7%" detail="↑ 0.6% from previous period" series={successSeries} color="#35a56f" format={(item) => `${item}%`}/>
      <MetricCard title="Throughput" value="219/min" detail="5,263 executions today" series={throughputSeries} color="#7166dc" format={(item) => `${item}/min`}/>
      <MetricCard title="Latency" value="2.4s" detail="P95 end-to-end latency" series={latencySeries} color="#3b8cc7" format={(item) => `${item}s`}/>
      <MetricCard title="Action duration" value="3.2s" detail="Average action execution" series={durationSeries} color="#d68b2d" format={(item) => `${item}s`}/>
    </section>

    <section className="failure-grid">
      <article className="failure-panel"><header><div><h2>Failures by action</h2><p>Actions producing the most failed runs</p></div><span>62 failures</span></header><div>{actionFailures.map((failure) => { const workflow = workflows.find((item) => item.id === failure.workflowId); return <div className="failure-row" key={failure.name}><span><strong>{failure.name}</strong><small>{workflow?.name} · {workflow?.logicAppName}</small></span><i><i style={{ width: `${(failure.count / actionFailures[0].count) * 100}%` }}/></i><b>{failure.count}</b></div> })}</div></article>
      <article className="failure-panel"><header><div><h2>Failures by connector</h2><p>Connector errors across monitored workflows</p></div><span>54 failures</span></header><div>{connectorFailures.map((failure) => <div className="failure-row connector-failure" key={failure.name}><span className={`failure-mark failure-${failure.type.toLowerCase()}`}>{failure.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</span><span><strong>{failure.name}</strong><small>{failure.type} connector</small></span><i><i style={{ width: `${(failure.count / connectorFailures[0].count) * 100}%` }}/></i><b>{failure.count}</b></div>)}</div></article>
    </section>

    <section className="run-results-panel"><header><div><h2>Run results</h2><p>{filteredRuns.length} executions matching the current filters</p></div><span>Last 24 hours</span></header><div className="run-table-scroll"><table><thead><tr><th>Run ID</th><th>Logic App</th><th>Workflow</th><th>Business flow</th><th>Status</th><th>Started</th><th>Latency</th><th>Trigger</th><th>Correlation ID</th></tr></thead><tbody>{filteredRuns.map((run) => { const workflow = workflows.find((item) => item.id === run.workflowId)!; const flowNames = workflowToFlows.get(run.workflowId) ?? []; return <tr key={run.id} onClick={() => onSelectWorkflow(workflow)}><td className="rd-mono">{run.id}</td><td><strong>{workflow.logicAppName}</strong><small>{workflow.subscription}</small></td><td><strong>{run.workflowName}</strong><small>{workflow.resourceGroup}</small></td><td><div className="flow-cell">{flowNames.length ? flowNames.map((name) => <span key={name}>{name}</span>) : <em>Not grouped</em>}</div></td><td><RunStatus status={run.status}/></td><td>{run.started}</td><td>{run.duration}</td><td>{run.trigger}</td><td className="rd-mono">{run.correlationId}</td></tr> })}</tbody></table>{filteredRuns.length === 0 && <div className="run-empty"><strong>No runs found</strong><span>Change or clear the current filter selection.</span></div>}</div></section>
  </div>
}
