import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { analytics, initializeApp, performance } from 'firebase/app';
import Root from './components/Root';
import URLState from './components/URLState';
import 'firebase/analytics';
import 'firebase/performance';

if (process.env.NODE_ENV === 'production' && navigator.userAgent !== 'ReactSnap') {
  initializeApp({
    apiKey: 'AIzaSyCdngHXL19yP6mwpCmHs34ByztbHiX7O8A',
    authDomain: 'hoggio-2524a.firebaseapp.com',
    databaseURL: 'https://hoggio-2524a.firebaseio.com',
    projectId: 'hoggio-2524a',
    storageBucket: 'hoggio-2524a.appspot.com',
    messagingSenderId: '65615937041',
    appId: '1:65615937041:web:1025ff2057745fd1217bb0',
    measurementId: 'G-GW8PTVLF9T',
  });

  analytics();
  performance();
}

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
