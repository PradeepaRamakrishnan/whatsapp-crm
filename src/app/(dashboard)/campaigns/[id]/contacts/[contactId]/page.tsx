import { AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { ContactDetailsPageWrapper } from '@/features/campaigns/components/contact-details-page-wrapper';
import { borrowersData } from '@/features/campaigns/lib/borrower-data';

interface ContactDetailsRouteProps {
  params: Promise<{ id: string; contactId: string }>;
}

export async function generateMetadata({ params }: ContactDetailsRouteProps): Promise<Metadata> {
  const { contactId } = await params;
  const contact = borrowersData.find((c) => c.id === parseInt(contactId, 10));

  if (!contact) {
    return {
      title: 'Contact Not Found',
      description: 'The requested contact could not be found.',
    };
  }

  return {
    title: contact.name,
    description: `View detailed information for ${contact.name}. Contact details, loan information, and communication status.`,
  };
}

export default async function ContactDetailsRoute({ params }: ContactDetailsRouteProps) {
  const { contactId } = await params;
  const contact = borrowersData.find((b) => b.id === parseInt(contactId, 10));

  if (!contact) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Contact not found</h2>
          <p className="text-sm text-muted-foreground">
            The contact you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return <ContactDetailsPageWrapper contact={contact} />;
}
