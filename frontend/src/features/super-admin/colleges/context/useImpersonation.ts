import { useContext } from 'react';
import {
  ImpersonationContext,
  type ImpersonationContextValue,
} from './ImpersonationContext';

export function useImpersonation(): ImpersonationContextValue {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error(
      'useImpersonation must be used within an ImpersonationProvider',
    );
  }
  return context;
}
