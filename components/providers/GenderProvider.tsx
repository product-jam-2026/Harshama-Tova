'use client';

import { createContext, useContext } from 'react';
import { genderTextSync } from '@/lib/utils/gender-utils';

const GenderContext = createContext<string | null>(null);

export function GenderProvider({ gender, children }: { gender?: string | null; children: React.ReactNode }) {
  return (
    <GenderContext.Provider value={gender || null}>
      {children}
    </GenderContext.Provider>
  );
}

export function useGender() {
  return useContext(GenderContext);
}

// Helper hook for easy text transformation (synchronous for render)
export function useGenderText() {
  const gender = useGender();
  return (text: string) => genderTextSync(text, gender);
}
