import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function ResetPlaceholderApp() {
  return (
    <main>
      <h1>Journey frontend UI reset in progress</h1>
      <p>
        Presentation layer has been intentionally removed. Deploy, config, and
        API infrastructure are being kept while the new UI is rebuilt.
      </p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ResetPlaceholderApp />
  </StrictMode>,
);
