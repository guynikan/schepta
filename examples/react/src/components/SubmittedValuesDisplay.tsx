import React from 'react';

interface SubmittedValuesDisplayProps {
  submittedValues: any;
  providerInfo?: string;
}

export const SubmittedValuesDisplay: React.FC<SubmittedValuesDisplayProps> = ({
  submittedValues,
  providerInfo,
}) => {
  if (!submittedValues) {
    return null;
  }

  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px'
    }}>
      <h3 style={{ marginTop: 0 }}>Valores Submetidos:</h3>
      <pre style={{
        backgroundColor: '#fff',
        padding: '16px',
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.5',
        border: '1px solid #dee2e6'
      }}>
        {JSON.stringify(submittedValues, null, 2)}
      </pre>
      {providerInfo && (
        <p style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>
          {providerInfo}
        </p>
      )}
    </div>
  );
};

