import type { IntegrationArtifact } from '../types/hub'

export const integrationArtifacts: IntegrationArtifact[] = [
  { id: 'art-order-schema', name: 'Order.v3.xsd', type: 'Schema', version: '3.2', workflowIds: ['wf-orders'], location: 'Integration Account / Commerce', status: 'Active' },
  { id: 'art-order-map', name: 'OrderToSAP.liquid', type: 'Map', version: '2.4', workflowIds: ['wf-orders'], location: 'Artifacts / Maps', status: 'Active' },
  { id: 'art-commerce-dll', name: 'Contoso.Commerce.Transforms.dll', type: 'Assembly', version: '5.1.0', workflowIds: ['wf-orders', 'wf-notifications'], location: 'Logic App / lib/custom', status: 'Active' },
  { id: 'art-invoice-schema', name: 'Invoice.UBL.2.1.xsd', type: 'Schema', version: '2.1', workflowIds: ['wf-invoices'], location: 'Integration Account / Finance', status: 'Active' },
  { id: 'art-invoice-map', name: 'InvoiceToERP.xslt', type: 'Map', version: '4.7', workflowIds: ['wf-invoices'], location: 'Artifacts / Maps', status: 'Review' },
  { id: 'art-finance-dll', name: 'Contoso.Finance.Validation.dll', type: 'Assembly', version: '3.8.2', workflowIds: ['wf-invoices'], location: 'Logic App / lib/custom', status: 'Active' },
  { id: 'art-customer-schema', name: 'CustomerProfile.json', type: 'Schema', version: '1.9', workflowIds: ['wf-customer-sync'], location: 'Artifacts / Schemas', status: 'Active' },
  { id: 'art-customer-map', name: 'DataverseToSalesforce.liquid', type: 'Map', version: '2.2', workflowIds: ['wf-customer-sync'], location: 'Artifacts / Maps', status: 'Active' },
  { id: 'art-inventory-schema', name: 'StockMovement.avsc', type: 'Schema', version: '1.5', workflowIds: ['wf-stock'], location: 'Schema Registry', status: 'Active' },
  { id: 'art-inventory-map', name: 'StockToWarehouse.xslt', type: 'Map', version: '3.0', workflowIds: ['wf-stock'], location: 'Artifacts / Maps', status: 'Active' },
  { id: 'art-notification-schema', name: 'NotificationRequest.json', type: 'Schema', version: '2.6', workflowIds: ['wf-notifications'], location: 'Artifacts / Schemas', status: 'Active' },
  { id: 'art-vendor-schema', name: 'VendorBatch.ffschema', type: 'Schema', version: '1.2', workflowIds: ['wf-vendor'], location: 'Integration Account / Partners', status: 'Review' },
  { id: 'art-vendor-map', name: 'VendorBatchToCanonical.xslt', type: 'Map', version: '1.8', workflowIds: ['wf-vendor'], location: 'Artifacts / Maps', status: 'Active' },
  { id: 'art-partner-cert', name: 'northwind-sftp-public.cer', type: 'Certificate', version: '2026.1', workflowIds: ['wf-vendor'], location: 'Key Vault / Certificates', status: 'Active' },
]
