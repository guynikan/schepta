import type { InputNumberProps } from '@schepta/factory-react';
import React from 'react';

export const InputNumber: React.FC<InputNumberProps> = ({ label, name, value, onChange, placeholder, min, max, step, ...rest }) => {
    return (
      <div style={{ marginBottom: "16px" }}>
        {label && (
          <label
            htmlFor={name}
            style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}
          >
            {label}
          </label>
        )}
        <input
          type="number"
          id={name}
          name={name}
          data-test-id={name}
          value={value || ""}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(e) =>
            onChange?.(e.target.value ? Number(e.target.value) : "")
          }
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          {...rest}
        />
      </div>
    );
  };