import React from 'react';
import { LegalPageTemplate } from '../../components/legal/LegalPageTemplate';
import { paymentPolicyConfig } from '../../data/legalContent';

export function PaymentPolicyPage() {
  return <LegalPageTemplate config={paymentPolicyConfig} />;
}
