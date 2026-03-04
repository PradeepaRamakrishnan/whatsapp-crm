'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, RefreshCw, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { disconnectEmailAccount, listEmailAccounts, testEmailAccount } from '../services';
import type { EmailAccount } from '../types';
import { ConnectProviderSheet } from './connect-provider-sheet';

const PROVIDER_LABELS: Record<string, string> = {
  sendgrid: '📨 SendGrid',
  mailgun: '📬 Mailgun',
  resend: '📩 Resend',
  postmark: '📮 Postmark',
  ses: '☁️ AWS SES',
};

export function EmailAccountsList() {
  const queryClient = useQueryClient();
  const [connectOpen, setConnectOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const {
    data: accounts = [],
    isLoading,
    isRefetching,
  } = useQuery<EmailAccount[]>({
    queryKey: ['email-accounts'],
    queryFn: listEmailAccounts,
    retry: 1,
  });

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      await testEmailAccount(id);
      alert('✅ Test email sent! Check your inbox.');
    } catch (err) {
      alert(`❌ Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this email account?')) return;
    setRemovingId(id);
    try {
      await disconnectEmailAccount(id);
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    } catch (err) {
      alert(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6 min-w-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Email Accounts</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Connect your email provider to send emails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['email-accounts'] })}
            disabled={isLoading || isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setConnectOpen(true)}>
            <Plus className="h-4 w-4" />
            Connect Provider
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          Loading accounts...
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 gap-4 border-2 border-dashed rounded-xl text-muted-foreground">
          <Mail className="h-12 w-12 opacity-30" />
          <div className="text-center">
            <p className="font-medium">No email accounts connected</p>
            <p className="text-sm">Connect your email provider to start sending emails.</p>
          </div>
          <Button size="sm" onClick={() => setConnectOpen(true)}>
            <Plus className="h-4 w-4" />
            Connect Provider
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Provider</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>From Email</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {PROVIDER_LABELS[account.provider] ?? account.provider}
                  </TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell className="font-mono text-xs">{account.fromEmail}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {account.apiKeyMasked}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={account.isActive ? 'default' : 'secondary'}
                      className={account.isActive ? 'bg-green-100 text-green-700' : ''}
                    >
                      {account.isActive ? 'Active' : 'Disconnected'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={testingId === account.id}
                        onClick={() => handleTest(account.id)}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        {testingId === account.id ? 'Sending...' : 'Test'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={removingId === account.id}
                        onClick={() => handleDisconnect(account.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConnectProviderSheet
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onConnected={() => queryClient.invalidateQueries({ queryKey: ['email-accounts'] })}
      />
    </div>
  );
}
