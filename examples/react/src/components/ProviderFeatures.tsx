import React from 'react';

export const ProviderFeatures: React.FC = () => {
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      backgroundColor: '#e3f2fd',
      border: '1px solid #90caf9',
      borderRadius: '8px'
    }}>
      <h3 style={{ marginTop: 0 }}>Provider Features:</h3>
      <ul>
        <li>✅ Global components (InputText, FormField, etc.)</li>
        <li>✅ Global middleware (adds "[Provider]" prefix to labels)</li>
        <li>✅ External context (user info, API URLs, etc.)</li>
      </ul>
    </div>
  );
};

