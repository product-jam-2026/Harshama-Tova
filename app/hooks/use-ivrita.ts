'use client';

import { useEffect } from 'react';

/**
 * Hook to automatically apply Ivrita gender transformations to the entire page
 */
export function useIvrita(gender?: string | null) {
  useEffect(() => {
    if (!gender || typeof window === 'undefined') {
      return;
    }

    // Dynamically import Ivrita (works better with Next.js)
    let ivritaInstance: any = null;

    const initIvrita = async () => {
      try {
        // Dynamic import of ivrita
        const IvritaModule = await import('ivrita');
        const Ivrita = IvritaModule.default || IvritaModule;

        // Map gender values to Ivrita constants
        let ivritaGender: string;
        if (gender === 'male') {
          ivritaGender = Ivrita.MALE;
        } else if (gender === 'female') {
          ivritaGender = Ivrita.FEMALE;
        } else {
          ivritaGender = Ivrita.NEUTRAL;
        }

        // Small delay to ensure DOM is ready
        setTimeout(() => {
          ivritaInstance = new Ivrita(document.body, ivritaGender);
        }, 100);
      } catch (error) {
        console.error('Failed to load Ivrita:', error);
      }
    };

    initIvrita();

    // Cleanup
    return () => {
      if (ivritaInstance) {
        try {
          ivritaInstance.setMode((window as any).Ivrita?.ORIGINAL);
        } catch (e) {
          console.error('Error cleaning up Ivrita:', e);
        }
      }
    };
  }, [gender]);
}
