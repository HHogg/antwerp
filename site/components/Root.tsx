import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Site from './Site';

export default () => {
  return (
    <BrowserRouter>
      <Site />
    </BrowserRouter>
  );
};
