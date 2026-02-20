'use client';

import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstagramTemplatesList() {
  return (
    <div className="flex flex-1 flex-col gap-6 py-8">
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="max-w-[420px] space-y-2">
          <h3 className="text-xl font-semibold">No Templates </h3>
          <p className="text-sm text-muted-foreground">
            Create reusable message templates for your Instagram Business accounts. Templates help
            you respond faster and maintain a consistent brand voice.
          </p>
        </div>
        <Button className="mt-4" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Hint for the user */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="group relative rounded-xl border bg-card p-6 opacity-40 grayscale transition-all shadow-sm"
          >
            <div className="mb-4 h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-3 w-full bg-muted rounded mb-1" />
            <div className="h-3 w-2/3 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
