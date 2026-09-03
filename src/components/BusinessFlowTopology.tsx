import { flowConnections, flowDependencies } from '../data/businessFlows'
import { integrationArtifacts } from '../data/integrationEstate'
import type { BusinessFlow, Workflow } from '../types/hub'
import './BusinessFlowTopology.css'

export default function BusinessFlowTopology({ flow, workflows }: { flow: BusinessFlow; workflows: Workflow[] }) {
  const members = workflows.filter((workflow) => flow.workflowIds.includes(workflow.id))
  const logicApps = [...new Set(members.map((workflow) => workflow.logicAppName))]
  const systems = flowDependencies.filter((item) => flow.dependencyIds.includes(item.id))
  const connections = flowConnections.filter((item) => flow.connectionIds.includes(item.id))
  const artifacts = integrationArtifacts.filter((item) => item.workflowIds.some((id) => flow.workflowIds.includes(id)))
  const nodeCount = logicApps.length + members.length + systems.length + connections.length + artifacts.length

  return <div className="flow-topology-view">
    <section className="topology-summary"><div><span>Topology nodes</span><strong>{nodeCount}</strong><small>Across the complete flow</small></div><div><span>Logic Apps / workflows</span><strong>{logicApps.length} / {members.length}</strong><small>Runtime components</small></div><div><span>Systems / connections</span><strong>{systems.length} / {connections.length}</strong><small>Azure and external</small></div><div><span>Artifacts</span><strong>{artifacts.length}</strong><small>Schemas, maps, and DLLs</small></div></section>
    <section className="topology-canvas"><header><div><h3>End-to-end dependency graph</h3><p>Complete runtime and design-time topology for {flow.name}</p></div><div className="topology-legend"><span><i className="system"/>System</span><span><i className="connection"/>Connection</span><span><i className="logic-app"/>Logic App</span><span><i className="workflow"/>Workflow</span><span><i className="artifact"/>Artifact</span></div></header>
      <div className="topology-stage">
        <div className="topology-column system-column"><h4>DEPENDENT SYSTEMS</h4>{systems.map((item) => <article className={`topology-node node-system node-${item.kind.toLowerCase()}`} key={item.id}><span>{item.kind === 'Azure' ? 'AZ' : 'EX'}</span><div><strong>{item.name}</strong><small>{item.service} · {item.role}</small></div></article>)}</div>
        <div className="topology-links"><span>→</span></div>
        <div className="topology-column connection-column"><h4>CONNECTIONS</h4>{connections.map((item) => <article className="topology-node node-connection" key={item.id}><span>↗</span><div><strong>{item.name}</strong><small>{item.connector}</small></div><em className={item.health.toLowerCase()}>{item.health}</em></article>)}</div>
        <div className="topology-links"><span>→</span></div>
        <div className="topology-column runtime-column"><h4>LOGIC APPS & WORKFLOWS</h4>{logicApps.map((logicApp) => <article className="runtime-group" key={logicApp}><div className="runtime-group-head"><span>LA</span><div><strong>{logicApp}</strong><small>{members.filter((item) => item.logicAppName === logicApp).length} workflows</small></div></div>{members.filter((workflow) => workflow.logicAppName === logicApp).map((workflow) => <div className="runtime-workflow" key={workflow.id}><span>⌁</span><div><strong>{workflow.name}</strong><small>{workflow.trigger} · {workflow.health}</small></div></div>)}</article>)}</div>
        <div className="topology-links"><span>→</span></div>
        <div className="topology-column artifact-column"><h4>ARTIFACTS</h4>{artifacts.map((item) => <article className="topology-node node-artifact" key={item.id}><span>{item.type === 'Schema' ? 'XS' : item.type === 'Map' ? '↔' : item.type === 'Assembly' ? 'DL' : '◇'}</span><div><strong>{item.name}</strong><small>{item.type} · v{item.version}</small></div><em className={item.status.toLowerCase()}>{item.status}</em></article>)}</div>
      </div>
    </section>
    <section className="topology-note"><span>ⓘ</span><p><strong>Prototype topology</strong>Relationships are derived from fictional workflow, connection, dependency, and artifact metadata. A production implementation should build this graph from Azure Resource Graph, Logic Apps definitions, and Application Insights telemetry.</p></section>
  </div>
}
