import React from 'react';
import { LegalPageTemplate } from '../../components/legal/LegalPageTemplate';
import { warrantyPolicyConfig } from '../../data/legalContent';

export function WarrantyPolicyPage() {
  return <LegalPageTemplate config={warrantyPolicyConfig} />;
}
