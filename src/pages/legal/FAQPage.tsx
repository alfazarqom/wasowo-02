import React from 'react';
import { LegalPageTemplate } from '../../components/legal/LegalPageTemplate';
import { faqConfig } from '../../data/legalContent';

export function FAQPage() {
  return <LegalPageTemplate config={faqConfig} />;
}
