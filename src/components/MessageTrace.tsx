import { useMemo, useState } from 'react'
import { correlationTraces } from '../data/messageTraces'
import type { BusinessFlow, CorrelationTrace } from '../types/hub'
import './MessageTrace.css'

function TraceStatus({ status }: { status: CorrelationTrace['status'] }) {
  return <span className={`trace-status trace-${status.toLowerCase().replace(' ', '-')}`}><i />{status}</span>
}

export default function MessageTrace({ flow }: { flow: BusinessFlow }) {
  const traces = useMemo(() => correlationTraces.filter((trace) => trace.businessFlowId === flow.id), [flow.id])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(traces[0]?.correlationId ?? '')
  const matching = traces.filter((trace) => !query || `${trace.correlationId} ${trace.messageType} ${trace.source} ${trace.destination}`.toLowerCase().includes(query.toLowerCase()))
  const selected = traces.find((trace) => trace.correlationId === selectedId) ?? matching[0]

  return <div className="message-trace-view">
    <section className="trace-search-panel"><div><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Enter a correlation ID, message type, source, or destination…" /><button onClick={() => matching[0] && setSelectedId(matching[0].correlationId)}>Track message</button></div><p>Trace a message across connections, systems, Logic Apps, and workflows in <strong>{flow.name}</strong>.</p></section>
    <div className="trace-layout"><aside className="trace-list"><header><div><h3>Correlation traces</h3><p>{matching.length} messages found</p></div><span>Last 24h</span></header>{matching.map((trace) => <button key={trace.correlationId} className={selected?.correlationId === trace.correlationId ? 'active' : ''} onClick={() => setSelectedId(trace.correlationId)}><div><strong>{trace.messageType}</strong><TraceStatus status={trace.status}/></div><code>{trace.correlationId}</code><span>{trace.source} <b>→</b> {trace.destination}</span><small>{trace.started} · {trace.elapsed} · {trace.hops.length} hops</small></button>)}{matching.length === 0 && <div className="trace-empty"><strong>No matching trace</strong><span>Try another correlation ID.</span></div>}</aside>
      <section className="trace-detail">{selected ? <><header><div><span>MESSAGE TRACE</span><h3>{selected.messageType}</h3><code>{selected.correlationId}</code></div><div><TraceStatus status={selected.status}/><small>{selected.elapsed} end to end</small></div></header><div className="trace-route-summary"><span><small>Source</small><strong>{selected.source}</strong></span><i>→</i><span><small>{selected.hops.length} correlated hops</small><strong>{selected.started}</strong></span><i>→</i><span><small>Destination</small><strong>{selected.destination}</strong></span></div><div className="trace-timeline">{selected.hops.map((hop, index) => <article key={hop.id} className={`hop-${hop.status.toLowerCase().replace(' ', '-')}`}><div className="hop-rail"><span>{index + 1}</span>{index < selected.hops.length - 1 && <i/>}</div><div className="hop-card"><header><span className={`hop-kind kind-${hop.kind.toLowerCase().replace(' ', '-')}`}>{hop.kind}</span><TraceStatus status={hop.status}/><time>{hop.timestamp}</time></header><div><strong>{hop.name}</strong><span>{hop.detail}</span></div><footer><span>◷ {hop.duration}</span><span>▤ {hop.payload}</span></footer></div></article>)}</div></> : <div className="trace-empty large"><strong>Select a correlation trace</strong><span>Message hops and timings will appear here.</span></div>}</section>
    </div>
    <section className="trace-evidence"><span>◇</span><p><strong>Correlation strategy</strong>In production, propagate a stable correlation ID in message headers and custom dimensions. Join Logic Apps run/action telemetry with connector and external-system logs in Application Insights or Log Analytics.</p></section>
  </div>
}
