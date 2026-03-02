import { WhatsAppConfigHeader } from '@/features/whatsapp/components/whatsapp-config-header';
import { WhatsAppTemplatesContent } from '@/features/whatsapp/components/whatsapp-templates-content';

export default function WhatsappTemplatesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 min-w-0">
      <WhatsAppConfigHeader />
      <WhatsAppTemplatesContent />
    </div>
  );
}
