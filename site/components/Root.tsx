import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import URLState from './URLState/URLState';
import TilingEditor from './TilingEditor/TilingEditor';

export default () => {
  return (
    <BrowserRouter>
      <URLState>
        <Switch>
          <Route component={ TilingEditor } path="/" />
        </Switch>
      </URLState>
    </BrowserRouter>
  );
};
