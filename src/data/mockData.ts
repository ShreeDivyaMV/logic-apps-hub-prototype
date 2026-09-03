import type { HubAlert, Workflow, WorkflowRun } from '../types/hub'

export const workflows: Workflow[] = [
  {
    id: 'wf-orders', name: 'Order Fulfillment', logicAppName: 'Commerce Integration', description: 'Validates new orders and coordinates fulfillment across ERP and warehouse systems.',
    health: 'Healthy', environment: 'Production', subscription: 'Contoso Commerce', resourceGroup: 'rg-commerce-prod', region: 'East US 2', type: 'Standard', trigger: 'Service Bus',
    successRate: 99.8, runs24h: 1842, failed24h: 3, avgDuration: '1.2s', lastRun: '32 sec ago', trend: [76, 82, 68, 91, 86, 95, 89, 98, 92, 96, 99, 94], tags: ['commerce', 'tier-1'],
  },
  {
    id: 'wf-invoices', name: 'Invoice Processing', logicAppName: 'Finance Automation', description: 'Extracts invoice data, applies business rules, and posts approved records to finance.',
    health: 'Critical', environment: 'Production', subscription: 'Contoso Finance', resourceGroup: 'rg-finance-prod', region: 'West Europe', type: 'Standard', trigger: 'HTTP request',
    successRate: 91.2, runs24h: 628, failed24h: 55, avgDuration: '8.4s', lastRun: '2 min ago', trend: [96, 95, 93, 94, 90, 88, 92, 89, 91, 87, 90, 91], tags: ['finance', 'document-ai'],
  },
  {
    id: 'wf-customer-sync', name: 'Customer 360 Sync', logicAppName: 'Enterprise Synchronization', description: 'Synchronizes customer profiles between CRM, data platform, and support tools.',
    health: 'Warning', environment: 'Production', subscription: 'Shared Integration', resourceGroup: 'rg-integration-prod', region: 'East US 2', type: 'Consumption', trigger: 'Recurrence',
    successRate: 97.4, runs24h: 96, failed24h: 2, avgDuration: '42s', lastRun: '14 min ago', trend: [99, 98, 99, 97, 96, 98, 97, 95, 98, 97, 96, 97], tags: ['crm', 'sync'],
  },
  {
    id: 'wf-stock', name: 'Inventory Reconciliation', logicAppName: 'Supply Chain Operations', description: 'Reconciles stock movements and publishes discrepancies for warehouse teams.',
    health: 'Healthy', environment: 'Production', subscription: 'Contoso Supply Chain', resourceGroup: 'rg-supply-prod', region: 'Central US', type: 'Standard', trigger: 'Event Grid',
    successRate: 99.5, runs24h: 2214, failed24h: 11, avgDuration: '780ms', lastRun: '8 sec ago', trend: [91, 93, 92, 96, 95, 97, 94, 98, 99, 97, 98, 99], tags: ['inventory', 'events'],
  },
  {
    id: 'wf-notifications', name: 'Customer Notifications', logicAppName: 'Commerce Integration', description: 'Routes transactional email, SMS, and push notifications by customer preference.',
    health: 'Healthy', environment: 'Staging', subscription: 'Contoso Commerce', resourceGroup: 'rg-commerce-stg', region: 'East US 2', type: 'Consumption', trigger: 'Service Bus',
    successRate: 99.9, runs24h: 483, failed24h: 0, avgDuration: '930ms', lastRun: '4 min ago', trend: [98, 99, 99, 98, 100, 99, 100, 99, 100, 100, 99, 100], tags: ['notification', 'omnichannel'],
  },
  {
    id: 'wf-vendor', name: 'Vendor File Intake', logicAppName: 'Enterprise Synchronization', description: 'Receives partner files, validates schemas, and routes records to downstream services.',
    health: 'Disabled', environment: 'Development', subscription: 'Shared Integration', resourceGroup: 'rg-integration-dev', region: 'North Europe', type: 'Standard', trigger: 'SFTP',
    successRate: 100, runs24h: 0, failed24h: 0, avgDuration: '—', lastRun: '3 days ago', trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tags: ['partners', 'files'],
  },
]

export const runs: WorkflowRun[] = [
  { id: 'run-8927', workflowId: 'wf-stock', workflowName: 'Inventory Reconciliation', status: 'Succeeded', started: '10:42:18 AM', duration: '742ms', trigger: 'Event Grid', correlationId: '7a12…ef09' },
  { id: 'run-8926', workflowId: 'wf-orders', workflowName: 'Order Fulfillment', status: 'Succeeded', started: '10:41:54 AM', duration: '1.1s', trigger: 'Service Bus', correlationId: '3bd8…84ac' },
  { id: 'run-8925', workflowId: 'wf-invoices', workflowName: 'Invoice Processing', status: 'Failed', started: '10:40:11 AM', duration: '12.6s', trigger: 'HTTP request', correlationId: 'c920…aa14' },
  { id: 'run-8924', workflowId: 'wf-customer-sync', workflowName: 'Customer 360 Sync', status: 'Running', started: '10:38:03 AM', duration: '2m 18s', trigger: 'Recurrence', correlationId: 'f81c…09d7' },
  { id: 'run-8923', workflowId: 'wf-notifications', workflowName: 'Customer Notifications', status: 'Succeeded', started: '10:36:45 AM', duration: '891ms', trigger: 'Service Bus', correlationId: '42be…812f' },
  { id: 'run-8922', workflowId: 'wf-invoices', workflowName: 'Invoice Processing', status: 'Failed', started: '10:35:28 AM', duration: '9.8s', trigger: 'HTTP request', correlationId: '104e…bf60' },
  { id: 'run-8921', workflowId: 'wf-orders', workflowName: 'Order Fulfillment', status: 'Cancelled', started: '10:31:09 AM', duration: '4.2s', trigger: 'Service Bus', correlationId: '89d4…41bd' },
]

export const alerts: HubAlert[] = [
  { id: 'alert-1', severity: 'Critical', title: 'Failure threshold exceeded', workflowName: 'Invoice Processing', message: 'Failure rate reached 8.8% in the last hour.', time: '4 min ago' },
  { id: 'alert-2', severity: 'Warning', title: 'Connector throttling detected', workflowName: 'Customer 360 Sync', message: 'Dynamics connector returned 429 responses.', time: '18 min ago' },
  { id: 'alert-3', severity: 'Info', title: 'Workflow remains disabled', workflowName: 'Vendor File Intake', message: 'Development workflow has been disabled for 3 days.', time: '2 hr ago' },
]

export const runVolume = [124, 158, 142, 196, 184, 225, 247, 218, 269, 284, 253, 306, 328, 294, 346, 374, 351, 390, 412, 396, 438, 421, 466, 448]
