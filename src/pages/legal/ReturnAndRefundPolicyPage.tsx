import React from 'react';
import { LegalPageTemplate } from '../../components/legal/LegalPageTemplate';
import { returnRefundPolicyConfig } from '../../data/legalContent';

export function ReturnAndRefundPolicyPage() {
  return <LegalPageTemplate config={returnRefundPolicyConfig} />;
}
