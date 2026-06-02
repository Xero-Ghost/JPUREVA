import React, { useEffect, useState } from 'react';

export default function ErrorPage() {
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get('message');
    if (msg) setErrorMsg(msg);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="max-w-md text-center">
        <div className="text-primary text-6xl mb-6">
          <span className="material-symbols-outlined text-6xl">cloud_off</span>
        </div>
        <h1 className="text-headline-md font-bold text-on-surface mb-4">
          Service Unavailable
        </h1>
        <p className="text-body-lg text-on-surface-variant mb-6">
          We are currently experiencing issues connecting to our database. Please try again later or contact support if the issue persists.
        </p>
        
        {errorMsg && (
          <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-8 text-sm font-mono break-all text-left overflow-auto max-h-40">
            <strong>Technical Details:</strong>
            <pre className="mt-2 whitespace-pre-wrap">{errorMsg}</pre>
          </div>
        )}

        <button 
          onClick={() => window.location.href = '/'}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
