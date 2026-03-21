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
  Type,
  Minus,
  Plus,
  Trash2,
  ExternalLink,
  Phone,
  MessageSquare,
  Zap,
  Copy,
  Upload,
  X,
  FileText,
  Video,
  LucideImage,
  Bold,
  Italic,
  Strikethrough,
  ChevronLeft,
  MoreVertical,
  Loader2,
  Send,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

type ButtonType = 'URL' | 'PHONE' | 'QUICK_REPLY' | 'COPY_CODE' | 'WHATSAPP' | 'FLOW';

interface ButtonConfig {
  id: string;
  type: ButtonType;
  text: string;
  url?: string;
  phone?: string;
  code?: string;
  flowId?: string;
}

export function InstagramTemplateSheet({
  open,
  onOpenChange,
  accounts,
  template,
}: InstagramTemplateSheetProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [buttons, setButtons] = React.useState<ButtonConfig[]>([]);
  const [headerFile, setHeaderFile] = React.useState<File | null>(null);
  const [headerPreview, setHeaderPreview] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    accountId: '',
    category: 'marketing',
    language: 'en',
    description: '',
    imageUrl: '',
    headerType: 'NONE',
    headerText: '',
    footer: '',
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
        headerType: (template.headerType || 'NONE').toUpperCase(),
        headerText: template.headerText || '',
        footer: template.footer || '',
        isCustom: template.isCustom ?? true,
      });

      // Handle buttons from components or flat fields
      if (template.components?.buttons) {
        setButtons(template.components.buttons);
      } else {
        const legacyButtons: ButtonConfig[] = [];
        if (template.buttonLabel) {
          legacyButtons.push({
            id: '1',
            type: 'URL',
            text: template.buttonLabel,
            url: template.buttonUrl,
          });
        }
        if (template.buttonLabel2) {
          legacyButtons.push({
            id: '2',
            type: 'URL',
            text: template.buttonLabel2,
            url: template.buttonUrl2,
          });
        }
        setButtons(legacyButtons);
      }
      setHeaderFile(null);
      setHeaderPreview(template.imageUrl || null);
    } else {
      setFormData({
        name: '',
        accountId: '',
        category: 'marketing',
        language: 'en',
        description: '',
        imageUrl: '',
        headerType: 'NONE',
        headerText: '',
        footer: '',
        isCustom: true,
      });
      setButtons([]);
      setHeaderFile(null);
      setHeaderPreview(null);
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
      const payload: any = {
        ...formData,
        isCustom: submitType === 'draft',
        status: submitType === 'draft' ? 'inprogress' : 'pending',
        buttons: JSON.stringify(buttons),
      };

      if (headerFile) {
        payload.headerFile = headerFile;
      }

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

  const addButton = (type: ButtonType) => {
    if (buttons.length >= 3) {
      toast.error('Maximum 3 buttons allowed');
      return;
    }
    const newButton: ButtonConfig = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: type === 'URL' ? 'Visit Website' : type === 'PHONE' ? 'Call Now' : 'Quick Reply',
    };
    setButtons([...buttons, newButton]);
  };

  const removeButton = (id: string) => {
    setButtons(buttons.filter((b) => b.id !== id));
  };

  const updateButton = (id: string, updates: Partial<ButtonConfig>) => {
    setButtons(buttons.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

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
                      <div className="space-y-3">
                        <button
                          type="button"
                          className={cn(
                            'w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer',
                            headerFile
                              ? 'border-emerald-200 bg-emerald-50/30'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50',
                          )}
                          onClick={() => document.getElementById('header-file-input')?.click()}
                        >
                          <input
                            id="header-file-input"
                            type="file"
                            className="hidden"
                            accept={
                              formData.headerType === 'IMAGE'
                                ? 'image/*'
                                : formData.headerType === 'VIDEO'
                                  ? 'video/*'
                                  : '.pdf,.doc,.docx,.txt'
                            }
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setHeaderFile(file);
                                setHeaderPreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                          {headerPreview ? (
                            <div className="relative w-full max-w-[200px] aspect-video rounded-lg overflow-hidden border bg-black shadow-sm">
                              {formData.headerType === 'IMAGE' ? (
                                <Image
                                  src={headerPreview}
                                  alt="Preview"
                                  fill
                                  className="object-cover"
                                />
                              ) : formData.headerType === 'VIDEO' ? (
                                <>
                                  {/* biome-ignore lint/a11y/useMediaCaption: <Preview video doesn't require captions> */}
                                  <video
                                    src={headerPreview}
                                    className="w-full h-full object-cover"
                                  />
                                </>
                              ) : (
                                <div className="flex h-full items-center justify-center bg-slate-100">
                                  <FileText className="h-8 w-8 text-slate-400" />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHeaderFile(null);
                                  setHeaderPreview(null);
                                }}
                                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm border">
                                <Upload className="h-5 w-5 text-slate-400" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium">
                                  Click to upload {formData.headerType.toLowerCase()}
                                </p>
                                <p className="text-[11px] text-slate-400">or drag and drop here</p>
                              </div>
                            </>
                          )}
                        </button>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100" />
                          </div>
                          <div className="relative flex justify-center text-[10px] uppercase">
                            <span className="bg-white px-2 text-slate-400">or use URL</span>
                          </div>
                        </div>
                        <Input
                          placeholder={`Enter ${formData.headerType.toLowerCase()} URL`}
                          value={formData.imageUrl}
                          onChange={(e) => {
                            handleInputChange('imageUrl', e.target.value);
                            if (e.target.value) {
                              setHeaderFile(null);
                              setHeaderPreview(e.target.value);
                            }
                          }}
                        />
                      </div>
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
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    Buttons <span className="font-normal lowercase">(optional)</span>
                  </h3>
                  {buttons.length < 3 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          />
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Button
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => addButton('URL')} className="gap-2">
                          <ExternalLink className="h-4 w-4" /> Visit Website
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addButton('PHONE')} className="gap-2">
                          <Phone className="h-4 w-4" /> Call Phone Number
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => addButton('QUICK_REPLY')}
                          className="gap-2"
                        >
                          <MessageSquare className="h-4 w-4" /> Quick Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addButton('WHATSAPP')} className="gap-2">
                          <Zap className="h-4 w-4" /> Call on WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addButton('COPY_CODE')} className="gap-2">
                          <Copy className="h-4 w-4" /> Copy Offer Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addButton('FLOW')} className="gap-2">
                          <Zap className="h-4 w-4" /> Complete Flow
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="space-y-4">
                  {buttons.map((button, index) => (
                    <div
                      key={button.id}
                      className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200 group relative"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeButton(button.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                          {index + 1}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {button.type === 'URL'
                            ? 'Visit Website'
                            : button.type === 'PHONE'
                              ? 'Call Phone'
                              : button.type === 'WHATSAPP'
                                ? 'WhatsApp'
                                : button.type === 'COPY_CODE'
                                  ? 'Copy Code'
                                  : button.type === 'FLOW'
                                    ? 'Complete Flow'
                                    : 'Quick Reply'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] text-slate-500 uppercase">
                            Button Text
                          </Label>
                          <Input
                            placeholder="e.g. Visit Website"
                            className="bg-white h-9 text-sm"
                            value={button.text}
                            onChange={(e) => updateButton(button.id, { text: e.target.value })}
                          />
                        </div>

                        {button.type === 'URL' && (
                          <div className="space-y-2">
                            <Label className="text-[11px] text-slate-500 uppercase">
                              Website URL
                            </Label>
                            <Input
                              placeholder="https://..."
                              className="bg-white h-9 text-sm"
                              value={button.url}
                              onChange={(e) => updateButton(button.id, { url: e.target.value })}
                            />
                          </div>
                        )}

                        {button.type === 'PHONE' && (
                          <div className="space-y-2">
                            <Label className="text-[11px] text-slate-500 uppercase">
                              Phone Number
                            </Label>
                            <Input
                              placeholder="+1234567890"
                              className="bg-white h-9 text-sm"
                              value={button.phone}
                              onChange={(e) => updateButton(button.id, { phone: e.target.value })}
                            />
                          </div>
                        )}

                        {button.type === 'COPY_CODE' && (
                          <div className="space-y-2">
                            <Label className="text-[11px] text-slate-500 uppercase">
                              Offer Code
                            </Label>
                            <Input
                              placeholder="SAVE50"
                              className="bg-white h-9 text-sm"
                              value={button.code}
                              onChange={(e) => updateButton(button.id, { code: e.target.value })}
                            />
                          </div>
                        )}

                        {button.type === 'FLOW' && (
                          <div className="space-y-2">
                            <Label className="text-[11px] text-slate-500 uppercase">Flow ID</Label>
                            <Input
                              placeholder="Enter Flow ID"
                              className="bg-white h-9 text-sm"
                              value={button.flowId}
                              onChange={(e) => updateButton(button.id, { flowId: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {buttons.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                      <p className="text-sm text-slate-400">No buttons added yet</p>
                    </div>
                  )}
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
                        {formData.headerType === 'IMAGE' && headerPreview && (
                          <div className="w-full aspect-square bg-zinc-200 relative">
                            <Image
                              src={headerPreview}
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

                        {formData.headerType === 'VIDEO' && headerPreview && (
                          <div className="w-full aspect-square bg-zinc-200 relative">
                            <video
                              src={headerPreview}
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
                          {buttons.length > 0 && (
                            <div className="pt-2 border-t border-zinc-500/20 divide-y divide-zinc-500/10">
                              {buttons.map((btn) => (
                                <div
                                  key={btn.id}
                                  className="py-2 text-center cursor-pointer hover:bg-black/5 active:bg-black/10 transition-colors"
                                >
                                  <div className="flex items-center justify-center gap-1.5 text-blue-500 text-sm">
                                    {btn.type === 'URL' && <ExternalLink className="h-3.5 w-3.5" />}
                                    {btn.type === 'PHONE' && <Phone className="h-3.5 w-3.5" />}
                                    {btn.type === 'WHATSAPP' && <Zap className="h-3.5 w-3.5" />}
                                    {btn.type === 'COPY_CODE' && <Copy className="h-3.5 w-3.5" />}
                                    {btn.type === 'FLOW' && <Zap className="h-3.5 w-3.5" />}
                                    <span className="font-bold">{btn.text}</span>
                                  </div>
                                </div>
                              ))}
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
