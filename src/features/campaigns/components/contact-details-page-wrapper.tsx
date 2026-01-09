'use client';

import type { BorrowerData } from '../lib/borrower-data';
import { ContactDetailsPage } from './contact-details-page';

interface ContactDetailsPageWrapperProps {
  contact: BorrowerData;
}

export function ContactDetailsPageWrapper({ contact }: ContactDetailsPageWrapperProps) {
  return <ContactDetailsPage contact={contact} />;
}
