import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import {
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  Grid,
} from '@mui/material';
import { FormFactory } from '@schepta/factory-react';
import { createComponentSpec } from '@schepta/core';
import simpleFormSchema from '../../../tests/fixtures/simple-form.json';
import complexFormSchema from '../../../tests/fixtures/complex-form.json';

// Material UI Input Components
const InputText = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, ...rest } = props;
  return (
    <TextField
      ref={ref}
      fullWidth
      label={label}
      name={name}
      value={value || ''}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      data-test-id={name}
      margin="normal"
      {...rest}
    />
  );
});
InputText.displayName = 'InputText';

const InputSelect = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, options = [], placeholder = 'Select...', ...rest } = props;
  return (
    <TextField
      select
      fullWidth
      inputRef={ref}
      label={label}
      name={name}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      data-test-id={name}
      margin="normal"
      {...rest}
    >
      <MenuItem value="">{placeholder}</MenuItem>
      {options.map((opt: any) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
});
InputSelect.displayName = 'InputSelect';

const InputTextarea = React.forwardRef<HTMLTextAreaElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, rows = 4, ...rest } = props;
  return (
    <TextField
      inputRef={ref}
      fullWidth
      multiline
      rows={rows}
      label={label}
      name={name}
      value={value || ''}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      data-test-id={name}
      margin="normal"
      {...rest}
    />
  );
});
InputTextarea.displayName = 'InputTextarea';

const InputNumber = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, min, max, step, ...rest } = props;
  return (
    <TextField
      ref={ref}
      fullWidth
      type="number"
      label={label}
      name={name}
      value={value || ''}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : '')}
      inputProps={{ min, max, step }}
      data-test-id={name}
      margin="normal"
      {...rest}
    />
  );
});
InputNumber.displayName = 'InputNumber';

const InputDate = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, ...rest } = props;
  return (
    <TextField
      ref={ref}
      fullWidth
      type="date"
      label={label}
      name={name}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      InputLabelProps={{ shrink: true }}
      data-test-id={name}
      margin="normal"
      {...rest}
    />
  );
});
InputDate.displayName = 'InputDate';

const InputCheckbox = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, checked, onChange, ...rest } = props;
  return (
    <FormControlLabel
      control={
        <Checkbox
          inputRef={ref}
          name={name}
          checked={checked || false}
          onChange={(e) => onChange?.(e.target.checked)}
          data-test-id={name}
          {...rest}
        />
      }
      label={label}
    />
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
  return <Box sx={{ mb: 3 }} {...props}>{children}</Box>;
};

const FormSectionTitle = ({ 'x-content': content, children, ...props }: any) => {
  return (
    <Typography variant="h5" sx={{ mb: 2 }} {...props}>
      {content || children}
    </Typography>
  );
};

const FormSectionGroupContainer = ({ children, ...props }: any) => {
  return <Box {...props}>{children}</Box>;
};

const FormSectionGroup = ({ children, 'x-component-props': xComponentProps, ...props }: any) => {
  const columns = xComponentProps?.columns || '1fr 1fr';
  const gridColumns = columns === '1fr' ? 12 : 6;
  
  return (
    <Grid container spacing={2} {...props}>
      {React.Children.map(children, (child) => (
        <Grid item xs={12} sm={gridColumns}>
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

const FormContainer = ({ children, externalContext, ...props }: any) => {
  const { handleSubmit } = useFormContext();
  const onSubmit = externalContext?.onSubmit;
  
  return (
    <Box
      component="form"
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
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        type="button"
        variant="contained"
        onClick={handleClick}
        size="large"
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
    <Paper elevation={2} sx={{ p: 4 }}>
      <FormFactory
        schema={schema}
        components={components}
        onSubmit={handleSubmit}
        debug={true}
      />
    </Paper>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Spectra - Material UI Example
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/"
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Simple Form
          </Button>
          <Button
            component={Link}
            to="/complex"
            variant="outlined"
          >
            Complex Form
          </Button>
        </Box>

        <Routes>
          <Route path="/" element={<FormPage schema={simpleFormSchema} />} />
          <Route path="/complex" element={<FormPage schema={complexFormSchema} />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;

