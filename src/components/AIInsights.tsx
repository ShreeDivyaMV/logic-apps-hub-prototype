import { useState } from 'react'
import './AIInsights.css'

const insights = [
  { severity: 'critical', title: 'Invoice failures share a common SAP timeout pattern', detail: '42 of 55 failed runs occurred after SAP response times exceeded 8 seconds.', impact: 'High impact', action: 'Review timeout policy', confidence: '94%' },
  { severity: 'warning', title: 'Customer 360 Sync throughput is trending down', detail: 'Execution volume decreased 18% over 7 days while connector throttling increased.', impact: 'Medium impact', action: 'Inspect connector limits', confidence: '88%' },
  { severity: 'opportunity', title: 'Three workflows can reduce average action duration', detail: 'Parallelizing independent enrichment actions may reduce end-to-end latency by 1.4 seconds.', impact: 'Optimization', action: 'View recommendation', confidence: '82%' },
]

export default function AIInsights() {
  const [connected, setConnected] = useState(false)
  const [model, setModel] = useState('GPT-4.1')
  const [repo, setRepo] = useState('contoso/integration-platform')
  const [analysis, setAnalysis] = useState('Operational telemetry + workflow metadata')
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState('8 minutes ago')
  const connect = () => { setConnected(true) }
  const run = () => { setRunning(true); window.setTimeout(() => { setRunning(false); setLastRun('Just now') }, 700) }

  return <div className="ai-insights-view">
    <section className="ai-hero"><div className="ai-orb">✦</div><div><span>AI-ASSISTED OPERATIONS</span><h2>Find patterns across your integration estate</h2><p>Generate explainable insights from fictional telemetry, workflow metadata, and optional repository context.</p></div><button onClick={run} disabled={running}>{running ? 'Analyzing…' : '✦ Generate insights'}</button></section>
    <div className="ai-layout">
      <section className="ai-main-column"><div className="ai-summary"><article><span>Insights found</span><strong>7</strong><small>3 require attention</small></article><article><span>Potential incidents</span><strong>2</strong><small>Before SLA impact</small></article><article><span>Optimization potential</span><strong>14%</strong><small>Estimated latency reduction</small></article><article><span>Last analysis</span><strong className="last-run">{lastRun}</strong><small>Using {model}</small></article></div><section className="ai-insight-list"><header><div><h3>Recommended insights</h3><p>Prioritized findings with supporting evidence</p></div><span>Confidence ≥ 80%</span></header>{insights.map((insight) => <article key={insight.title} className={`insight-${insight.severity}`}><div className="insight-symbol">{insight.severity === 'critical' ? '!' : insight.severity === 'warning' ? '△' : '✦'}</div><div><div className="insight-title"><strong>{insight.title}</strong><span>{insight.impact}</span></div><p>{insight.detail}</p><footer><span>Confidence <b>{insight.confidence}</b></span><button>{insight.action} →</button></footer></div></article>)}</section></section>
      <aside className="ai-settings"><header><div><span>GH</span><div><h3>GitHub model connection</h3><p>Choose a model and optional repository context.</p></div></div><span className={connected ? 'github-connected' : 'github-disconnected'}><i/>{connected ? 'Connected' : 'Not connected'}</span></header>{!connected ? <div className="github-connect"><div>⌘</div><h3>Connect your GitHub account</h3><p>Simulate authorization to browse permitted models and repositories. No token or credential is requested.</p><button onClick={connect}>Connect to GitHub</button><small>Prototype only · OAuth is not initiated</small></div> : <div className="model-settings"><div className="github-user"><span>CO</span><div><strong>contoso-integrations</strong><small>GitHub organization</small></div><button onClick={() => setConnected(false)}>Disconnect</button></div><label>GitHub model<select value={model} onChange={(event) => setModel(event.target.value)}><option>GPT-4.1</option><option>GPT-4o</option><option>o3-mini</option><option>Phi-4</option><option>DeepSeek-R1</option></select><small>Models available to the connected GitHub account</small></label><label>Repository context<select value={repo} onChange={(event) => setRepo(event.target.value)}><option>contoso/integration-platform</option><option>contoso/logic-app-workflows</option><option>contoso/operations-runbooks</option></select><small>Read-only workflow and runbook context</small></label><label>Analysis scope<select value={analysis} onChange={(event) => setAnalysis(event.target.value)}><option>Operational telemetry + workflow metadata</option><option>Operational telemetry only</option><option>Business Flow health</option></select></label><div className="ai-privacy"><span>◇</span><p><strong>Data controls</strong>Repository contents and telemetry remain fictional in this prototype.</p></div></div>}</aside>
    </div>
    <section className="ai-disclaimer"><span>ⓘ</span><p><strong>AI-generated insights require review.</strong> Recommendations can be incomplete or incorrect. Validate evidence before changing production workflows.</p></section>
  </div>
}
