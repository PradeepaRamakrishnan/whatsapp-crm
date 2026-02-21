'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Info, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { getInstagramTemplates, updateInstagramAutomation } from '../services';
import type { InstagramAccount, InstagramTemplate } from '../types';

interface InstagramAutomationSettingsProps {
  accounts: InstagramAccount[];
}

export function InstagramAutomationSettings({ accounts }: InstagramAutomationSettingsProps) {
  const queryClient = useQueryClient();
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>(accounts[0]?.id || '');
  const [isSaving, setIsSaving] = React.useState(false);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const [enabled, setEnabled] = React.useState(selectedAccount?.autoReplyEnabled || false);
  const [templateId, setTemplateId] = React.useState(selectedAccount?.autoReplyTemplateId || '');

  React.useEffect(() => {
    if (selectedAccount) {
      setEnabled(selectedAccount.autoReplyEnabled || false);
      setTemplateId(selectedAccount.autoReplyTemplateId || '');
    }
  }, [selectedAccount]);

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<InstagramTemplate[]>({
    queryKey: ['instagram-templates', selectedAccountId],
    queryFn: () => getInstagramTemplates(selectedAccountId),
    enabled: !!selectedAccountId,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateInstagramAutomation(selectedAccountId, {
        enabled,
        templateId: templateId || null,
      });
      toast.success('Automation settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <Card className="border-none shadow-none bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center h-48 py-10">
          <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">No accounts connected yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Auto-Reply Automation</CardTitle>
                <CardDescription>Automatically reply to new Instagram contacts</CardDescription>
              </div>
            </div>
            {accounts.length > 1 && (
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-[200px] h-9 bg-white border">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.username || account.instagramId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Enable Auto-Reply</h4>
              <p className="text-xs text-muted-foreground">
                When a user sends their first message to this account, the selected template will be
                sent automatically.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div
            className={cn(
              'space-y-4 transition-all duration-300',
              !enabled && 'opacity-50 pointer-events-none',
            )}
          >
            <div className="space-y-2">
              <label
                htmlFor="auto-reply-template"
                className="text-sm font-semibold flex items-center gap-2"
              >
                Select Reply Template
                <Info className="h-3 w-3 text-muted-foreground" />
              </label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger id="auto-reply-template" className="w-full h-10 bg-white">
                  <SelectValue
                    placeholder={isLoadingTemplates ? 'Loading templates...' : 'Pick a template'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 && !isLoadingTemplates ? (
                    <SelectItem value="none" disabled>
                      No templates found
                    </SelectItem>
                  ) : (
                    templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving || (enabled && !templateId)}
              className="bg-[#0f172a] hover:bg-[#1e293b] text-white min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
