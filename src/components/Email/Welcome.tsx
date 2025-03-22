/* eslint-disable react/no-unescaped-entities */

import React from 'react';

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', color: '#333' }}>
    <h1 style={{ color: '#1d72b8' }}>Welcome to SwaLay, {firstName}!</h1>
    <p>
      We're thrilled to have you on board. Thank you for joining our community. At SwaLay, we are committed to providing you with the best experience, and we're here to support you every step of the way.
    </p>
    <p>
      If you have any questions or need assistance, please don't hesitate to reach out to us at <a href="mailto:swalay.care@talantoncore.in">swalay.care@talantoncore.in</a>.
    </p>
    <p>
      Best regards,<br />
      The SwaLay Team
    </p>
  </div>
);
