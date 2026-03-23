import { WhatsAppConfigHeader } from '@/features/whatsapp/components/whatsapp-config-header';
import WhatsappConnect from '@/features/whatsapp/components/whatsapp-content';

export default function WhatsAppConfigPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <WhatsAppConfigHeader />
      <WhatsappConnect />
    </div>
  );
}
