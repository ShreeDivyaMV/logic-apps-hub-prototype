export type Health = 'Healthy' | 'Warning' | 'Critical'
export type Tab = 'Operational insights' | 'Run analytics' | 'AI Insights'

export interface Workflow {
  id: string
  name: string
  description: string
  trigger: string
  health: Health
  runs: number
  failures: number
  running: number
  successRate: number
  avgDuration: string
  lastRun: string
  trend: number[]
}

export const logicApp = {
  name: 'Commerce Integration',
  type: 'Standard',
  environment: 'Production',
  subscription: 'Contoso Commerce',
  subscriptionId: '7c4f8d1a-2b91-4f37-9c16-81e6d9a2f440',
  resourceGroup: 'rg-commerce-prod',
  region: 'East US 2',
  runtimeUrl: 'commerce-integration.azurewebsites.net',
  appServicePlan: 'asp-commerce-prod-p1v3',
  state: 'Running',
  healthCheck: 'Not configured',
  operatingSystem: 'Windows',
  runtimeVersion: '4.852.100.26380',
  mcpServer: 'Not configured',
  tags: 'No tags assigned',
}

export const logicAppHealth = {
  status: 'Healthy',
  availability: 99.98,
  cpuPercent: 38,
  cpuPeakPercent: 67,
  memoryPercent: 54,
  memoryUsed: '1.7 GB',
  memoryTotal: '3.2 GB',
  workers: 3,
  checkedAt: '18 seconds ago',
}

export const commonFailures = [
  { id: 'throttling', title: 'Connector throttling', count: 11, workflows: ['returns', 'payments'], cause: 'Dataverse and settlement endpoints returned rate-limit responses.', recommendation: 'Add exponential retry with jitter and reduce concurrent connector calls.' },
  { id: 'schema', title: 'Schema validation', count: 6, workflows: ['orders', 'inventory'], cause: 'Incoming payloads omitted required product or warehouse identifiers.', recommendation: 'Validate at ingress and route invalid messages to a review queue.' },
  { id: 'timeout', title: 'Downstream timeout', count: 4, workflows: ['payments', 'orders'], cause: 'ERP and settlement responses exceeded the configured action timeout.', recommendation: 'Use an asynchronous callback pattern and raise the timeout warning threshold.' },
]

export const recentFailures = [
  { id: 'run-9839', workflowId: 'returns', occurred: '2 min ago', operation: 'Update return record', code: 'HTTP 429', message: 'Dataverse request limit exceeded.', recommendation: 'Retry after 30 seconds using the connector retry policy.' },
  { id: 'run-9834', workflowId: 'payments', occurred: '8 min ago', operation: 'Post settlement batch', code: 'GatewayTimeout', message: 'Settlement API did not respond within 30 seconds.', recommendation: 'Check endpoint latency and move settlement posting to an async branch.' },
  { id: 'run-9818', workflowId: 'inventory', occurred: '34 min ago', operation: 'Validate inventory snapshot', code: 'InvalidPayload', message: 'Warehouse identifier was missing for 14 items.', recommendation: 'Reject incomplete snapshots at the source and alert the warehouse owner.' },
]

export const workflows: Workflow[] = [
  { id: 'orders', name: 'Order Fulfillment', description: 'Validates orders and coordinates ERP and warehouse fulfillment.', trigger: 'Service Bus', health: 'Healthy', runs: 1842, failures: 3, running: 2, successRate: 99.8, avgDuration: '1.2s', lastRun: '32 sec ago', trend: [70, 82, 77, 91, 85, 94, 89, 97, 93, 99] },
  { id: 'notifications', name: 'Customer Notifications', description: 'Routes transactional email and SMS by customer preference.', trigger: 'Service Bus', health: 'Healthy', runs: 483, failures: 0, running: 1, successRate: 99.9, avgDuration: '930ms', lastRun: '4 min ago', trend: [92, 96, 95, 98, 97, 100, 99, 98, 100, 99] },
  { id: 'returns', name: 'Return Authorization', description: 'Validates returns and synchronizes authorization status with commerce systems.', trigger: 'HTTP request', health: 'Warning', runs: 214, failures: 9, running: 3, successRate: 95.8, avgDuration: '3.8s', lastRun: '7 min ago', trend: [97, 96, 94, 98, 93, 91, 95, 92, 96, 94] },
  { id: 'inventory', name: 'Inventory Synchronization', description: 'Synchronizes available-to-promise inventory between warehouse and storefront channels.', trigger: 'Recurrence', health: 'Healthy', runs: 720, failures: 2, running: 1, successRate: 99.7, avgDuration: '2.1s', lastRun: '2 min ago', trend: [95, 97, 98, 96, 99, 98, 97, 99, 100, 98] },
  { id: 'payments', name: 'Payment Reconciliation', description: 'Reconciles captured payments against ERP settlement batches and exceptions.', trigger: 'Event Grid', health: 'Warning', runs: 356, failures: 7, running: 2, successRate: 98.0, avgDuration: '4.6s', lastRun: '5 min ago', trend: [96, 97, 95, 94, 98, 96, 93, 97, 95, 98] },
  { id: 'customers', name: 'Customer Profile Sync', description: 'Propagates consented customer profile updates to engagement platforms.', trigger: 'Dataverse', health: 'Healthy', runs: 628, failures: 1, running: 1, successRate: 99.8, avgDuration: '1.7s', lastRun: '1 min ago', trend: [98, 99, 97, 100, 99, 98, 100, 99, 98, 100] },
]

