import { WhatsAppConfigHeader } from '@/features/whatsapp/components/whatsapp-config-header';
import WhatsappConnect from '@/features/whatsapp/components/whatsapp-content';

export default function WhatsappListPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
      <WhatsAppConfigHeader />
      <WhatsappConnect />
    </div>
  );
}
