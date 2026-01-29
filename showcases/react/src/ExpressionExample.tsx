// import React, { useState } from 'react';
// import { FormFactory } from '@schepta/factory-react';
// import { globalComponents } from './components/ProviderComponents';
// import { SubmittedValuesDisplay } from './components/SubmittedValuesDisplay';
// // import templateFormSchemaJson from '../../../instances/form/template-form.json';
// import type { FormSchema } from '@schepta/core';

// const templateFormSchema = templateFormSchemaJson as FormSchema;

// export function ExpressionExample() {
//   const [submittedValues, setSubmittedValues] = useState<any>(null);
//   const [providerInfo, setProviderInfo] = useState<string>('');

//   const handleSubmit = (values: any) => {
//     console.log('Form submitted:', values);
//     setSubmittedValues(values);
//     setProviderInfo(`Form submitted. User ID from externalContext: 1`);
//   };

//   return (
//     <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
//       <h1>schepta Template Expressions Example</h1>
      
//       <div style={{
//         marginBottom: '24px',
//         padding: '20px',
//         backgroundColor: '#fff3cd',
//         border: '1px solid #ffc107',
//         borderRadius: '8px'
//       }}>
//         <h3 style={{ marginTop: 0 }}>Template Expressions Features:</h3>
//         <ul>
//           <li>✅ Use {'{{ $externalContext.* }}'} in schema values</li>
//           <li>✅ Use {'{{ $formValues.* }}'} for dynamic form values</li>
//           <li>✅ Automatic processing of all template expressions</li>
//           <li>✅ Recursive processing in nested objects</li>
//         </ul>
//       </div>

//       <div style={{ border: '1px solid #ddd', padding: '24px', borderRadius: '8px' }}>
//         <h3 style={{ marginTop: 0 }}>Template Form (with {'{{ $externalContext.* }}'} and {'{{ $formValues.* }}'})</h3>
//         <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
//           This example demonstrates two key template expression features you can observe:
//           <br />
//           <strong>1. $externalContext expressions:</strong> The First Name label uses {'{{ $externalContext.user.name }}'} which resolves to <strong>"Test User"</strong> from the factory's externalContext prop.
//           <br />
//           <strong>2. $formValues expressions:</strong> The Email field's placeholder uses {'{{ $formValues.personalInfo.firstName }}'} which dynamically updates to show the current value of the First Name field as you type.
//         </p>
//         <FormFactory
//           schema={templateFormSchema}
//           components={globalComponents}
//           externalContext={{
//             user: { id: 1, name: 'Test User' },
//             api: 'https://api.example.com',
//             fieldName: 'last name',
//           }}
//           onSubmit={handleSubmit}
//           debug={true}
//         />
//       </div>

//       <SubmittedValuesDisplay
//         submittedValues={submittedValues}
//         providerInfo={providerInfo}
//       />
//     </div>
//   );
// }

