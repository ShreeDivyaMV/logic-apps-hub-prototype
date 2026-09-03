import { flowConnections, flowDependencies } from '../data/businessFlows'
import { integrationArtifacts } from '../data/integrationEstate'
import type { BusinessFlow, FlowConnection, FlowDependency, IntegrationArtifact, Workflow } from '../types/hub'
import './BusinessFlowTopologyGraph.css'

const artifactMark = (artifact: IntegrationArtifact) => artifact.type === 'Schema' ? 'XS' : artifact.type === 'Map' ? 'MAP' : artifact.type === 'Assembly' ? 'DLL' : 'CER'

function SystemNode({ system, connections, workflows, side }: { system: FlowDependency; connections: FlowConnection[]; workflows: Workflow[]; side: 'source' | 'target' }) {
  const routes = workflows.filter((workflow) => system.workflowIds.includes(workflow.id))
  return <article className={`graph-system graph-system-${system.kind.toLowerCase()}`}>
    <header><span className="graph-system-mark">{system.kind === 'Azure' ? 'AZ' : 'EX'}</span><div><strong>{system.name}</strong><small>{system.service}</small></div></header>
    <div className="graph-system-routes">{routes.map((workflow) => {
      const routeConnections = connections.filter((connection) => system.connectionIds.includes(connection.id) && connection.workflowIds.includes(workflow.id))
      return <div className={`graph-system-route route-${side}`} key={workflow.id}>
        {side === 'target' && <span className="route-workflow">{workflow.name}</span>}
        {side === 'target' && <b aria-hidden="true">→</b>}
        <span className="route-connection">{routeConnections.length ? routeConnections.map((item) => item.name).join(', ') : 'Direct reference'}</span>
        {side === 'source' && <b aria-hidden="true">→</b>}
        {side === 'source' && <span className="route-workflow">{workflow.name}</span>}
      </div>
    })}</div>
  </article>
}

export default function BusinessFlowTopology({ flow, workflows }: { flow: BusinessFlow; workflows: Workflow[] }) {
  const members = workflows.filter((workflow) => flow.workflowIds.includes(workflow.id))
  const logicApps = [...new Set(members.map((workflow) => workflow.logicAppName))]
  const systems = flowDependencies.filter((item) => flow.dependencyIds.includes(item.id))
  const connections = flowConnections.filter((item) => flow.connectionIds.includes(item.id))
  const artifacts = integrationArtifacts.filter((item) => item.workflowIds.some((id) => flow.workflowIds.includes(id)))
  const supportingSystems = systems.filter((item) => item.direction === 'Supporting')
  const sourceSystems = systems.filter((item) => item.direction === 'Source' || item.direction === 'Both')
  const targetSystems = systems.filter((item) => item.direction === 'Target' || item.direction === 'Both')
  const nodeCount = logicApps.length + members.length + systems.length + connections.length + artifacts.length

  return <div className="flow-topology-view">
    <section className="topology-summary"><div><span>Topology nodes</span><strong>{nodeCount}</strong><small>Across the complete flow</small></div><div><span>Logic Apps / workflows</span><strong>{logicApps.length} / {members.length}</strong><small>Runtime components</small></div><div><span>Source / target systems</span><strong>{sourceSystems.length} / {targetSystems.length}</strong><small>Message endpoints</small></div><div><span>Linked artifacts</span><strong>{artifacts.length}</strong><small>Schemas, maps, and assemblies</small></div></section>
    <section className="topology-canvas"><header><div><h3>End-to-end dependency graph</h3><p>Connected system routes centered on the Logic Apps in {flow.name}</p></div><div className="topology-legend"><span><i className="source" />Source</span><span><i className="connection" />Connection</span><span><i className="workflow" />Workflow</span><span><i className="artifact" />Artifact</span><span><i className="target" />Target</span></div></header>
      <div className="topology-stage">
        <div className="graph-column-head"><span>SOURCE SYSTEMS</span><strong>LOGIC APPS &amp; WORKFLOWS</strong><span>TARGET SYSTEMS</span></div>
        <div className="graph-map">
          <section className="graph-system-column graph-sources">{sourceSystems.length ? sourceSystems.map((system) => <SystemNode key={system.id} system={system} connections={connections} workflows={members} side="source" />) : <div className="graph-empty">No source systems</div>}</section>
          <section className="graph-logic-apps">{logicApps.map((logicApp) => {
            const appWorkflows = members.filter((workflow) => workflow.logicAppName === logicApp)
            return <article className="graph-logic-app" key={logicApp}>
              <header><span>LA</span><div><small>LOGIC APP</small><strong>{logicApp}</strong><em>{appWorkflows[0].type} · {appWorkflows[0].environment}</em></div><b>{appWorkflows.length} workflow{appWorkflows.length === 1 ? '' : 's'}</b></header>
              <div className="graph-workflow-list">{appWorkflows.map((workflow) => <div className="graph-workflow" key={workflow.id}><span>WF</span><div><strong>{workflow.name}</strong><small>{workflow.trigger} trigger · {workflow.health}</small></div><i className={`workflow-health health-${workflow.health.toLowerCase()}`} /></div>)}</div>
            </article>
          })}</section>
          <section className="graph-system-column graph-targets">{targetSystems.length ? targetSystems.map((system) => <SystemNode key={system.id} system={system} connections={connections} workflows={members} side="target" />) : <div className="graph-empty">No target systems</div>}</section>
        </div>
        {supportingSystems.length > 0 && <section className="graph-supporting"><div><span>SUPPORTING SERVICES</span><small>Referenced without carrying the business message</small></div><div>{supportingSystems.map((system) => <article key={system.id}><span>{system.kind === 'Azure' ? 'AZ' : 'EX'}</span><div><strong>{system.name}</strong><small>{system.role} · {system.workflowIds.filter((id) => flow.workflowIds.includes(id)).length} workflows</small></div></article>)}</div></section>}
        <section className="graph-artifact-band"><header><div><span>INTEGRATION ARTIFACTS</span><small>Linked to the workflows that use them</small></div><strong>{artifacts.length} artifacts</strong></header><div>{artifacts.map((artifact) => {
          const owners = members.filter((workflow) => artifact.workflowIds.includes(workflow.id))
          return <article className={`graph-artifact artifact-${artifact.status.toLowerCase()}`} key={artifact.id} title={artifact.location}><b>{artifactMark(artifact)}</b><div><strong>{artifact.name}</strong><small>{artifact.type} · v{artifact.version}</small><span>Used by {owners.map((workflow) => workflow.name).join(', ')}</span></div></article>
        })}</div></section>
      </div>
    </section>
    <section className="topology-note"><span>i</span><p><strong>Prototype topology</strong>Relationships are derived from fictional workflow, connection, dependency, and artifact metadata. A production implementation should build this graph from Azure Resource Graph, Logic Apps definitions, and Application Insights telemetry.</p></section>
  </div>
}
