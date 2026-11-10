// Core EDI (Electronic Data Interchange) types. We don't parse raw
// ANSI X12 here — an EDI provider (SPS Commerce, Orderful, TrueCommerce,
// EDI Gateway) translates between X12 and these JSON shapes. This file
// defines the internal shape everything else works against; provider
// adapters in ./providers/* map vendor payloads onto these types.

export type EdiDocumentType =
  | "850" // Purchase Order (inbound from retailer)
  | "855" // PO Acknowledgment (outbound to retailer)
  | "856" // Advance Shipping Notice / ASN (outbound)
  | "810" // Invoice (outbound)
  | "846" // Inventory Availability (outbound)
  | "860" // PO Change (inbound)
  | "997" // Functional Acknowledgment
  | "999"; // Implementation Acknowledgment

export const EDI_DOCUMENT_LABELS: Record<EdiDocumentType, string> = {
  "850": "Purchase Order",
  "855": "PO Acknowledgment",
  "856": "Advance Shipping Notice",
  "810": "Invoice",
  "846": "Inventory Availability",
  "860": "PO Change",
  "997": "Functional Acknowledgment",
  "999": "Implementation Acknowledgment",
};

export type EdiOrderStatus =
  | "received"       // 850 landed in our store
  | "acknowledged"   // 855 sent back to retailer
  | "in-fulfillment" // routed to manufacturing / 3PL
  | "shipped"        // 856 sent
  | "invoiced"       // 810 sent
  | "closed"
  | "rejected"
  | "cancelled";

export const EDI_STATUS_LABELS: Record<EdiOrderStatus, string> = {
  received: "Received",
  acknowledged: "Acknowledged",
  "in-fulfillment": "In fulfillment",
  shipped: "Shipped",
  invoiced: "Invoiced",
  closed: "Closed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export type EdiTransport = "AS2" | "SFTP" | "API" | "VAN";

export type EdiProviderName =
  | "mock"
  | "sps-commerce"
  | "orderful"
  | "true-commerce"
  | "edi-gateway";

/** A retailer / distributor we trade with. */
export type TradingPartner = {
  id: string;
  name: string;              // e.g. "Target", "Walmart"
  providerPartnerId?: string; // ID assigned by the EDI provider for this retailer
  transport: EdiTransport;
  gln?: string;              // Global Location Number if the retailer uses one
  warehouseLocation?: string;
  defaultCurrency: string;   // "USD", etc.
  defaultIncoterm?: string;  // "FOB Origin", "DDP", ...
  notes?: string;
  active: boolean;
  createdISO: string;
  updatedISO: string;
};

/** One line on a retailer PO. */
export type EdiOrderLine = {
  lineNumber: number;
  sku: string;             // Our internal SKU
  upc?: string;            // Retailer-facing UPC/GTIN
  retailerItemId?: string; // How the retailer identifies this SKU in their system
  description?: string;
  quantity: number;
  unitPrice: number;       // In order currency
  lineTotal: number;
};

/** EDI 850 Purchase Order as our system holds it. */
export type EdiOrder = {
  id: string;                 // Internal id (e.g. edi_abc123)
  poNumber: string;           // Retailer's PO number (the authoritative ref)
  partnerId: string;          // FK → TradingPartner.id
  partnerName: string;        // Denormalized for display
  providerDocumentId?: string; // Provider's own doc id (for correlation)
  status: EdiOrderStatus;
  currency: string;
  lines: EdiOrderLine[];
  subtotal: number;
  shipTo?: string;            // Human-readable ship-to block
  shipDateRequested?: string; // ISO
  cancelDate?: string;        // ISO (retailer's cancel-by)
  receivedISO: string;
  acknowledgedISO?: string;
  shippedISO?: string;
  invoicedISO?: string;
  closedISO?: string;
  trackingNumber?: string;
  carrier?: string;
  invoiceNumber?: string;
  rawProviderPayload?: unknown; // For debug — the original JSON from the provider
};

/** Snapshot of what we told the retailer we have on hand (EDI 846). */
export type EdiInventorySnapshot = {
  sku: string;
  upc?: string;
  onHand: number;
  committed: number;
  available: number;
  warehouseLocation?: string;
};