export const runs = [
  { id: 'run-9841', workflowId: 'orders', status: 'Succeeded', started: '10:42:18 AM', duration: '1.1s', correlationId: '3bd8-84ac' },
  { id: 'run-9840', workflowId: 'notifications', status: 'Succeeded', started: '10:41:54 AM', duration: '891ms', correlationId: '42be-812f' },
  { id: 'run-9839', workflowId: 'returns', status: 'Failed', started: '10:40:11 AM', duration: '6.2s', correlationId: 'c920-aa14' },
  { id: 'run-9838', workflowId: 'orders', status: 'Succeeded', started: '10:38:03 AM', duration: '1.3s', correlationId: 'f81c-09d7' },
  { id: 'run-9837', workflowId: 'returns', status: 'Succeeded', started: '10:36:45 AM', duration: '3.4s', correlationId: '104e-bf60' },
  { id: 'run-9836', workflowId: 'notifications', status: 'Succeeded', started: '10:31:09 AM', duration: '944ms', correlationId: '89d4-41bd' },
  { id: 'run-9835', workflowId: 'inventory', status: 'Succeeded', started: '10:29:42 AM', duration: '2.0s', correlationId: '62cf-7e31' },
  { id: 'run-9834', workflowId: 'payments', status: 'Failed', started: '10:27:16 AM', duration: '7.8s', correlationId: 'de42-901c' },
  { id: 'run-9833', workflowId: 'customers', status: 'Succeeded', started: '10:25:33 AM', duration: '1.6s', correlationId: 'a833-6b21' },
]

export const connections = [
  { id: 'servicebus', name: 'commerce-events', connector: 'Azure Service Bus', health: 'Connected', workflowIds: ['orders', 'notifications'], operations: 2325 },
  { id: 'sap', name: 'sap-production', connector: 'SAP ERP', health: 'Connected', workflowIds: ['orders', 'returns'], operations: 2056 },
  { id: 'sendgrid', name: 'transactional-messaging', connector: 'SendGrid', health: 'Connected', workflowIds: ['notifications'], operations: 483 },
  { id: 'dataverse', name: 'commerce-dataverse', connector: 'Microsoft Dataverse', health: 'Degraded', workflowIds: ['returns'], operations: 214 },
  { id: 'warehouse', name: 'warehouse-inventory', connector: 'Azure SQL', health: 'Connected', workflowIds: ['inventory'], operations: 720 },
  { id: 'eventgrid', name: 'payment-events', connector: 'Azure Event Grid', health: 'Connected', workflowIds: ['payments'], operations: 356 },
  { id: 'payments-api', name: 'payment-settlement', connector: 'Custom REST API', health: 'Degraded', workflowIds: ['payments'], operations: 349 },
  { id: 'dynamics', name: 'customer-engagement', connector: 'Dynamics 365', health: 'Connected', workflowIds: ['customers'], operations: 628 },
]

export const systems = [
  { id: 'storefront', name: 'Contoso Storefront', type: 'External', direction: 'Source', workflowIds: ['orders', 'returns'], connectionIds: ['servicebus', 'dataverse'] },
  { id: 'servicebus', name: 'Commerce Event Bus', type: 'Azure', direction: 'Source', workflowIds: ['orders', 'notifications'], connectionIds: ['servicebus'] },
  { id: 'sap', name: 'SAP S/4HANA', type: 'External', direction: 'Target', workflowIds: ['orders', 'returns'], connectionIds: ['sap'] },
  { id: 'sendgrid', name: 'SendGrid', type: 'External', direction: 'Target', workflowIds: ['notifications'], connectionIds: ['sendgrid'] },
  { id: 'dataverse', name: 'Commerce Dataverse', type: 'Azure', direction: 'Target', workflowIds: ['returns'], connectionIds: ['dataverse'] },
  { id: 'warehouse-db', name: 'Warehouse Inventory', type: 'Azure', direction: 'Source', workflowIds: ['inventory'], connectionIds: ['warehouse'] },
  { id: 'payment-gateway', name: 'Payment Gateway', type: 'External', direction: 'Source', workflowIds: ['payments'], connectionIds: ['eventgrid'] },
  { id: 'commerce-api', name: 'Commerce Inventory API', type: 'Azure', direction: 'Target', workflowIds: ['inventory'], connectionIds: ['warehouse'] },
  { id: 'settlement', name: 'Settlement Service', type: 'External', direction: 'Target', workflowIds: ['payments'], connectionIds: ['payments-api'] },
  { id: 'dynamics', name: 'Dynamics 365 Customer', type: 'External', direction: 'Target', workflowIds: ['customers'], connectionIds: ['dynamics'] },
]

