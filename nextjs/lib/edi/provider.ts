// Provider adapter interface. Every EDI vendor (SPS Commerce, Orderful,
// TrueCommerce, EDI Gateway) exposes different APIs; this interface is
// what our app code speaks to. Swap `getEdiProvider()` to point at a
// real adapter once James picks one.
//
// For now we ship a mock adapter so /admin/edi is a working dashboard
// against sample data — the whole purpose at this stage is to make SoK
// demonstrably "EDI-ready" for the RangeMe conversation and other
// retail pitches.

import type {
  EdiDocumentType,
  EdiInventorySnapshot,
  EdiOrder,
  EdiProviderName,
} from "./types";

export type AcknowledgePOInput = {
  poNumber: string;
  partnerId: string;
  accepted: boolean;
  rejectionReason?: string;
  lineOverrides?: Array<{ lineNumber: number; quantityAccepted: number }>;
};

export type SendASNInput = {
  poNumber: string;
  partnerId: string;
  trackingNumber: string;
  carrier: string;
  shipDateISO: string;
  packages?: Array<{ packageId: string; weightLb?: number }>;
};

export type SendInvoiceInput = {
  poNumber: string;
  partnerId: string;
  invoiceNumber: string;
  invoiceDateISO: string;
  totalAmount: number;
  currency: string;
};

export type ProviderDispatchResult =
  | { ok: true; providerDocumentId: string }
  | { ok: false; error: string };

export interface EdiProvider {
  name: EdiProviderName;

  /** Pull all inbound POs that landed since the last sync. Pagination is
   *  the adapter's problem; return every new one. */
  listInboundPurchaseOrders(): Promise<EdiOrder[]>;

  /** Send an 855 PO acknowledgment back to the retailer. */
  acknowledgePO(input: AcknowledgePOInput): Promise<ProviderDispatchResult>;

  /** Send an 856 Advance Shipping Notice. */
  sendASN(input: SendASNInput): Promise<ProviderDispatchResult>;

  /** Send an 810 Invoice. */
  sendInvoice(input: SendInvoiceInput): Promise<ProviderDispatchResult>;

  /** Send an 846 Inventory Availability snapshot. */
  publishInventory(
    partnerId: string,
    snapshots: EdiInventorySnapshot[],
  ): Promise<ProviderDispatchResult>;

  /** Ask the provider which document types a partner is certified for. */
  getPartnerCapabilities(partnerId: string): Promise<EdiDocumentType[]>;
}

/* ----------------------------- Mock -------------------------------- */

/**
 * Mock adapter. Returns a handful of sample POs so the dashboard shows
 * real UI during development and demos. All outbound calls succeed
 * synthetically. Replace in production by setting EDI_PROVIDER env to
 * "sps-commerce" | "orderful" | "true-commerce" and implementing the
 * corresponding adapter.
 */
class MockEdiProvider implements EdiProvider {
  name: EdiProviderName = "mock";

  async listInboundPurchaseOrders(): Promise<EdiOrder[]> {
    // The dashboard reads from our own EDI orders store; this method is
    // only called by the pull-sync job. The mock returns an empty list
    // so sync is a no-op. Sample seed data is written by the store's
    // seed path, not here.
    return [];
  }

  async acknowledgePO(
    input: AcknowledgePOInput,
  ): Promise<ProviderDispatchResult> {
    return {
      ok: true,
      providerDocumentId: `mock_855_${input.poNumber}_${Date.now()}`,
    };
  }

  async sendASN(input: SendASNInput): Promise<ProviderDispatchResult> {
    return {
      ok: true,
      providerDocumentId: `mock_856_${input.poNumber}_${Date.now()}`,
    };
  }

  async sendInvoice(input: SendInvoiceInput): Promise<ProviderDispatchResult> {
    return {
      ok: true,
      providerDocumentId: `mock_810_${input.invoiceNumber}`,
    };
  }

  async publishInventory(): Promise<ProviderDispatchResult> {
    return {
      ok: true,
      providerDocumentId: `mock_846_${Date.now()}`,
    };
  }

  async getPartnerCapabilities(): Promise<EdiDocumentType[]> {
    return ["850", "855", "856", "810", "997"];
  }
}

/* --------------------------- Factory ------------------------------- */

let singleton: EdiProvider | null = null;

export function getEdiProvider(): EdiProvider {
  if (singleton) return singleton;
  const name = (process.env.EDI_PROVIDER ?? "mock") as EdiProviderName;
  switch (name) {
    // Real adapters go here. Each one gets its own file under
    // ./providers/<name>.ts and translates between our EdiOrder shape
    // and the vendor's API.
    //
    // case "orderful":
    //   singleton = new OrderfulAdapter({
    //     apiKey: required("ORDERFUL_API_KEY"),
    //     orgId: required("ORDERFUL_ORG_ID"),
    //   });
    //   break;
    // case "sps-commerce":
    //   singleton = new SpsCommerceAdapter({ ... });
    //   break;
    // case "true-commerce":
    //   singleton = new TrueCommerceAdapter({ ... });
    //   break;
    default:
      singleton = new MockEdiProvider();
      break;
  }
  return singleton;
}
