import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Root from './components/Root';
import URLState from './components/URLState';

const rootElement = document.getElementById('Root');

if (rootElement) {
  render(
    <BrowserRouter>
      <URLState>
        <Root />
      </URLState>
    </BrowserRouter>
  , rootElement);
}
