import { useMemo, useState } from 'react'
import { flowConnections, flowDependencies } from '../data/businessFlows'
import { integrationArtifacts } from '../data/integrationEstate'
import type { Health, IntegrationArtifact, Workflow } from '../types/hub'
import './IntegrationEstate.css'

type EstateTab = 'Workflows' | 'Connections' | 'Systems' | 'Artifacts'

const healthRank: Record<Health, number> = { Critical: 4, Warning: 3, Disabled: 2, Healthy: 1 }
const estateHealth = (workflows: Workflow[]) => [...workflows].sort((a, b) => healthRank[b.health] - healthRank[a.health])[0]?.health ?? 'Healthy'

function Status({ health }: { health: Health }) {
  return <span className={`estate-status estate-${health.toLowerCase()}`}><i />{health}</span>
}

function ArtifactIcon({ artifact }: { artifact: IntegrationArtifact }) {
  const labels = { Schema: 'XS', Map: '↔', Assembly: 'DL', Certificate: '◇' }
  return <span className={`artifact-icon artifact-${artifact.type.toLowerCase()}`}>{labels[artifact.type]}</span>
}

export default function IntegrationEstate({ workflows }: { workflows: Workflow[] }) {
  const [search, setSearch] = useState('')
  const [subscription, setSubscription] = useState('All subscriptions')
  const [region, setRegion] = useState('All regions')
  const [expanded, setExpanded] = useState<string[]>([workflows[0]?.logicAppName])
  const [activeTabs, setActiveTabs] = useState<Record<string, EstateTab>>({})
  const unique = (items: string[]) => [...new Set(items)].sort()

  const filtered = useMemo(() => workflows.filter((workflow) => {
    const dependencies = flowDependencies.filter((item) => item.workflowIds.includes(workflow.id))
    const connections = flowConnections.filter((item) => item.workflowIds.includes(workflow.id))
    const artifacts = integrationArtifacts.filter((item) => item.workflowIds.includes(workflow.id))
    const haystack = `${workflow.logicAppName} ${workflow.name} ${workflow.resourceGroup} ${dependencies.map((item) => item.name).join(' ')} ${connections.map((item) => item.name).join(' ')} ${artifacts.map((item) => item.name).join(' ')}`.toLowerCase()
    return (!search || haystack.includes(search.toLowerCase()))
      && (subscription === 'All subscriptions' || workflow.subscription === subscription)
      && (region === 'All regions' || workflow.region === region)
  }), [region, search, subscription, workflows])

  const logicApps = unique(filtered.map((workflow) => workflow.logicAppName)).map((name) => ({ name, workflows: filtered.filter((workflow) => workflow.logicAppName === name) }))
  const artifactCount = integrationArtifacts.filter((item) => item.workflowIds.some((id) => filtered.some((workflow) => workflow.id === id))).length
  const connectionCount = flowConnections.filter((item) => item.workflowIds.some((id) => filtered.some((workflow) => workflow.id === id))).length
  const systemCount = flowDependencies.filter((item) => item.workflowIds.some((id) => filtered.some((workflow) => workflow.id === id))).length
  const toggle = (name: string) => setExpanded((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name])

  return <div className="integration-estate-view">
    <section className="estate-summary">
      <article><span className="estate-summary-icon apps">LA</span><div><span>Logic Apps</span><strong>{logicApps.length}</strong><small>Across {unique(filtered.map((item) => item.subscription)).length} subscriptions</small></div></article>
      <article><span className="estate-summary-icon workflows">⌁</span><div><span>Workflows</span><strong>{filtered.length}</strong><small>{filtered.filter((item) => item.health === 'Healthy').length} currently healthy</small></div></article>
      <article><span className="estate-summary-icon systems">◇</span><div><span>Dependent systems</span><strong>{systemCount}</strong><small>Azure and external</small></div></article>
      <article><span className="estate-summary-icon connections">↗</span><div><span>Connections</span><strong>{connectionCount}</strong><small>Connector instances</small></div></article>
      <article><span className="estate-summary-icon artifacts">{`{}`}</span><div><span>Artifacts</span><strong>{artifactCount}</strong><small>Schemas, maps, DLLs</small></div></article>
    </section>

    <section className="estate-filter"><div className="estate-search">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Logic Apps, workflows, systems, connections, or artifacts…" /></div><select value={subscription} onChange={(event) => setSubscription(event.target.value)}><option>All subscriptions</option>{unique(workflows.map((item) => item.subscription)).map((item) => <option key={item}>{item}</option>)}</select><select value={region} onChange={(event) => setRegion(event.target.value)}><option>All regions</option>{unique(workflows.map((item) => item.region)).map((item) => <option key={item}>{item}</option>)}</select><button onClick={() => { setSearch(''); setSubscription('All subscriptions'); setRegion('All regions') }}>Clear</button></section>

    <section className="estate-inventory"><header><div><h2>Logic App inventory</h2><p>Expand a Logic App to inspect its workflows and integration footprint</p></div><span>{logicApps.length} Logic Apps · {filtered.length} workflows</span></header>{logicApps.map((logicApp) => {
      const isExpanded = expanded.includes(logicApp.name)
      const health = estateHealth(logicApp.workflows)
      const dependencies = flowDependencies.filter((item) => item.workflowIds.some((id) => logicApp.workflows.some((workflow) => workflow.id === id)))
      const connections = flowConnections.filter((item) => item.workflowIds.some((id) => logicApp.workflows.some((workflow) => workflow.id === id)))
      const artifacts = integrationArtifacts.filter((item) => item.workflowIds.some((id) => logicApp.workflows.some((workflow) => workflow.id === id)))
      const tab = activeTabs[logicApp.name] ?? 'Workflows'
      return <article className={`logic-app-estate ${isExpanded ? 'expanded' : ''}`} key={logicApp.name}>
        <button className="logic-app-estate-head" onClick={() => toggle(logicApp.name)}><span className="logic-app-cube">LA</span><span><strong>{logicApp.name}</strong><small>{logicApp.workflows[0].subscription} · {logicApp.workflows[0].resourceGroup} · {logicApp.workflows[0].region}</small></span><span className="logic-app-type">{logicApp.workflows[0].type}</span><span className="logic-app-counts"><b>{logicApp.workflows.length}</b><small>workflows</small></span><span className="logic-app-counts"><b>{dependencies.length}</b><small>systems</small></span><span className="logic-app-counts"><b>{artifacts.length}</b><small>artifacts</small></span><Status health={health}/><b className="estate-chevron">⌄</b></button>
        {isExpanded && <div className="logic-app-estate-body"><nav>{(['Workflows', 'Connections', 'Systems', 'Artifacts'] as EstateTab[]).map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setActiveTabs((tabs) => ({ ...tabs, [logicApp.name]: item }))}>{item}<span>{item === 'Workflows' ? logicApp.workflows.length : item === 'Connections' ? connections.length : item === 'Systems' ? dependencies.length : artifacts.length}</span></button>)}</nav>
          {tab === 'Workflows' && <div className="estate-workflows"><div className="estate-row header"><span>Workflow</span><span>Trigger</span><span>Health</span><span>Connections</span><span>Systems</span><span>Artifacts</span></div>{logicApp.workflows.map((workflow) => { const workflowConnections = flowConnections.filter((item) => item.workflowIds.includes(workflow.id)); const workflowSystems = flowDependencies.filter((item) => item.workflowIds.includes(workflow.id)); const workflowArtifacts = integrationArtifacts.filter((item) => item.workflowIds.includes(workflow.id)); return <div className="estate-row" key={workflow.id}><div><span className="workflow-node">⌁</span><span><strong>{workflow.name}</strong><small>{workflow.description}</small></span></div><span>{workflow.trigger}</span><Status health={workflow.health}/><span className="estate-chip-stack">{workflowConnections.slice(0, 2).map((item) => <i key={item.id}>{item.connector}</i>)}{workflowConnections.length > 2 && <b>+{workflowConnections.length - 2}</b>}</span><span className="estate-chip-stack">{workflowSystems.slice(0, 2).map((item) => <i key={item.id}>{item.name}</i>)}{workflowSystems.length > 2 && <b>+{workflowSystems.length - 2}</b>}</span><span className="artifact-mini-stack">{workflowArtifacts.map((item) => <ArtifactIcon artifact={item} key={item.id}/>)}</span></div> })}</div>}
          {tab === 'Connections' && <div className="estate-card-grid">{connections.map((item) => <div className="estate-detail-card" key={item.id}><span className={`detail-mark mark-${item.kind.toLowerCase()}`}>↗</span><div><strong>{item.name}</strong><small>{item.connector} · {item.kind}</small></div><span className={`connection-health ${item.health.toLowerCase()}`}><i/>{item.health}</span><b>{item.operations24h.toLocaleString()}<small> ops</small></b></div>)}</div>}
          {tab === 'Systems' && <div className="estate-card-grid">{dependencies.map((item) => <div className="estate-detail-card" key={item.id}><span className={`detail-mark mark-${item.kind.toLowerCase()}`}>{item.kind === 'Azure' ? 'AZ' : 'EX'}</span><div><strong>{item.name}</strong><small>{item.service}</small></div><span className={`system-kind kind-${item.kind.toLowerCase()}`}>{item.kind}</span><b className="system-role">{item.role}</b></div>)}</div>}
          {tab === 'Artifacts' && <div className="estate-artifact-grid">{artifacts.map((item) => <div className="estate-artifact-card" key={item.id}><ArtifactIcon artifact={item}/><div><strong>{item.name}</strong><small>{item.location}</small></div><span>{item.type}</span><b>v{item.version}</b><em className={item.status.toLowerCase()}>{item.status}</em></div>)}</div>}
        </div>}
      </article>
    })}{logicApps.length === 0 && <div className="estate-empty"><strong>No integration assets found</strong><span>Change or clear the inventory filters.</span></div>}</section>
  </div>
}
