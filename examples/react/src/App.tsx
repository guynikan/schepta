import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import simpleFormSchema from '../../../instances/form/simple-form.json';
import complexFormSchema from '../../../instances/form/complex-form.json';
import { ProviderExample } from './ProviderExample';
import { ExpressionExample } from './ExpressionExample';
import { components } from './componentRegistry';
import { FormFactory } from '../../../packages/factories/react/src/form-factory';

function FormPage({ schema }: { schema: any }) {
  const [submittedValues, setSubmittedValues] = useState<any>(null);

  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values);
    setSubmittedValues(values);
  };

  return (
    <>
      <div style={{ border: '1px solid #ddd', padding: '24px', borderRadius: '8px' }}>
        <FormFactory
          schema={schema}
          components={components}
          onSubmit={handleSubmit}
          debug={true}
        />
      </div>

      {submittedValues && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0 }}>Valores Submetidos:</h3>
          <pre style={{
            background: 'white',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '13px'
          }}>
            {JSON.stringify(submittedValues, null, 2)}
          </pre>
          <p style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#eff6ff',
            borderLeft: '3px solid #3b82f6',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#1e40af'
          }}>
            💡 Os valores também estão disponíveis no console do navegador (F12)
          </p>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>schepta React Example</h1>
        
        <div style={{ marginBottom: '24px' }}>
          <Link 
            to="/"
            style={{ marginRight: '8px', padding: '8px 16px', textDecoration: 'none', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block' }}
          >
            Simple Form
          </Link>
          <Link 
            to="/complex"
            style={{ marginRight: '8px', padding: '8px 16px', textDecoration: 'none', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block' }}
          >
            Complex Form
          </Link>
          <Link 
            to="/provider"
            style={{ marginRight: '8px', padding: '8px 16px', textDecoration: 'none', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block' }}
          >
            Provider Example
          </Link>
          <Link 
            to="/expressions"
            style={{ padding: '8px 16px', textDecoration: 'none', border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block' }}
          >
            Expressions Example
          </Link>
        </div>

        <Routes>
          <Route path="/" element={<FormPage schema={simpleFormSchema} />} />
          <Route path="/complex" element={<FormPage schema={complexFormSchema} />} />
                <Route path="/provider" element={<ProviderExample />} />
                <Route path="/expressions" element={<ExpressionExample />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

