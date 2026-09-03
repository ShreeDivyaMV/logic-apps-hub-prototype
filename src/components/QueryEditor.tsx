import { useState } from 'react'
import { workflows, runs } from '../data/mockData'
import './QueryEditor.css'

export interface QueryDraft {
  name: string
  query: string
  sourceView: string
}

interface SavedQuery extends QueryDraft {
  id: string
  updated: string
}

const starterQueries: SavedQuery[] = [
  { id: 'query-failures', name: 'Failed runs by Logic App', sourceView: 'Run Details', updated: '12 min ago', query: `LogicAppWorkflowRuntime\n| where TimeGenerated > ago(24h)\n| where Status == "Failed"\n| summarize Failures=count() by LogicAppName, WorkflowName\n| order by Failures desc` },
  { id: 'query-latency', name: 'Business Flow latency', sourceView: 'Business Flows', updated: 'Yesterday', query: `LogicAppWorkflowRuntime\n| where TimeGenerated > ago(24h)\n| extend BusinessFlow = tostring(customDimensions.BusinessFlow)\n| summarize P95Latency=percentile(DurationMs, 95) by BusinessFlow\n| order by P95Latency desc` },
  { id: 'query-connectors', name: 'Connector error trend', sourceView: 'Alerts', updated: 'Aug 30', query: `LogicAppActionRuntime\n| where TimeGenerated > ago(7d)\n| where Status == "Failed"\n| summarize Errors=count() by bin(TimeGenerated, 1h), ConnectorName\n| render timechart` },
]

const lineCount = (text: string) => text.split('\n').length

export default function QueryEditor({ initialDraft }: { initialDraft: QueryDraft }) {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(() => {
    try {
      const stored = sessionStorage.getItem('logic-apps-hub-saved-queries')
      return stored ? JSON.parse(stored) as SavedQuery[] : starterQueries
    } catch {
      return starterQueries
    }
  })
  const [name, setName] = useState(initialDraft.name)
  const [query, setQuery] = useState(initialDraft.query)
  const [sourceView, setSourceView] = useState(initialDraft.sourceView)
  const [running, setRunning] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [toast, setToast] = useState('')

  const results = runs.map((run) => {
    const workflow = workflows.find((item) => item.id === run.workflowId)!
    return { time: run.started, logicApp: workflow.logicAppName, workflow: workflow.name, status: run.status, duration: run.duration, resourceGroup: workflow.resourceGroup }
  })

  const runQuery = () => { setRunning(true); window.setTimeout(() => { setRunning(false); setToast(`Query completed · ${results.length} rows`); window.setTimeout(() => setToast(''), 1800) }, 450) }
  const save = () => {
    const existing = savedQueries.find((item) => item.name.toLowerCase() === name.trim().toLowerCase())
    const next = existing
      ? savedQueries.map((item) => item.id === existing.id ? { ...item, query, sourceView, updated: 'Just now' } : item)
      : [{ id: `query-${Date.now()}`, name: name.trim() || 'Untitled custom view', query, sourceView, updated: 'Just now' }, ...savedQueries]
    setSavedQueries(next)
    sessionStorage.setItem('logic-apps-hub-saved-queries', JSON.stringify(next))
    setSaveOpen(false); setToast(existing ? 'Custom view updated' : 'Custom view saved'); window.setTimeout(() => setToast(''), 1800)
  }
  const load = (item: SavedQuery) => { setName(item.name); setQuery(item.query); setSourceView(item.sourceView) }

  return <div className="query-workspace">
    <aside className="saved-query-panel"><header><div><h2>Saved queries</h2><p>Reusable custom monitoring views</p></div><button onClick={() => { setName('Untitled query'); setQuery('LogicAppWorkflowRuntime\n| where TimeGenerated > ago(24h)\n| take 100'); setSourceView('Custom') }}>＋</button></header><div className="saved-query-search">⌕ <input placeholder="Find a saved query…" /></div><div className="saved-query-list">{savedQueries.map((item) => <button key={item.id} className={item.name === name ? 'active' : ''} onClick={() => load(item)}><span>⌗</span><div><strong>{item.name}</strong><small>{item.sourceView} · {item.updated}</small></div><b>⋮</b></button>)}</div><section><strong>Query environment</strong><span><i/>Application Insights connected</span><small>appi-integration-hub</small></section></aside>
    <section className="query-main">
      <header><div><span>CUSTOM QUERY</span><input aria-label="Query name" value={name} onChange={(event) => setName(event.target.value)} /><small>Opened from {sourceView}</small></div><div><button className="query-save" onClick={() => setSaveOpen(true)}>Save as custom view</button><button className="query-run" onClick={runQuery} disabled={running}>{running ? 'Running…' : '▶ Run query'}</button></div></header>
      <div className="query-toolbar"><button>Last 24 hours⌄</button><button>All subscriptions⌄</button><span>KQL</span><button onClick={() => navigator.clipboard?.writeText(query)}>Copy</button><button onClick={() => setQuery('')}>Clear</button></div>
      <div className="query-editor-wrap"><div className="line-numbers">{Array.from({ length: Math.max(lineCount(query), 8) }, (_, index) => <span key={index}>{index + 1}</span>)}</div><textarea aria-label="KQL query editor" spellCheck={false} value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <div className="query-results"><header><div><button className="active">Results <span>{results.length}</span></button><button>Chart</button></div><span>{running ? 'Executing query…' : 'Completed in 0.42s'}</span></header><div className="query-table-scroll"><table><thead><tr><th>Time</th><th>Logic App</th><th>Workflow</th><th>Status</th><th>Duration</th><th>Resource group</th></tr></thead><tbody>{results.map((row, index) => <tr key={`${row.time}-${index}`}><td>{row.time}</td><td><strong>{row.logicApp}</strong></td><td>{row.workflow}</td><td><span className={`query-status ${row.status.toLowerCase()}`}><i/>{row.status}</span></td><td>{row.duration}</td><td>{row.resourceGroup}</td></tr>)}</tbody></table></div></div>
    </section>
    {saveOpen && <div className="query-modal-layer"><button aria-label="Close save dialog" onClick={() => setSaveOpen(false)}/><section role="dialog" aria-modal="true"><span>SAVE CUSTOM VIEW</span><h2>Save query</h2><p>Create a reusable view from this query. It stays local in this prototype.</p><label>View name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label><label>Source view<input value={sourceView} onChange={(event) => setSourceView(event.target.value)} /></label><footer><button onClick={() => setSaveOpen(false)}>Cancel</button><button disabled={!name.trim()} onClick={save}>Save custom view</button></footer></section></div>}
    {toast && <div className="query-toast">✓ {toast}</div>}
  </div>
}
