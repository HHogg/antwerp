import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import URLState from './URLState/URLState';
import TilingEditor from './TilingEditor/TilingEditor';

const Site = () => {
  return (
    <URLState>
      <Switch>
        <Route component={ TilingEditor } path="/" />
      </Switch>
    </URLState>
  );
};

export default hot(module)(Site);
