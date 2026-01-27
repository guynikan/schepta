import type { InputTextareaProps } from "@schepta/factory-react";
import React from "react";

export const InputTextarea: React.FC<InputTextareaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  ...rest
}) => {
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
      <textarea
        id={name}
        name={name}
        data-test-id={name}
        value={value || ""}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontFamily: "inherit",
        }}
        {...rest}
      />
    </div>
  );
};
