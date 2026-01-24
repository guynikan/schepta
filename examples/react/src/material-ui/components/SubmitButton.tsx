import React from "react";
import { Box, Button } from "@mui/material";
import { useFormContext } from "react-hook-form";
import type { SubmitButtonProps } from "@schepta/factory-react";

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  "x-content": content,
  onSubmit: onSubmitProp,
  externalContext,
  ...props
}) => {
  const { handleSubmit } = useFormContext();
  const onSubmit = onSubmitProp ?? externalContext?.onSubmit;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSubmit) handleSubmit(onSubmit)();
  };

  return (
    <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
      <Button
        type="button"
        variant="contained"
        onClick={handleClick}
        size="large"
        {...props}
      >
        {content || children || "Submit"}
      </Button>
    </Box>
  );
};
