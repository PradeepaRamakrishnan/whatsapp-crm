/** biome-ignore-all assist/source/organizeImports: <> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Instagram,
  Sun,
  Moon,
  ChevronLeft,
  MoreVertical,
  Send,
  Loader2,
  Bold,
  Italic,
  Strikethrough,
  FileText,
  Video,
  Image as LucideImage,
  Type,
  Minus,
} from 'lucide-react';
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
import type { InstagramAccount, InstagramTemplate } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createCustomInstagramTemplate, updateInstagramTemplate } from '../services';

interface InstagramTemplateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: InstagramAccount[];
  template?: InstagramTemplate | null;
}

export function InstagramTemplateSheet({
  open,
  onOpenChange,
  accounts,
  template,
}: InstagramTemplateSheetProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    accountId: '',
    category: 'marketing',
    language: 'en',
    description: '',
    imageUrl: '',
    buttonLabel: '',
    buttonUrl: '',
    headerType: 'NONE',
    headerText: '',
    footer: '',
    buttonLabel2: '',
    buttonUrl2: '',
    isCustom: true,
  });

  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        accountId: '',
        category: (template.category || 'marketing').toLowerCase(),
        language: template.language || template.locale || 'en',
        description: template.body || template.description || '',
        imageUrl: template.imageUrl || '',
        buttonLabel: template.buttonLabel || '',
        buttonUrl: template.buttonUrl || '',
        headerType: (template.headerType || 'NONE').toUpperCase(),
        headerText: template.headerText || '',
        footer: template.footer || '',
        buttonLabel2: template.buttonLabel2 || '',
        buttonUrl2: template.buttonUrl2 || '',
        isCustom: template.isCustom ?? true,
      });
    } else {
      setFormData({
        name: '',
        accountId: '',
        category: 'marketing',
        language: 'en',
        description: '',
        imageUrl: '',
        buttonLabel: '',
        buttonUrl: '',
        buttonLabel2: '',
        buttonUrl2: '',
        headerType: 'NONE',
        headerText: '',
        footer: '',
        isCustom: true,
      });
    }
  }, [template]);

  const [previewMode, setPreviewMode] = React.useState<'light' | 'dark'>('light');

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const insertAtCursor = (text: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentText = formData.description;
    const newText = currentText.substring(0, start) + text + currentText.substring(end);
    handleInputChange('description', newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const wrapSelection = (wrapper: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = formData.description.substring(start, end);
    const wrappedText = `${wrapper}${selectedText}${wrapper}`;
    const newText =
      formData.description.substring(0, start) + wrappedText + formData.description.substring(end);
    handleInputChange('description', newText);
  };

  const selectedAccount = accounts.find((a) => a.id === formData.accountId);

  const handleSubmit = async (submitType: 'draft' | 'verify') => {
    if (!formData.accountId || !formData.name || !formData.description) {
      toast.error('Please fill in required fields (Name, Account, and Body)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        isCustom: submitType === 'draft',
        status: submitType === 'draft' ? 'inprogress' : 'pending',
      };

      if (template) {
        const accId = formData.accountId || accounts[0]?.id;
        await updateInstagramTemplate(accId, template.id, payload);
        toast.success(
          `Template ${submitType === 'draft' ? 'saved as draft' : 'submitted for verification'}`,
        );
      } else {
        await createCustomInstagramTemplate(formData.accountId, payload);
        toast.success(
          `Template ${submitType === 'draft' ? 'saved as draft' : 'submitted for verification'}`,
        );
      }

      queryClient.invalidateQueries({ queryKey: ['instagram-templates'] });
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = !!template;
  const isAuthentication = formData.category === 'authentication';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 overflow-hidden gap-0 flex flex-col sm:max-w-[1100px]">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="text-xl font-bold">
            {isEdit ? 'Edit Instagram Template' : 'Create Instagram Template'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white">
          {/* Left Panel: Form */}
          <div className="flex-1 overflow-y-auto border-r border-zinc-100">
            <div className="p-6 space-y-8">
              {/* Configuration Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Template configuration
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. order_confirmation"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange(
                          'name',
                          e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                        )
                      }
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Lowercase letters, numbers, and underscores only.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Instagram Business Account <span className="text-red-500">*</span>
                    </Label>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Language <span className="text-red-500">*</span>
                    </Label>
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
              </section>

              {/* Category Section */}
              <section className="space-y-4">
                <Label className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'marketing', label: 'Marketing', sub: 'Promotions & offers' },
                    { id: 'utility', label: 'Utility', sub: 'Transactional updates' },
                    { id: 'authentication', label: 'Authentication', sub: 'OTPs & security' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleInputChange('category', cat.id)}
                      className={cn(
                        'flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left group',
                        formData.category === cat.id
                          ? 'border-[#0f172a]  text-black'
                          : 'border-slate-100 bg-white hover:border-slate-200 text-slate-900',
                      )}
                    >
                      <span className="font-bold text-black text-sm block">{cat.label}</span>
                      <span
                        className={cn(
                          'text-[10px] mt-1 text-black',
                          formData.category === cat.id ? 'text-slate-300' : 'text-slate-500',
                        )}
                      >
                        {cat.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Header Section */}
              {!isAuthentication && (
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2 flex items-center gap-2">
                    Header <span className="font-normal lowercase">(optional)</span>
                  </h3>
                  <div className="space-y-4">
                    <Label className="text-[13px]">Header Type</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'NONE', label: 'None', icon: Minus },
                        { id: 'TEXT', label: 'Text', icon: Type },
                        { id: 'IMAGE', label: 'Image', icon: LucideImage },
                        { id: 'VIDEO', label: 'Video', icon: Video },
                        { id: 'DOCUMENT', label: 'Document', icon: FileText },
                      ].map((type) => (
                        <Button
                          key={type.id}
                          type="button"
                          variant={formData.headerType === type.id ? 'default' : 'outline'}
                          className={cn(
                            'h-10 px-4 gap-2 border-slate-200',
                            formData.headerType === type.id && ' text-black',
                          )}
                          onClick={() => handleInputChange('headerType', type.id)}
                        >
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </Button>
                      ))}
                    </div>

                    {formData.headerType === 'TEXT' && (
                      <Input
                        placeholder="Enter header text"
                        value={formData.headerText}
                        onChange={(e) =>
                          handleInputChange('headerText', e.target.value.slice(0, 60))
                        }
                      />
                    )}

                    {(formData.headerType === 'IMAGE' ||
                      formData.headerType === 'VIDEO' ||
                      formData.headerType === 'DOCUMENT') && (
                      <Input
                        placeholder={`Enter ${formData.headerType.toLowerCase()} URL`}
                        value={formData.imageUrl}
                        onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* Body Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Body <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-3">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-lg border border-slate-100">
                    <button
                      type="button"
                      onClick={() => wrapSelection('*')}
                      className="p-2 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Bold className="h-4 w-4 text-slate-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelection('_')}
                      className="p-2 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Italic className="h-4 w-4 text-slate-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelection('~')}
                      className="p-2 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Strikethrough className="h-4 w-4 text-slate-600" />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <span className="text-[10px] text-slate-400 font-medium px-1">Variables:</span>
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => insertAtCursor(`{{${n}}}`)}
                        className="px-2 py-1 text-[11px] font-mono border border-emerald-200 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors"
                      >
                        {`{{${n}}}`}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    ref={bodyRef}
                    placeholder="Enter your message body. Use {{1}}, {{2}} for personalized variables."
                    className="min-h-[140px] resize-none font-sans text-sm border-slate-200"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                  <div className="flex justify-between items-center text-[11px] text-muted-foreground px-1">
                    <span>
                      {formData.description.match(/{{[0-9]+}}/g)?.length || 0} variable(s) used
                    </span>
                    <span>{formData.description.length} / 1024</span>
                  </div>
                </div>
              </section>

              {/* Footer Section */}
              {!isAuthentication && (
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                    Footer <span className="font-normal lowercase">(optional)</span>
                  </h3>
                  <div className="space-y-2">
                    <Input
                      placeholder="Footer text..."
                      value={formData.footer}
                      onChange={(e) => handleInputChange('footer', e.target.value.slice(0, 60))}
                    />
                    <div className="text-right text-[11px] text-muted-foreground">
                      {formData.footer.length} / 60
                    </div>
                  </div>
                </section>
              )}

              {/* Buttons Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Buttons <span className="font-normal lowercase">(optional)</span>
                </h3>
                <div className="space-y-6">
                  {/* Button 1 */}
                  <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                        1
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Primary Button</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="buttonLabel"
                          className="text-[11px] text-slate-500 uppercase"
                        >
                          Button Label
                        </Label>
                        <Input
                          id="buttonLabel"
                          placeholder="Visit Website"
                          className="bg-white"
                          value={formData.buttonLabel}
                          onChange={(e) => handleInputChange('buttonLabel', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buttonUrl" className="text-[11px] text-slate-500 uppercase">
                          Button URL
                        </Label>
                        <Input
                          id="buttonUrl"
                          placeholder="https://..."
                          className="bg-white"
                          value={formData.buttonUrl}
                          onChange={(e) => handleInputChange('buttonUrl', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Button 2 */}
                  <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                        2
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Secondary Button</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="buttonLabel2"
                          className="text-[11px] text-slate-500 uppercase"
                        >
                          Button Label
                        </Label>
                        <Input
                          id="buttonLabel2"
                          placeholder="Contact Us"
                          className="bg-white"
                          value={formData.buttonLabel2}
                          onChange={(e) => handleInputChange('buttonLabel2', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="buttonUrl2"
                          className="text-[11px] text-slate-500 uppercase"
                        >
                          Button URL
                        </Label>
                        <Input
                          id="buttonUrl2"
                          placeholder="https://..."
                          className="bg-white"
                          value={formData.buttonUrl2}
                          onChange={(e) => handleInputChange('buttonUrl2', e.target.value)}
                        />
                      </div>
                    </div>
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
                  {/* Instagram Header */}
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
                        <div className="flex flex-col">
                          <span className="font-bold text-sm truncate max-w-[140px]">
                            {selectedAccount?.username || 'instagram_user'}
                          </span>
                        </div>
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
                          'rounded-2xl overflow-hidden shadow-sm flex flex-col',
                          previewMode === 'dark' ? 'bg-[#262626]' : 'bg-[#e5e7eb]',
                        )}
                      >
                        {/* Header Image/Video Placeholder */}
                        {formData.headerType === 'IMAGE' && formData.imageUrl && (
                          <div className="w-full aspect-square bg-zinc-200 relative">
                            <Image
                              src={formData.imageUrl}
                              alt="Template"
                              fill
                              unoptimized
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {formData.headerType === 'VIDEO' && formData.imageUrl && (
                          <div className="w-full aspect-square bg-zinc-200 relative">
                            <video
                              src={formData.imageUrl}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                              <Video className="h-8 w-8 text-white opacity-80" />
                            </div>
                          </div>
                        )}

                        {/* Header Document Placeholder */}
                        {formData.headerType === 'DOCUMENT' && (
                          <div className="p-4 bg-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded">
                              <FileText className="h-6 w-6 text-blue-500" />
                            </div>
                            <span className="text-[11px] font-medium text-slate-700 truncate">
                              Document.pdf
                            </span>
                          </div>
                        )}

                        <div className="px-4 py-3 space-y-2">
                          {/* Header Text */}
                          {formData.headerType === 'TEXT' && formData.headerText && (
                            <p className="font-bold text-sm mb-1">{formData.headerText}</p>
                          )}

                          {/* Body Text */}
                          <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                            {formData.description ||
                              'Enter something in the body to see how it looks...'}
                          </p>

                          {/* Footer Text */}
                          {formData.footer && (
                            <p className="text-[11px] opacity-50 mt-1">{formData.footer}</p>
                          )}

                          {/* Buttons */}
                          {(formData.buttonLabel || formData.buttonLabel2) && (
                            <div className="pt-2 border-t border-zinc-500/20 divide-y divide-zinc-500/10">
                              {formData.buttonLabel && (
                                <div className="py-2 text-center">
                                  <span className="font-bold text-sm text-blue-500">
                                    {formData.buttonLabel}
                                  </span>
                                </div>
                              )}
                              {formData.buttonLabel2 && (
                                <div className="py-2 text-center">
                                  <span className="font-bold text-sm text-blue-500">
                                    {formData.buttonLabel2}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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

        {/* Action Buttons */}
        <div className="p-4 border-t flex justify-between bg-white shrink-0 mt-auto z-10 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600 h-11 px-8 rounded-lg shadow-sm shadow-orange-200 font-bold"
              onClick={() => handleSubmit('verify')}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Template
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
