'use client';

import { StyledEngineProvider } from '@mui/material/styles';

interface StyleProviderProps {
  children: React.ReactNode;
}

export default function StyleProvider({ children }: StyleProviderProps) {
  return (
    // injectFirst ensures MUI styles are injected at the top of the <head>,
    // giving your custom CSS Modules higher priority (without using !important).
    <StyledEngineProvider injectFirst>
      {children}
    </StyledEngineProvider>
  );
}