export const artifacts = [
  { id: 'order-schema', name: 'Order.v3.xsd', type: 'Schema', version: '3.2', status: 'Active', workflowIds: ['orders'] },
  { id: 'order-map', name: 'OrderToSAP.liquid', type: 'Map', version: '2.4', status: 'Active', workflowIds: ['orders'] },
  { id: 'commerce-dll', name: 'Contoso.Commerce.Transforms.dll', type: 'Assembly', version: '5.1.0', status: 'Active', workflowIds: ['orders', 'notifications'] },
  { id: 'notification-schema', name: 'NotificationRequest.json', type: 'Schema', version: '2.6', status: 'Active', workflowIds: ['notifications'] },
  { id: 'return-schema', name: 'ReturnAuthorization.json', type: 'Schema', version: '1.8', status: 'Active', workflowIds: ['returns'] },
  { id: 'return-map', name: 'ReturnToERP.xslt', type: 'Map', version: '3.1', status: 'Review', workflowIds: ['returns'] },
  { id: 'inventory-schema', name: 'InventorySnapshot.json', type: 'Schema', version: '2.1', status: 'Active', workflowIds: ['inventory'] },
  { id: 'payment-map', name: 'SettlementToERP.liquid', type: 'Map', version: '1.6', status: 'Review', workflowIds: ['payments'] },
  { id: 'customer-schema', name: 'CustomerProfile.json', type: 'Schema', version: '4.0', status: 'Active', workflowIds: ['customers'] },
]

export const traceHops = [
  { kind: 'Source', name: 'Contoso Storefront', detail: 'Order submitted', duration: '0ms', timestamp: '10:42:18.042', status: 'Accepted', operationId: 'op-7c91', protocol: 'HTTPS POST', retries: 0, payload: '18.4 KB', diagnostic: 'Request authenticated with managed identity.' },
  { kind: 'Connection', name: 'commerce-events', detail: 'Message received', duration: '34ms', timestamp: '10:42:18.076', status: 'Succeeded', operationId: 'op-7c92', protocol: 'AMQP 1.0', retries: 0, payload: '17.9 KB', diagnostic: 'Message lock acquired; delivery count 1.' },
  { kind: 'Workflow', name: 'Order Fulfillment', detail: 'Order validated', duration: '188ms', timestamp: '10:42:18.264', status: 'Succeeded', operationId: 'op-7c93', protocol: 'Workflow action', retries: 0, payload: '16.2 KB', diagnostic: 'Schema Order.v3.xsd passed with no warnings.' },
  { kind: 'Connection', name: 'sap-production', detail: 'ERP request sent', duration: '612ms', timestamp: '10:42:18.876', status: 'Succeeded', operationId: 'op-7c94', protocol: 'SAP RFC', retries: 1, payload: '12.7 KB', diagnostic: 'First attempt throttled for 82ms; retry succeeded.' },
  { kind: 'Target', name: 'SAP S/4HANA', detail: 'Order created', duration: '1.1s', timestamp: '10:42:19.142', status: 'Completed', operationId: 'op-7c95', protocol: 'BAPI', retries: 0, payload: '3.1 KB', diagnostic: 'Sales order 470009841 committed successfully.' },
]

export const insights = [
  { severity: 'Attention', title: 'Return failures are clustered', body: 'Seven of nine failures occurred after Dataverse throttling responses.', workflowId: 'returns', evidence: '95.8% success · 9 failed runs' },
  { severity: 'Positive', title: 'Notification delivery is stable', body: 'No failures detected across 483 executions in the last 24 hours.', workflowId: 'notifications', evidence: '99.9% success · 930ms average' },
  { severity: 'Opportunity', title: 'Order transform can be streamlined', body: 'The SAP mapping action contributes 41% of average workflow duration.', workflowId: 'orders', evidence: '492ms transform duration' },
  { severity: 'Positive', title: 'Inventory cadence is stable', body: 'Scheduled inventory snapshots have remained within the two-minute processing target.', workflowId: 'inventory', evidence: '99.7% success · 2.1s average' },
  { severity: 'Attention', title: 'Settlement retries are increasing', body: 'The payment settlement API generated six transient retry sequences this hour.', workflowId: 'payments', evidence: '7 failures · 4.6s average' },
  { severity: 'Positive', title: 'Profile synchronization is healthy', body: 'Customer updates are reaching Dynamics without material queue growth.', workflowId: 'customers', evidence: '99.8% success · 1.7s average' },
]
