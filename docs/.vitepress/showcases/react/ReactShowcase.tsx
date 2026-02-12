import React from 'react';
import { ScheptaProvider } from '@schepta/adapter-react';
import { BasicFormPage } from './basic/pages/BasicFormPage';
import { MaterialFormPage } from './material-ui/pages/MaterialFormPage';
import { ChakraFormPage } from './chakra-ui/pages/ChakraFormPage';
import simpleFormSchema from '../../../../instances/form/simple-form.json';
import { FormSchema } from '@schepta/core';

interface ReactShowcaseProps {
  variant?: 'basic' | 'material-ui' | 'chakra-ui';
}

export function ReactShowcase({ variant = 'basic' }: ReactShowcaseProps) {
  const components = {
    basic: BasicFormPage,
    'material-ui': MaterialFormPage,
    'chakra-ui': ChakraFormPage,
  };

  const Component = components[variant];

  return (
    <ScheptaProvider schema={simpleFormSchema as FormSchema}>
      <div className="react-showcase">
        <Component />
      </div>
    </ScheptaProvider>
  );
}
