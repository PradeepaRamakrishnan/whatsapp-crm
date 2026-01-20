'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

import { getConfigurationyId } from '@/features/campaigns/services';
import Channel from '@/features/configuration/components/channel';
import Templates from '@/features/configuration/components/templates';

const steps = [
  { id: 1, name: 'Template', description: 'Configure templates' },
  { id: 2, name: 'Channel', description: 'Configure channels' },
];

export default function EditConfigurationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [currentStep, setCurrentStep] = useState(1);

  const { data: config, isLoading } = useQuery({
    queryKey: ['configuration', id],
    queryFn: () => getConfigurationyId(id),
    enabled: !!id,
  });

  // State (lifted from main page)
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [smsEnabled, setSmsEnabled] = useState<boolean>(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(true);
  const [emailTemplate, setEmailTemplate] = useState<string>('');
  const [smsTemplate, setSmsTemplate] = useState<string>('');
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('');

  useEffect(() => {
    if (config) {
      // Map configuration to state using _id or id for template selection
      if (config.emailTemplate) {
        setEmailEnabled(config.emailTemplate.active ?? true);
        const templateId = config.emailTemplate._id || config.emailTemplate.id;
        if (templateId) setEmailTemplate(templateId);
      }

      if (config.smsTemplate) {
        setSmsEnabled(config.smsTemplate.active ?? true);
        const templateId = config.smsTemplate._id || config.smsTemplate.id;
        if (templateId) setSmsTemplate(templateId);
      }

      if (config.whatsappTemplate) {
        setWhatsappEnabled(config.whatsappTemplate.active ?? true);
        const templateId = config.whatsappTemplate._id || config.whatsappTemplate.id;
        if (templateId) setWhatsappTemplate(templateId);
      }
    }
  }, [config]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSave = () => {
    router.push('/agents/configuration');
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="text-muted-foreground">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Configuration</h1>
          <p className="text-muted-foreground">Update your agent templates and channel settings</p>
        </div>
      </div>

      {/* Stepper */}
      <nav aria-label="Progress" className="pb-2">
        <ol className="flex items-center w-full max-w-lg">
          {steps.map((s, idx) => (
            <li
              key={s.id}
              className={`flex items-center ${idx !== steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm transition-all ${
                      currentStep > s.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : currentStep === s.id
                          ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20'
                          : 'border-muted-foreground/25 bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    {currentStep > s.id ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-lg font-semibold">{s.id}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${
                        currentStep >= s.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {s.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{s.description}</span>
                  </div>
                </div>
              </div>
              {idx !== steps.length - 1 && (
                <div
                  className={`mx-6 h-0.5 flex-1 transition-colors ${
                    currentStep > s.id ? 'bg-primary' : 'bg-muted-foreground/25'
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Content */}
      <div className="flex-1">
        {currentStep === 1 && (
          <div className="space-y-6">
            <Templates
              emailEnabled={emailEnabled}
              setEmailEnabled={setEmailEnabled}
              smsEnabled={smsEnabled}
              setSmsEnabled={setSmsEnabled}
              whatsappEnabled={whatsappEnabled}
              setWhatsappEnabled={setWhatsappEnabled}
              emailTemplate={emailTemplate}
              setEmailTemplate={setEmailTemplate}
              smsTemplate={smsTemplate}
              setSmsTemplate={setSmsTemplate}
              whatsappTemplate={whatsappTemplate}
              setWhatsappTemplate={setWhatsappTemplate}
            />
            <div className="flex justify-end pt-6">
              <Button onClick={handleNext}>Next Step</Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <Channel
              emailEnabled={emailEnabled}
              smsEnabled={smsEnabled}
              whatsappEnabled={whatsappEnabled}
            />
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
