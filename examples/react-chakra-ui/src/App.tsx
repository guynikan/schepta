import React from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import {
  Input,
  Select,
  Checkbox,
  Textarea,
  Button,
  Box,
  Heading,
  Container,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Link,
} from '@chakra-ui/react';
import { FormFactory } from '@spectra/factory-react';
import { createComponentSpec } from '@spectra/core';
import simpleFormSchema from '../../../tests/fixtures/simple-form.json';
import complexFormSchema from '../../../tests/fixtures/complex-form.json';

// Chakra UI Input Components
const InputText = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, ...rest } = props;
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Input
        ref={ref}
        name={name}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        data-test-id={name}
        {...rest}
      />
    </FormControl>
  );
});
InputText.displayName = 'InputText';

const InputSelect = React.forwardRef<HTMLSelectElement, any>((props, ref) => {
  const { label, name, value, onChange, options = [], placeholder = 'Select...', ...rest } = props;
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Select
        ref={ref}
        name={name}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        data-test-id={name}
        placeholder={placeholder}
        {...rest}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
});
InputSelect.displayName = 'InputSelect';

const InputTextarea = React.forwardRef<HTMLTextAreaElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, rows = 4, ...rest } = props;
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Textarea
        ref={ref}
        name={name}
        value={value || ''}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        data-test-id={name}
        {...rest}
      />
    </FormControl>
  );
});
InputTextarea.displayName = 'InputTextarea';

const InputNumber = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, min, max, step, ...rest } = props;
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Input
        ref={ref}
        type="number"
        name={name}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : '')}
        min={min}
        max={max}
        step={step}
        data-test-id={name}
        {...rest}
      />
    </FormControl>
  );
});
InputNumber.displayName = 'InputNumber';

const InputDate = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, ...rest } = props;
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Input
        ref={ref}
        type="date"
        name={name}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        data-test-id={name}
        {...rest}
      />
    </FormControl>
  );
});
InputDate.displayName = 'InputDate';

const InputCheckbox = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, checked, onChange, ...rest } = props;
  return (
    <Checkbox
      ref={ref}
      name={name}
      isChecked={checked || false}
      onChange={(e) => onChange?.(e.target.checked)}
      data-test-id={name}
      {...rest}
    >
      {label}
    </Checkbox>
  );
});
InputCheckbox.displayName = 'InputCheckbox';

const InputPhone = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  return <InputText ref={ref} {...props} type="tel" />;
});
InputPhone.displayName = 'InputPhone';

// Container Components
const FormField = ({ children, ...props }: any) => {
  return <Box {...props}>{children}</Box>;
};

const FormSectionContainer = ({ children, ...props }: any) => {
  return <Box mb={6} {...props}>{children}</Box>;
};

const FormSectionTitle = ({ 'x-content': content, children, ...props }: any) => {
  return (
    <Heading size="md" mb={4} {...props}>
      {content || children}
    </Heading>
  );
};

const FormSectionGroupContainer = ({ children, ...props }: any) => {
  return <Box {...props}>{children}</Box>;
};

const FormSectionGroup = ({ children, 'x-component-props': xComponentProps, ...props }: any) => {
  const columns = xComponentProps?.columns || '1fr 1fr';
  const gridColumns = columns === '1fr' ? 1 : 2;
  
  return (
    <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4} {...props}>
      {React.Children.map(children, (child, index) => (
        <GridItem key={index}>{child}</GridItem>
      ))}
    </Grid>
  );
};

const FormContainer = ({ children, externalContext, ...props }: any) => {
  const { handleSubmit } = useFormContext();
  const onSubmit = externalContext?.onSubmit;
  
  return (
    <Box
      as="form"
      onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
      {...props}
    >
      {children}
    </Box>
  );
};

const SubmitButton = ({ children, 'x-content': content, externalContext, ...props }: any) => {
  const { handleSubmit } = useFormContext();
  const onSubmit = externalContext?.onSubmit;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSubmit) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Box mt={6} display="flex" justifyContent="flex-end">
      <Button
        type="button"
        colorScheme="blue"
        size="lg"
        onClick={handleClick}
        {...props}
      >
        {content || children || 'Submit'}
      </Button>
    </Box>
  );
};

// Create component specs
const components = {
  'form-container': createComponentSpec({
    id: 'form-container',
    type: 'form-container',
    factory: (props, runtime) => FormContainer,
  }),
  InputText: createComponentSpec({
    id: 'InputText',
    type: 'field',
    factory: (props, runtime) => InputText,
  }),
  InputSelect: createComponentSpec({
    id: 'InputSelect',
    type: 'field',
    factory: (props, runtime) => InputSelect,
  }),
  InputCheckbox: createComponentSpec({
    id: 'InputCheckbox',
    type: 'field',
    factory: (props, runtime) => InputCheckbox,
  }),
  InputPhone: createComponentSpec({
    id: 'InputPhone',
    type: 'field',
    factory: (props, runtime) => InputPhone,
  }),
  InputTextarea: createComponentSpec({
    id: 'InputTextarea',
    type: 'field',
    factory: (props, runtime) => InputTextarea,
  }),
  InputNumber: createComponentSpec({
    id: 'InputNumber',
    type: 'field',
    factory: (props, runtime) => InputNumber,
  }),
  InputDate: createComponentSpec({
    id: 'InputDate',
    type: 'field',
    factory: (props, runtime) => InputDate,
  }),
  SubmitButton: createComponentSpec({
    id: 'SubmitButton',
    type: 'content',
    factory: (props, runtime) => SubmitButton,
  }),
  FormField: createComponentSpec({
    id: 'FormField',
    type: 'container',
    factory: (props, runtime) => FormField,
  }),
  FormSectionContainer: createComponentSpec({
    id: 'FormSectionContainer',
    type: 'container',
    factory: (props, runtime) => FormSectionContainer,
  }),
  FormSectionTitle: createComponentSpec({
    id: 'FormSectionTitle',
    type: 'content',
    factory: (props, runtime) => FormSectionTitle,
  }),
  FormSectionGroupContainer: createComponentSpec({
    id: 'FormSectionGroupContainer',
    type: 'container',
    factory: (props, runtime) => FormSectionGroupContainer,
  }),
  FormSectionGroup: createComponentSpec({
    id: 'FormSectionGroup',
    type: 'container',
    factory: (props, runtime) => FormSectionGroup,
  }),
};

function FormPage({ schema }: { schema: any }) {
  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values);
    alert('Form submitted! Check console for values.');
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <FormFactory
        schema={schema}
        components={components}
        onSubmit={handleSubmit}
        debug={true}
      />
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Container maxW="container.md" py={8}>
        <Heading as="h1" size="xl" mb={6}>
          Spectra - Chakra UI Example
        </Heading>
        
        <HStack spacing={4} mb={6}>
          <Link as={RouterLink} to="/" color="blue.500">
            Simple Form
          </Link>
          <Link as={RouterLink} to="/complex" color="blue.500">
            Complex Form
          </Link>
        </HStack>

        <Routes>
          <Route path="/" element={<FormPage schema={simpleFormSchema} />} />
          <Route path="/complex" element={<FormPage schema={complexFormSchema} />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;

