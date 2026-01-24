import React from "react";

export const InputText = React.forwardRef<HTMLInputElement, any>((props, ref) => {
  const { label, name, value, onChange, placeholder, ...rest } = props;
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
        id={name}
        name={name}
        data-test-id={name}
        value={value || ""}
        placeholder={placeholder}
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