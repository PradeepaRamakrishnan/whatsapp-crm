'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CheckCircle, Loader2, MoreHorizontal, RefreshCw, WifiOff, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { disconnectInstagramAccount, refreshInstagramToken } from '../services';
import type { InstagramAccount } from '../types';

interface InstagramAccountsTableProps {
  accounts: InstagramAccount[];
  isLoading?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  if (status === 'disconnected') {
    return (
      <Badge variant="secondary" className="gap-1">
        <WifiOff className="h-3 w-3" />
        Disconnected
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" />
      Error
    </Badge>
  );
}

function ActionCell({ account }: { account: InstagramAccount }) {
  const queryClient = useQueryClient();

  const disconnect = useMutation({
    mutationFn: () => disconnectInstagramAccount(account.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] }),
  });

  const refresh = useMutation({
    mutationFn: () => refreshInstagramToken(account.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] }),
  });

  const isActionLoading = disconnect.isPending || refresh.isPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        disabled={isActionLoading}
      >
        {isActionLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => refresh.mutate()}
          disabled={account.tokenType === 'system_user' || account.status !== 'active'}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Token
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => disconnect.mutate()}
          disabled={account.status === 'disconnected'}
        >
          <WifiOff className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<InstagramAccount>[] = [
  {
    accessorKey: 'username',
    header: 'Account',
    cell: ({ row }) => {
      const account = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{account.username || '—'}</span>
          <span className="text-xs text-muted-foreground font-mono">{account.instagramId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'facebookPageId',
    header: 'Page ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {(getValue() as string | null) || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: 'tokenType',
    header: 'Token',
    cell: ({ getValue }) => (
      <Badge variant="outline" className="capitalize">
        {(getValue() as string).replace('_', ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: 'tokenExpiry',
    header: 'Expires',
    cell: ({ getValue }) => {
      const val = getValue() as string | null;
      if (!val) return <span className="text-muted-foreground text-xs">Never</span>;
      return <span className="text-xs">{format(new Date(val), 'dd MMM yyyy')}</span>;
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <ActionCell account={row.original} />,
  },
];

import { useRouter } from 'next/navigation';

export function InstagramAccountsTable({ accounts, isLoading }: InstagramAccountsTableProps) {
  const router = useRouter();
  const table = useReactTable({
    data: accounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading accounts...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/instagram/inbox?accountId=${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No Instagram accounts connected yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
