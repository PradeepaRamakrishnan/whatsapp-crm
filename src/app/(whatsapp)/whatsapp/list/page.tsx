import { WhatsAppConfigHeader } from '@/features/whatsapp/components/whatsapp-config-header';
import WhatsappConnect from '@/features/whatsapp/components/whatsapp-content';

export default function WhatsappListPage() {
  return (
    <div>
      <WhatsAppConfigHeader />
      <WhatsappConnect />
    </div>
  );
}
