/** biome-ignore-all assist/source/organizeImports: <> */
'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Instagram, Sun, Moon, ChevronLeft, MoreVertical, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { InstagramAccount } from '../types';

interface InstagramTemplateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: InstagramAccount[];
}

export function InstagramTemplateSheet({
  open,
  onOpenChange,
  accounts,
}: InstagramTemplateSheetProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    accountId: '',
    category: 'utility',
    language: 'en',
    headerType: 'none',
    body: '',
  });
  const [previewMode, setPreviewMode] = React.useState<'light' | 'dark'>('light');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedAccount = accounts.find((a) => a.id === formData.accountId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 overflow-hidden gap-0 flex flex-col sm:max-w-[1100px]">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="text-xl font-bold">Create Instagram Template</SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white">
          {/* Left Panel: Form */}
          <div className="flex-1 overflow-y-auto border-r border-zinc-100">
            <div className="p-6 space-y-8">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Template configuration
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter template name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram Business Account</Label>
                    <Select
                      onValueChange={(value) => handleInputChange('accountId', value)}
                      value={formData.accountId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Instagram Business Account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        onValueChange={(value) => handleInputChange('category', value)}
                        value={formData.category}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utility">Utility</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="authentication">Authentication</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        onValueChange={(value) => handleInputChange('language', value)}
                        value={formData.language}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Template content
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Header Type</Label>
                    <Select
                      onValueChange={(value) => handleInputChange('headerType', value)}
                      value={formData.headerType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body">Body</Label>
                    <Textarea
                      id="body"
                      placeholder="Enter message body"
                      className="min-h-[120px] resize-none"
                      value={formData.body}
                      onChange={(e) => handleInputChange('body', e.target.value)}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="flex-1 bg-[#f8fafc] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Live Preview
                </h3>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border shadow-sm">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('light')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all',
                      previewMode === 'light'
                        ? 'bg-zinc-100 text-black shadow-sm'
                        : 'text-muted-foreground hover:bg-zinc-50',
                    )}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('dark')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all',
                      previewMode === 'dark'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-zinc-50',
                    )}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                  </button>
                </div>
              </div>

              <div className="flex justify-center py-4">
                <div
                  className={cn(
                    'w-full max-w-[320px] h-[580px] rounded-[3rem] border-[8px] border-slate-900 shadow-2xl relative flex flex-col overflow-hidden transition-colors duration-300',
                    previewMode === 'dark' ? 'bg-black text-white' : 'bg-white text-black',
                  )}
                >
                  {/* Instagram App Header */}
                  <div
                    className={cn(
                      'px-4 pt-12 pb-3 border-b flex items-center justify-between',
                      previewMode === 'dark' ? 'border-zinc-800' : 'border-zinc-100',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronLeft className="h-6 w-6 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                          <div
                            className={cn(
                              'h-full w-full rounded-full border-2',
                              previewMode === 'dark'
                                ? 'bg-black border-black'
                                : 'bg-white border-white',
                            )}
                          />
                        </div>
                        <span className="font-bold text-sm truncate max-w-[140px]">
                          {selectedAccount?.username || 'Business Name'}
                        </span>
                      </div>
                    </div>
                    <MoreVertical className="h-5 w-5 opacity-40" />
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto flex flex-col justify-end">
                    <div className="flex items-start gap-2 max-w-[90%]">
                      <div className="h-7 w-7 rounded-full bg-zinc-100 shrink-0 flex items-center justify-center">
                        <Instagram className="h-4 w-4 text-zinc-300" />
                      </div>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm',
                          previewMode === 'dark' ? 'bg-[#262626]' : 'bg-[#f2f2f2]',
                        )}
                      >
                        {formData.body || 'Type in the body field to see how your message looks...'}
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div
                    className={cn(
                      'p-4 border-t flex items-center gap-3',
                      previewMode === 'dark' ? 'border-zinc-800' : 'border-zinc-100',
                    )}
                  >
                    <div
                      className={cn(
                        'flex-1 rounded-full h-10 px-4 flex items-center bg-transparent border',
                        previewMode === 'dark' ? 'border-zinc-800' : 'border-zinc-200',
                      )}
                    >
                      <span className="text-xs opacity-40">Message...</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                      <Send className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-between bg-white shrink-0 mt-auto z-10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-muted-foreground">
              Save as Draft
            </Button>
            <Button className="bg-[#0f172a] text-white hover:bg-[#1e293b] min-w-[120px]">
              Submit Template
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
