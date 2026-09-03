import { flowConnections, flowDependencies } from '../data/businessFlows'
import { integrationArtifacts } from '../data/integrationEstate'
import type { BusinessFlow, FlowConnection, FlowDependency, IntegrationArtifact, Workflow } from '../types/hub'
import './BusinessFlowTopologyGraph.css'

const artifactMark = (artifact: IntegrationArtifact) => artifact.type === 'Schema' ? 'XS' : artifact.type === 'Map' ? 'MAP' : artifact.type === 'Assembly' ? 'DLL' : 'CER'

function SystemRoute({ system, connections }: { system: FlowDependency; connections: FlowConnection[] }) {
  return <article className={`graph-system graph-system-${system.kind.toLowerCase()}`}>
    <span className="graph-system-mark">{system.kind === 'Azure' ? 'AZ' : 'EX'}</span>
    <div className="graph-system-copy"><strong>{system.name}</strong><small>{system.service}</small></div>
    <div className="graph-connection-list">{connections.map((connection) => <span className="graph-connection" key={connection.id} title={`${connection.name} is ${connection.health.toLowerCase()}`}><i className={connection.health.toLowerCase()} />{connection.name}<small>{connection.connector}</small></span>)}</div>
  </article>
}

function RouteColumn({ systems, connections, emptyLabel }: { systems: FlowDependency[]; connections: FlowConnection[]; emptyLabel: string }) {
  if (!systems.length) return <div className="graph-empty">{emptyLabel}</div>
  return <div className="graph-route-stack">{systems.map((system) => <SystemRoute key={system.id} system={system} connections={connections.filter((connection) => system.connectionIds.includes(connection.id))} />)}</div>
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
    <section className="topology-canvas"><header><div><h3>End-to-end dependency graph</h3><p>System routes and design-time artifacts for {flow.name}</p></div><div className="topology-legend"><span><i className="source" />Source</span><span><i className="connection" />Connection</span><span><i className="workflow" />Workflow</span><span><i className="artifact" />Artifact</span><span><i className="target" />Target</span></div></header>
      <div className="topology-stage">
        <div className="graph-column-head"><span>SOURCE SYSTEMS</span><span /><strong>LOGIC APPS &amp; WORKFLOWS</strong><span /><span>TARGET SYSTEMS</span></div>
        <div className="graph-lanes">{members.map((workflow) => {
          const workflowSources = sourceSystems.filter((system) => system.workflowIds.includes(workflow.id))
          const workflowTargets = targetSystems.filter((system) => system.workflowIds.includes(workflow.id))
          const workflowConnections = connections.filter((connection) => connection.workflowIds.includes(workflow.id))
          const workflowArtifacts = artifacts.filter((artifact) => artifact.workflowIds.includes(workflow.id))
          return <article className="graph-lane" key={workflow.id}>
            <RouteColumn systems={workflowSources} connections={workflowConnections} emptyLabel="No inbound system" />
            <span className="graph-arrow" aria-hidden="true">→</span>
            <section className="graph-workflow">
              <div className="graph-logic-app"><span>LA</span><div><small>LOGIC APP</small><strong>{workflow.logicAppName}</strong></div></div>
              <div className="graph-workflow-title"><span>WF</span><div><strong>{workflow.name}</strong><small>{workflow.trigger} trigger · {workflow.health}</small></div></div>
              <div className="graph-artifacts"><small>LINKED ARTIFACTS</small>{workflowArtifacts.length ? <div>{workflowArtifacts.map((artifact) => <span className={`graph-artifact artifact-${artifact.status.toLowerCase()}`} key={artifact.id} title={`${artifact.location} · ${artifact.status}`}><b>{artifactMark(artifact)}</b><span>{artifact.name}<small>{artifact.type} · v{artifact.version}</small></span></span>)}</div> : <em>No artifacts linked</em>}</div>
            </section>
            <span className="graph-arrow" aria-hidden="true">→</span>
            <RouteColumn systems={workflowTargets} connections={workflowConnections} emptyLabel="No outbound system" />
          </article>
        })}</div>
        {supportingSystems.length > 0 && <section className="graph-supporting"><div><span>SUPPORTING SERVICES</span><small>Referenced by workflows without carrying the business message</small></div><div>{supportingSystems.map((system) => <article key={system.id}><span>{system.kind === 'Azure' ? 'AZ' : 'EX'}</span><div><strong>{system.name}</strong><small>{system.role} · {system.workflowIds.filter((id) => flow.workflowIds.includes(id)).length} workflows</small></div></article>)}</div></section>}
      </div>
    </section>
    <section className="topology-note"><span>i</span><p><strong>Prototype topology</strong>Relationships are derived from fictional workflow, connection, dependency, and artifact metadata. A production implementation should build this graph from Azure Resource Graph, Logic Apps definitions, and Application Insights telemetry.</p></section>
  </div>
}