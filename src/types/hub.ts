export type Health = 'Healthy' | 'Warning' | 'Critical' | 'Disabled'
export type RunStatus = 'Succeeded' | 'Failed' | 'Running' | 'Cancelled'
export type Environment = 'Production' | 'Staging' | 'Development'

export interface Workflow {
  id: string
  name: string
  logicAppName: string
  description: string
  health: Health
  environment: Environment
  subscription: string
  resourceGroup: string
  region: string
  type: 'Consumption' | 'Standard'
  trigger: string
  successRate: number
  runs24h: number
  failed24h: number
  avgDuration: string
  lastRun: string
  trend: number[]
  tags: string[]
}

export interface WorkflowRun {
  id: string
  workflowId: string
  workflowName: string
  status: RunStatus
  started: string
  duration: string
  trigger: string
  correlationId: string
}

export interface HubAlert {
  id: string
  severity: 'Critical' | 'Warning' | 'Info'
  title: string
  workflowName: string
  message: string
  time: string
}

export type SystemKind = 'Azure' | 'External'
export type ConnectionHealth = 'Connected' | 'Degraded'

export interface FlowConnection {
  id: string
  name: string
  connector: string
  kind: SystemKind
  health: ConnectionHealth
  workflowIds: string[]
  operations24h: number
}

export interface FlowDependency {
  id: string
  name: string
  service: string
  kind: SystemKind
  role: string
  workflowIds: string[]
}

export interface BusinessFlow {
  id: string
  name: string
  description: string
  owner: string
  workflowIds: string[]
  connectionIds: string[]
  dependencyIds: string[]
  createdAt: string
}

export type ArtifactType = 'Schema' | 'Map' | 'Assembly' | 'Certificate'

export interface IntegrationArtifact {
  id: string
  name: string
  type: ArtifactType
  version: string
  workflowIds: string[]
  location: string
  status: 'Active' | 'Review'
}
