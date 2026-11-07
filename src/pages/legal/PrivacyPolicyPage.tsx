import React from 'react';
import { LegalPageTemplate } from '../../components/legal/LegalPageTemplate';
import { privacyPolicyConfig } from '../../data/legalContent';

export function PrivacyPolicyPage() {
  return <LegalPageTemplate config={privacyPolicyConfig} />;
}
