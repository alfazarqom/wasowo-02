export interface LegalSubSection {
  title: string;
  text?: string;
  bullets?: string[];
}

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: LegalSubSection[];
  callout?: {
    type: 'info' | 'warning' | 'success';
    text: string;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: 'Umum' | 'Pesanan & Pengiriman' | 'Pembayaran' | 'Produk & Garansi' | 'Pengembalian';
}

export interface ContactChannel {
  name: string;
  value: string;
  description: string;
  actionUrl?: string;
  badge?: string;
}

export interface LegalDocumentConfig {
  slug: string;
  title: string;
  subtitle?: string;
  badge?: string;
  effectiveDate: string;
  lastUpdated: string;
  version?: string;
  sections: LegalSection[];
  faqs?: FAQItem[];
  contactChannels?: ContactChannel[];
  relatedLinks?: { title: string; route: string }[];
}
