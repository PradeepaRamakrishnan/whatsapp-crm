'use client';

import { Paperclip, Send } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface MessageInputProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function MessageInput({
  placeholder = 'Type a message...',
  onSend,
  disabled = false,
  className,
}: MessageInputProps) {
  const [message, setMessage] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    onSend?.(message);
    setMessage('');

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={cn('flex items-end gap-2 bg-background', className)}>
      <div className="relative flex-1 group">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[44px] max-h-32 resize-none pr-10 py-3 rounded-2xl border-muted-foreground/20 focus-visible:ring-primary/20 bg-muted/30 hover:bg-muted/50 transition-colors"
          rows={1}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute bottom-1 right-1 h-8 w-8 text-muted-foreground hover:text-primary rounded-full"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </div>
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="icon"
        className="h-[44px] w-[44px] shrink-0 rounded-2xl shadow-sm transition-all hover:scale-105 active:scale-95"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
