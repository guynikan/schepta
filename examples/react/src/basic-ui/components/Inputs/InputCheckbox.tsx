import React from 'react';
import type { InputCheckboxProps } from '@schepta/factory-react';

export const InputCheckbox: React.FC<InputCheckboxProps> = ({ label, name, value, onChange, children, ...rest }) => {
    return (
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            name={name}
            data-test-id={name}
            checked={value || false}
            onChange={(e) => onChange?.(e.target.checked)}
            {...rest}
          />
          {label}
        </label>
        {children}
      </div>
    );
  };