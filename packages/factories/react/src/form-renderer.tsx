/**
 * Form Renderer
 * 
 * Recursively renders form structure from schema
 */

import React from 'react';

export interface FormRendererProps {
  componentKey: string;
  schema: any;
  renderer: (componentKey: string, schema: any, parentProps?: Record<string, any>) => any;
}

export function FormRenderer({ componentKey, schema, renderer }: FormRendererProps) {
  // Render the component - orchestrator handles children internally
  const result = renderer(componentKey, schema);
  
  if (!result || !React.isValidElement(result)) {
    return null;
  }

  return result as React.ReactElement;
}

