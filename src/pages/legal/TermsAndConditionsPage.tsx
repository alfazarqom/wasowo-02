import React from 'react';
import { LegalPageTemplate } from '../../components/legal/LegalPageTemplate';
import { termsAndConditionsConfig } from '../../data/legalContent';

export function TermsAndConditionsPage() {
  return <LegalPageTemplate config={termsAndConditionsConfig} />;
}
