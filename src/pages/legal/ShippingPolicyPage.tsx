import React from 'react';
import { LegalPageTemplate } from '../../components/legal/LegalPageTemplate';
import { shippingPolicyConfig } from '../../data/legalContent';

export function ShippingPolicyPage() {
  return <LegalPageTemplate config={shippingPolicyConfig} />;
}
