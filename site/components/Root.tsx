import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useLocalStorage } from 'preshape';
import URLState from './URLState/URLState';
import TilingEditor from './TilingEditor/TilingEditor';

export const RootContext = React.createContext<{
  onChangeTheme: (theme: TypeTheme) => void;
  theme: TypeTheme;
}>({
  onChangeTheme: () => {},
  theme: 'day',
});

export default () => {
  const [theme, onChangeTheme] = useLocalStorage<TypeTheme>('com.hogg.theme', 'night');

  return (
    <BrowserRouter>
      <URLState>
        <RootContext.Provider value={ { theme, onChangeTheme } }>
          <Switch>
            <Route component={ TilingEditor } path="/" />
          </Switch>
        </RootContext.Provider>
      </URLState>
    </BrowserRouter>
  );
};
