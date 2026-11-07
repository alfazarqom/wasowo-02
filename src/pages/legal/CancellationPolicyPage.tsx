import React from 'react';
import { LegalPageTemplate } from '../../components/legal/LegalPageTemplate';
import { cancellationPolicyConfig } from '../../data/legalContent';

export function CancellationPolicyPage() {
  return <LegalPageTemplate config={cancellationPolicyConfig} />;
}
