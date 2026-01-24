import React from 'react';

export const InputDate = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    const { label, name, value, onChange, ...rest } = props;
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
          ref={ref}
          type="date"
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
        />
      </div>
    );
  });