import React from 'react';

export const InputCheckbox = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    const { label, name, value, onChange, children, ...rest } = props;
    return (
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            ref={ref}
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
  });