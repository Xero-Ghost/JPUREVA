import React from 'react';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="max-w-md text-center">
        <div className="text-primary text-6xl mb-6">
          <span className="material-symbols-outlined text-6xl">cloud_off</span>
        </div>
        <h1 className="text-headline-md font-bold text-on-surface mb-4">
          Service Unavailable
        </h1>
        <p className="text-body-lg text-on-surface-variant mb-8">
          We are currently experiencing issues connecting to our database. Please try again later or contact support if the issue persists.
        </p>
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
