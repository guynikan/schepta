import React, { useState } from 'react';
import { FormFactory } from '@schepta/factory-react';
import { ScheptaProvider } from '@schepta/adapter-react';
import type { FormSchema } from '@schepta/core';
import { globalComponents } from './components/ProviderComponents';
import { ProviderFeatures } from './components/ProviderFeatures';
import { SubmittedValuesDisplay } from './components/SubmittedValuesDisplay';
import simpleFormSchemaJson from '../../../instances/form/simple-form.json';

const simpleFormSchema = simpleFormSchemaJson as FormSchema;

export function ProviderExample() {
  const [submittedValues, setSubmittedValues] = useState<any>(null);
  const [providerInfo, setProviderInfo] = useState<string>('');

  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values);
    setSubmittedValues(values);
    setProviderInfo(`Form submitted. User ID from externalContext: 1`);
  };

  // Middleware that adds a prefix to labels
  const labelMiddleware = (props: any) => {
    if (props.label) {
      return { ...props, label: `[Provider] ${props.label}` };
    }
    return props;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>schepta Provider Example</h1>
      
      <ProviderFeatures />

      <ScheptaProvider
        components={globalComponents}
        middlewares={[labelMiddleware]}
        externalContext={{
          user: { id: 1, name: 'Provider User' },
          api: 'https://api.example.com',
        }}
        debug={{ enabled: true }}
      >
        <div style={{ border: '1px solid #ddd', padding: '24px', borderRadius: '8px' }}>
          <FormFactory
            schema={simpleFormSchema}
            onSubmit={handleSubmit}
          />
        </div>
      </ScheptaProvider>

      <SubmittedValuesDisplay
        submittedValues={submittedValues}
        providerInfo={providerInfo}
      />
    </div>
  );
}
