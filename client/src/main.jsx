/**
 * main.jsx
 * 
 * React root entry point for Welcome Kit frontend.
 * 
 * Rendered to #root in index.html.
 * Provides the React Router browser router and error boundary.
 */

import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <App />
);