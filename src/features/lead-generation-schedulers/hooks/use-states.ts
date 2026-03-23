'use client';

import { useQuery } from '@tanstack/react-query';

export interface StateOption {
  name: string; // "New York"
  stateCode: string; // "NY"
}

interface CountryNowState {
  name: string;
  // biome-ignore lint/style/useNamingConvention: external API field
  state_code: string;
}

interface CountryNowStatesResponse {
  error: boolean;
  data: {
    name: string;
    states: Array<CountryNowState>;
  };
}

async function fetchStates(countryName: string): Promise<StateOption[]> {
  const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: countryName }),
  });

  if (!res.ok) return [];

  const data: CountryNowStatesResponse = await res.json();
  if (data.error || !data.data?.states?.length) return [];

  return data.data.states
    .map((s) => ({ name: s.name, stateCode: s.state_code || s.name.slice(0, 2).toUpperCase() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function useStates(countryName: string | null) {
  return useQuery<StateOption[]>({
    queryKey: ['states', countryName],
    queryFn: () => fetchStates(countryName ?? ''),
    enabled: !!countryName,
    staleTime: 86400_000,
    gcTime: 86400_000,
  });
}
