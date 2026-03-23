'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useStates } from '../hooks/use-states';

interface Props {
  value: string; // state name
  countryName: string; // used to fetch states
  onChange: (name: string, code: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function StateCombobox({
  value,
  countryName,
  onChange,
  disabled,
  placeholder = 'Select state / region…',
}: Props) {
  const [open, setOpen] = useState(false);
  const { data: states = [], isLoading } = useStates(countryName || null);

  const noCountry = !countryName;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || noCountry}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {noCountry ? 'Select country first' : value || (isLoading ? 'Loading…' : placeholder)}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search state…" />
          <CommandList>
            <CommandEmpty>No state found.</CommandEmpty>
            <CommandGroup>
              {states.map((s) => (
                <CommandItem
                  key={`${s.stateCode}-${s.name}`}
                  value={s.name}
                  onSelect={() => {
                    onChange(s.name, s.stateCode);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === s.name ? 'opacity-100' : 'opacity-0')}
                  />
                  {s.name}
                  <span className="ml-auto text-xs text-muted-foreground">{s.stateCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
