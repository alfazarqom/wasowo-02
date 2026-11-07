import React from 'react';
import { LegalPageTemplate } from '../../components/legal/LegalPageTemplate';
import { aboutUsConfig } from '../../data/legalContent';

export function AboutUsPage() {
  return <LegalPageTemplate config={aboutUsConfig} />;
}
