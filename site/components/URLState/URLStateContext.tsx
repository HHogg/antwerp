import { createContext } from 'react';
import { URLState, defaultValues } from './URLState';

export interface URLStateContextProps extends Required<URLState> {
  onUpdateURLState: (settings: Partial<URLState>) => void;
  pushWithState: (path: string) => void;
}

export default createContext<URLStateContextProps>({
  ...defaultValues,
  onUpdateURLState: () => {},
  pushWithState: () => {},
});
