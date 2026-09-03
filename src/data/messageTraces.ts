import type { CorrelationTrace, MessageHop, MessageHopKind } from '../types/hub'

type HopInput = [MessageHopKind, string, string, string, string, string?, string?, string?]

const hops = (base: string, entries: HopInput[]): MessageHop[] => entries.map((entry, index) => ({
  id: `${base}-${index + 1}`,
  sequence: index + 1,
  kind: entry[0],
  name: entry[1],
  detail: entry[2],
  status: entry[3] as MessageHop['status'],
  timestamp: `10:4${index}:1${index}.0${index}Z`,
  duration: entry[4],
  workflowId: entry[5],
  connectionId: entry[6],
  systemId: entry[7],
  payload: index === 0 ? 'application/json · 4.8 KB · message accepted' : index === entries.length - 1 ? 'application/json · 2.1 KB · response recorded' : 'application/json · validated · PII masked',
}))

export const correlationTraces: CorrelationTrace[] = [
  {
    correlationId: 'corr-7a12-ef09-2026', businessFlowId: 'flow-order-to-cash', messageType: 'OrderCreated.v3', started: '10:40:10 AM', elapsed: '14.8s', status: 'Succeeded', source: 'Commerce API', destination: 'SendGrid',
    hops: hops('trace-order-1', [
      ['External System', 'Commerce API', 'Order 104982 received', 'Succeeded', '82ms', undefined, undefined, 'dep-warehouse'],
      ['Connection', 'commerce-events', 'Published to orders topic', 'Succeeded', '126ms', undefined, 'conn-servicebus'],
      ['Logic App', 'Commerce Integration', 'Standard Logic App host', 'Succeeded', '31ms', 'wf-orders'],
      ['Workflow', 'Order Fulfillment', 'Validated order and reserved stock', 'Succeeded', '1.2s', 'wf-orders'],
      ['External System', 'SAP S/4HANA', 'Sales order 780032 created', 'Succeeded', '4.8s', undefined, 'conn-sap', 'dep-sap'],
      ['Logic App', 'Finance Automation', 'Standard Logic App host', 'Succeeded', '28ms', 'wf-invoices'],
      ['Workflow', 'Invoice Processing', 'Invoice posted and archived', 'Succeeded', '7.4s', 'wf-invoices'],
      ['Workflow', 'Customer Notifications', 'Confirmation message composed', 'Succeeded', '612ms', 'wf-notifications'],
      ['External System', 'SendGrid', 'Order confirmation accepted', 'Succeeded', '491ms', undefined, 'conn-sendgrid', 'dep-sendgrid'],
    ]),
  },
  {
    correlationId: 'corr-c920-aa14-2026', businessFlowId: 'flow-order-to-cash', messageType: 'InvoiceReady.v2', started: '10:35:21 AM', elapsed: '12.6s', status: 'Failed', source: 'Order Fulfillment', destination: 'SAP S/4HANA',
    hops: hops('trace-order-2', [
      ['Workflow', 'Order Fulfillment', 'Fulfillment completed', 'Succeeded', '1.1s', 'wf-orders'],
      ['Connection', 'commerce-events', 'Invoice event delivered', 'Succeeded', '109ms', undefined, 'conn-servicebus'],
      ['Logic App', 'Finance Automation', 'Standard Logic App host', 'Succeeded', '24ms', 'wf-invoices'],
      ['Workflow', 'Invoice Processing', 'Transformed canonical invoice', 'Succeeded', '3.7s', 'wf-invoices'],
      ['Connection', 'SAP S/4HANA production', 'ERP request timed out', 'Failed', '7.6s', 'wf-invoices', 'conn-sap', 'dep-sap'],
    ]),
  },
  {
    correlationId: 'corr-42be-812f-2026', businessFlowId: 'flow-customer-engagement', messageType: 'CustomerProfileChanged.v1', started: '10:28:05 AM', elapsed: '44.1s', status: 'Succeeded', source: 'Microsoft Dataverse', destination: 'SendGrid',
    hops: hops('trace-customer-1', [
      ['Connection', 'contoso-crm', 'Customer change detected', 'Succeeded', '204ms', undefined, 'conn-dynamics'],
      ['Logic App', 'Enterprise Synchronization', 'Consumption Logic App host', 'Succeeded', '35ms', 'wf-customer-sync'],
      ['Workflow', 'Customer 360 Sync', 'Canonical profile synchronized', 'Succeeded', '42s', 'wf-customer-sync'],
      ['External System', 'Salesforce Service Cloud', 'Support profile updated', 'Succeeded', '1.1s', undefined, undefined, 'dep-salesforce'],
      ['Logic App', 'Commerce Integration', 'Notification workflow dispatched', 'Succeeded', '29ms', 'wf-notifications'],
      ['Workflow', 'Customer Notifications', 'Preference update email composed', 'Succeeded', '704ms', 'wf-notifications'],
      ['External System', 'SendGrid', 'Email accepted', 'Succeeded', '68ms', undefined, 'conn-sendgrid', 'dep-sendgrid'],
    ]),
  },
  {
    correlationId: 'corr-89d4-41bd-2026', businessFlowId: 'flow-inventory-control', messageType: 'StockMovement.v1', started: '10:22:13 AM', elapsed: '5.7s', status: 'In progress', source: 'Manhattan WMS', destination: 'SAP S/4HANA',
    hops: hops('trace-stock-1', [
      ['External System', 'Manhattan WMS', 'Stock movement published', 'Succeeded', '90ms', undefined, undefined, 'dep-warehouse'],
      ['Connection', 'inventory-events', 'Event Grid delivery', 'Succeeded', '74ms', undefined, 'conn-eventgrid'],
      ['Logic App', 'Supply Chain Operations', 'Standard Logic App host', 'Succeeded', '26ms', 'wf-stock'],
      ['Workflow', 'Inventory Reconciliation', 'Reconciling inventory quantities', 'In progress', '5.5s', 'wf-stock'],
    ]),
  },
]
