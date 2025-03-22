// src/components/Email/PasswordReset.tsx

import React from 'react';

interface PasswordResetTemplateProps {
  firstName: string;
  resetLink: string;
}

export const PasswordResetTemplate: React.FC<PasswordResetTemplateProps> = ({ firstName, resetLink }) => {
  return (
    <div>
      <h1>Password Reset Request</h1>
      <p>Hello {firstName},</p>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <a href={resetLink}>Reset Password</a>
      <p>If you did not request this change, please ignore this email.</p>
    </div>
  );
};
