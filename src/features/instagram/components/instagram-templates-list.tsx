/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileText, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { deleteInstagramTemplate, getInstagramTemplates } from '../services';
import type { InstagramAccount, InstagramTemplate } from '../types';
import { InstagramTemplateSheet } from './instagram-template-sheet';

interface InstagramTemplatesListProps {
  accounts: InstagramAccount[];
}

const statusColorMap: Record<string, string> = {
  approved: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function InstagramTemplatesList({ accounts }: InstagramTemplatesListProps) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>(
    accounts.find((a) => a.status === 'active')?.id || accounts[0]?.id || '',
  );
  const [selectedTemplate, setSelectedTemplate] = React.useState<InstagramTemplate | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [templateToDelete, setTemplateToDelete] = React.useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery<InstagramTemplate[]>({
    queryKey: ['instagram-templates', selectedAccountId],
    queryFn: () => getInstagramTemplates(selectedAccountId),
    enabled: !!selectedAccountId,
    retry: 1,
  });

  const handleDelete = async (templateId: string) => {
    try {
      await deleteInstagramTemplate(selectedAccountId, templateId);
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['instagram-templates', selectedAccountId] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handleEdit = (template: InstagramTemplate) => {
    setSelectedTemplate(template);
    setCreateOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setTemplateToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      handleDelete(templateToDelete);
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  const safeTemplates = Array.isArray(templates) ? templates : [];

  const filteredTemplates = safeTemplates.filter((template) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      template.name.toLowerCase().includes(q) ||
      (template.description || template.body || '').toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' || template.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-1 flex-col gap-6 py-4">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-1 rounded-xl">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-9 bg-muted/50 border-none h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-10 bg-muted/50 border-none">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          {accounts.length > 1 && (
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="w-[200px] h-10 bg-muted/50 border-none">
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

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white gap-2 border-none shadow-sm shadow-orange-200"
            onClick={() => {
              setSelectedTemplate(null);
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Templates Table */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[200px]  text-foreground">Name</TableHead>
              <TableHead className=" text-foreground">Category</TableHead>
              <TableHead className=" text-foreground">Language</TableHead>
              <TableHead className=" text-foreground">Status</TableHead>
              <TableHead className="text-right  text-foreground">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                    <p className="text-sm font-medium">Loading templates...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center px-3">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="bg-muted p-3 rounded-full">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">No Templates Found</h4>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery || statusFilter !== 'all'
                          ? 'Try adjusting your search or filters to find what you are looking for.'
                          : "You haven't created any templates for this account yet."}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((template) => (
                <TableRow
                  key={template.id}
                  className="group cursor-pointer hover:bg-muted/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(template);
                  }}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm group-hover:text-purple-600 transition-colors">
                          {template.name}
                        </span>
                        {template.isCustom && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] bg-purple-50 text-purple-600 border-purple-100 uppercase tracking-tighter h-4"
                          >
                            Custom
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate max-w-[180px] mt-0.5">
                        {template.description || template.body}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-mono tracking-wider bg-slate-50"
                    >
                      {template.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {template.locale || template.language}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'text-[10px] font-bold border rounded-md shadow-none px-2 py-0.5',
                        statusColorMap[template.status.toLowerCase()] ||
                          'bg-gray-100 text-gray-700',
                      )}
                    >
                      {template.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <span>{format(new Date(template.updatedAt), 'MMM d, yyyy')}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm(template.id);
                        }}
                        className="p-1 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InstagramTemplateSheet
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setSelectedTemplate(null);
        }}
        accounts={accounts}
        template={selectedTemplate}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white border-none"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
