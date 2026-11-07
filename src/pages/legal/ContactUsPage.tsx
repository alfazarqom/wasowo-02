import React from 'react';
import { LegalPageTemplate } from '../../components/legal/LegalPageTemplate';
import { contactUsConfig } from '../../data/legalContent';

export function ContactUsPage() {
  return <LegalPageTemplate config={contactUsConfig} />;
}
