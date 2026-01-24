import React from "react";
import { Box } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { Button } from "@mui/material";

export const SubmitButton = ({
  children,
  "x-content": content,
  externalContext,
  ...props
}: any) => {
  const { handleSubmit } = useFormContext();
  const onSubmit = externalContext?.onSubmit;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSubmit) {
      handleSubmit(onSubmit)();
    }
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
