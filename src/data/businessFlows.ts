import type { BusinessFlow, FlowConnection, FlowDependency } from '../types/hub'

export const flowConnections: FlowConnection[] = [
  { id: 'conn-servicebus', name: 'commerce-events', connector: 'Azure Service Bus', kind: 'Azure', health: 'Connected', workflowIds: ['wf-orders', 'wf-notifications'], operations24h: 2325 },
  { id: 'conn-dynamics', name: 'contoso-crm', connector: 'Microsoft Dataverse', kind: 'Azure', health: 'Degraded', workflowIds: ['wf-customer-sync'], operations24h: 192 },
  { id: 'conn-storage', name: 'invoice-archive', connector: 'Azure Blob Storage', kind: 'Azure', health: 'Connected', workflowIds: ['wf-invoices', 'wf-vendor'], operations24h: 724 },
  { id: 'conn-eventgrid', name: 'inventory-events', connector: 'Azure Event Grid', kind: 'Azure', health: 'Connected', workflowIds: ['wf-stock'], operations24h: 2214 },
  { id: 'conn-sap', name: 'SAP S/4HANA production', connector: 'SAP ERP', kind: 'External', health: 'Connected', workflowIds: ['wf-orders', 'wf-invoices', 'wf-stock'], operations24h: 4631 },
  { id: 'conn-sftp', name: 'Northwind partner SFTP', connector: 'SFTP-SSH', kind: 'External', health: 'Connected', workflowIds: ['wf-vendor'], operations24h: 0 },
  { id: 'conn-sendgrid', name: 'Transactional messaging', connector: 'SendGrid', kind: 'External', health: 'Connected', workflowIds: ['wf-notifications'], operations24h: 483 },
]

export const flowDependencies: FlowDependency[] = [
  { id: 'dep-servicebus', name: 'sb-commerce-prod', service: 'Azure Service Bus', kind: 'Azure', role: 'Event transport', direction: 'Both', connectionIds: ['conn-servicebus'], workflowIds: ['wf-orders', 'wf-notifications'] },
  { id: 'dep-keyvault', name: 'kv-integration-prod', service: 'Azure Key Vault', kind: 'Azure', role: 'Secret references', direction: 'Supporting', connectionIds: [], workflowIds: ['wf-orders', 'wf-invoices', 'wf-customer-sync', 'wf-stock', 'wf-notifications'] },
  { id: 'dep-storage', name: 'stfinancedocuments', service: 'Azure Storage', kind: 'Azure', role: 'Document archive', direction: 'Target', connectionIds: ['conn-storage'], workflowIds: ['wf-invoices', 'wf-vendor'] },
  { id: 'dep-eventgrid', name: 'eg-inventory-prod', service: 'Azure Event Grid', kind: 'Azure', role: 'Inventory events', direction: 'Source', connectionIds: ['conn-eventgrid'], workflowIds: ['wf-stock'] },
  { id: 'dep-appinsights', name: 'appi-integration-hub', service: 'Application Insights', kind: 'Azure', role: 'Telemetry', direction: 'Supporting', connectionIds: [], workflowIds: ['wf-orders', 'wf-invoices', 'wf-customer-sync', 'wf-stock', 'wf-notifications'] },
  { id: 'dep-sap', name: 'SAP S/4HANA', service: 'SAP ERP', kind: 'External', role: 'Orders, finance & stock', direction: 'Both', connectionIds: ['conn-sap'], workflowIds: ['wf-orders', 'wf-invoices', 'wf-stock'] },
  { id: 'dep-salesforce', name: 'Salesforce Service Cloud', service: 'Salesforce', kind: 'External', role: 'Customer profiles', direction: 'Target', connectionIds: ['conn-dynamics'], workflowIds: ['wf-customer-sync'] },
  { id: 'dep-warehouse', name: 'Manhattan WMS', service: 'Warehouse platform', kind: 'External', role: 'Fulfillment & inventory', direction: 'Target', connectionIds: ['conn-servicebus', 'conn-eventgrid'], workflowIds: ['wf-orders', 'wf-stock'] },
  { id: 'dep-sendgrid', name: 'SendGrid', service: 'Email platform', kind: 'External', role: 'Customer messaging', direction: 'Target', connectionIds: ['conn-sendgrid'], workflowIds: ['wf-notifications'] },
]

export const initialBusinessFlows: BusinessFlow[] = [
  {
    id: 'flow-order-to-cash',
    name: 'Order to cash',
    description: 'End-to-end order orchestration from intake and fulfillment through invoicing and customer notification.',
    owner: 'Commerce Operations',
    workflowIds: ['wf-orders', 'wf-invoices', 'wf-notifications'],
    connectionIds: ['conn-servicebus', 'conn-storage', 'conn-sap', 'conn-sendgrid'],
    dependencyIds: ['dep-servicebus', 'dep-keyvault', 'dep-storage', 'dep-appinsights', 'dep-sap', 'dep-warehouse', 'dep-sendgrid'],
    createdAt: 'Aug 28, 2026',
  },
  {
    id: 'flow-inventory-control',
    name: 'Inventory control tower',
    description: 'Coordinates stock reconciliation with order fulfillment and warehouse event processing.',
    owner: 'Supply Chain',
    workflowIds: ['wf-orders', 'wf-stock'],
    connectionIds: ['conn-servicebus', 'conn-eventgrid', 'conn-sap'],
    dependencyIds: ['dep-servicebus', 'dep-keyvault', 'dep-eventgrid', 'dep-appinsights', 'dep-sap', 'dep-warehouse'],
    createdAt: 'Aug 22, 2026',
  },
  {
    id: 'flow-customer-engagement',
    name: 'Customer engagement',
    description: 'Keeps customer profiles synchronized and delivers event-driven communications across channels.',
    owner: 'Customer Experience',
    workflowIds: ['wf-customer-sync', 'wf-notifications'],
    connectionIds: ['conn-dynamics', 'conn-servicebus', 'conn-sendgrid'],
    dependencyIds: ['dep-servicebus', 'dep-keyvault', 'dep-appinsights', 'dep-salesforce', 'dep-sendgrid'],
    createdAt: 'Aug 18, 2026',
  },
]
