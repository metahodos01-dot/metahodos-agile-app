import React from 'react';

export const LandingPageTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-metahodos-gray mb-4">
        Test Landing Page
      </h1>
      <p className="text-xl text-gray-600">
        Se vedi questo messaggio, il server funziona correttamente.
      </p>
      <div className="mt-8 p-4 bg-metahodos-orange text-white rounded-lg">
        Il problema è in uno dei componenti della landing page.
      </div>
    </div>
  );
};
