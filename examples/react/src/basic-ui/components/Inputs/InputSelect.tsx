import React from 'react';

export const InputSelect = React.forwardRef<HTMLSelectElement, any>((props, ref) => {
    const {
      label,
      name,
      value,
      onChange,
      options = [],
      placeholder = "Select...",
      children,
      ...rest
    } = props;
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
        <select
          ref={ref}
          id={name}
          name={name}
          data-test-id={name}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((opt: any) => (
            <option
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </option>
          ))}
        </select>
        {children}
      </div>
    );
  });