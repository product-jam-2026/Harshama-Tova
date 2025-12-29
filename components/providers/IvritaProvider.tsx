'use client';

import { useIvrita } from '@/lib/use-ivrita';

interface IvritaProviderProps {
  gender?: string | null;
  children: React.ReactNode;
}

/**
 * Component that applies Ivrita gender transformations to all its children
 */
export default function IvritaProvider({ gender, children }: IvritaProviderProps) {
  useIvrita(gender);
  
  return <>{children}</>;
}
