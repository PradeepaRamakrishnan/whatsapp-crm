'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function NumberSearchForm({
  onSearch,
  isLoading,
}: {
  onSearch: (country: string, type: string) => void;
  isLoading: boolean;
}) {
  const [country, setCountry] = useState('IN');
  const [type, setType] = useState('local');

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country ISO</Label>
          <Input
            id="country"
            placeholder="e.g. US, GB, IN"
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(v) => v && setType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="tollfree">Toll-Free</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            className="w-full"
            onClick={() => onSearch(country, type)}
            disabled={isLoading || !country}
          >
            {isLoading ? 'Searching...' : 'Search Numbers'}
          </Button>
        </div>
      </div>
    </div>
  );
}
