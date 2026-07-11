import React from 'react';
import { createRoot } from 'react-dom/client';
import { html } from './html.js';

import { install, run } from './hackpad.js';
import { newEditor, setupMonaco } from './editor.js';
import { newTerminal } from './terminal.js';
import { Compat } from './compat.js';
import { Loading } from './loading.js';
import { CDN } from './w9y.js';

function App() {
  const [percentage, setPercentage] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    // Hyperbolic progress: 100 * (1 - 1/(1 + t/T))
    // Fast at start, slows down, never reaches 100 until actually done.
    const T = 2000; // reaches 50% at 2s
    const start = Date.now();
    const timer = setInterval(() => {
      const t = Date.now() - start;
      const pct = 100 * (1 - 1 / (1 + t / T));
      setPercentage(Math.min(pct, 99.5));
    }, 100);

    Promise.all([
      import('monaco-editor').then(monaco => {
        setupMonaco(monaco);
        window.editor = {
          newTerminal,
          newEditor: (elem, onEdit) => newEditor(elem, onEdit, monaco),
        };
      }),
      install(CDN.editor, 'editor'),
      install(CDN.sh, 'sh'),
    ]).then(() => {
      clearInterval(timer);
      setPercentage(100);
      run('editor', '--editor=editor')
      setTimeout(() => setLoading(false), 300);
    })
  }, [])

  return html`<${React.Fragment}>
      ${loading ? html`<${React.Fragment}>
        <${Compat} />
        <${Loading} percentage=${percentage} />
      </${React.Fragment}>` : null}
      <div id="app">
        <div id="editor"></div>
      </div>
    </${React.Fragment}>`;
}

const root = createRoot(document.getElementById('root'));
root.render(html`<${React.StrictMode}><${App} /></${React.StrictMode}>`);
