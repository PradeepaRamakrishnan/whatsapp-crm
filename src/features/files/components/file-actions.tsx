'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCircle, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteFile, markAsReviewed } from '../services';
import type { FileStatus } from '../types/file.types';

interface FileActionsProps {
  fileId: string;
  fileName: string;
  currentStatus: FileStatus;
  variant?: 'dropdown' | 'buttons';
  onSuccess?: () => void;
  redirectOnDelete?: boolean;
}

export function FileActions({
  fileId,
  fileName,
  currentStatus,
  variant = 'dropdown',
  onSuccess,
  redirectOnDelete = true,
}: FileActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const markAsReviewedMutation = useMutation({
    mutationFn: () => markAsReviewed(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file', fileId] });
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to move file to campaign');
      setShowConfirmDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setShowDeleteDialog(false);
      onSuccess?.();
      if (redirectOnDelete) {
        router.push('/files/list');
      }
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete file');
    },
  });

  const isReviewed = currentStatus === 'reviewed';
  const isLoading = markAsReviewedMutation.isPending || deleteMutation.isPending;

  if (variant === 'buttons') {
    return (
      <>
        <div className="flex items-center gap-2">
          {!isReviewed && (
            <Button size="sm" onClick={() => setShowConfirmDialog(true)} disabled={isLoading}>
              {markAsReviewedMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Move to Campaign
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete file</span>
          </Button>
        </div>

        {/* Confirmation Dialog - Move to Campaign */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Move File to Campaign?</AlertDialogTitle>
              <AlertDialogDescription>
                This will move &quot;{fileName}&quot; to campaign where it will run with your
                configured settings. The file will be processed according to your campaign schedule.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={markAsReviewedMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => markAsReviewedMutation.mutate()}
                disabled={markAsReviewedMutation.isPending}
              >
                {markAsReviewedMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Move to Campaign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Success Dialog - File Moved */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                File Moved to Campaign
              </DialogTitle>
              <DialogDescription className="pt-2">
                &quot;{fileName}&quot; has been successfully moved to campaign and will run with
                your configured settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                What happens next?
              </p>
              <ul className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>The campaign will start according to your scheduled settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>
                    Messages will be sent across all configured channels (Email, SMS, WhatsApp)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>Track campaign progress and metrics in the Campaigns section</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSuccessDialog(false)}
                className="flex-1"
              >
                Stay Here
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  router.push('/campaigns/list');
                }}
                className="flex-1"
              >
                View Campaigns
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete File</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{fileName}&quot;? This action cannot be undone
                and all associated records will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>

              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isReviewed && (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDialog(true);
                }}
                disabled={isLoading}
              >
                {markAsReviewedMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Move to Campaign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            disabled={isLoading}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog - Move to Campaign */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move File to Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move &quot;{fileName}&quot; to campaign where it will run with your
              configured settings. The file will be processed according to your campaign schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={markAsReviewedMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => markAsReviewedMutation.mutate()}
              disabled={markAsReviewedMutation.isPending}
            >
              {markAsReviewedMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Move to Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog - File Moved */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              File Moved to Campaign
            </DialogTitle>
            <DialogDescription className="pt-2">
              &quot;{fileName}&quot; has been successfully moved to campaign and will run with your
              configured settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              What happens next?
            </p>
            <ul className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                <span>The campaign will start according to your scheduled settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                <span>
                  Messages will be sent across all configured channels (Email, SMS, WhatsApp)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                <span>Track campaign progress and metrics in the Campaigns section</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowSuccessDialog(false)}
              className="flex-1"
            >
              Stay Here
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                router.push('/campaigns/list');
              }}
              className="flex-1"
            >
              View Campaigns
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          // Prevent row click when dialog is closing if needed, but mainly we want to stop propagation on the dialog content click
          // if user clicks inside the dialog
          setShowDeleteDialog(open);
        }}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{fileName}&quot;? This action cannot be undone
              and all associated records will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
