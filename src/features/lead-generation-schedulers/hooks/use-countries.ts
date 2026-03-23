'use client';

import { useQuery } from '@tanstack/react-query';

export interface CountryOption {
  name: string; // "United States"
  code: string; // "US"
}

async function fetchCountries(): Promise<CountryOption[]> {
  const res = await fetch(
    'https://restcountries.com/v3.1/all?fields=name,cca2',
    { next: { revalidate: 86400 } }, // cache for 24 hours
  );
  if (!res.ok) throw new Error('Failed to fetch countries');

  const data: Array<{ name: { common: string }; cca2: string }> = await res.json();

  return data
    .map((c) => ({ name: c.name.common, code: c.cca2 }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function useCountries() {
  return useQuery<CountryOption[]>({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 86400_000, // 24 hours
    gcTime: 86400_000,
  });
}
