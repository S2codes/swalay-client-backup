// src/components/Email/EmailLayout.tsx

import React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
