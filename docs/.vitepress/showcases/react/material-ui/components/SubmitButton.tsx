import React from "react";
import { Box, Button } from "@mui/material";
import type { SubmitButtonProps } from "@schepta/factory-react";

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  "x-content": content,
  ...props
}) => {

  return (
    <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
      <Button
        type="submit"
        variant="contained"
        size="large"
        {...props}
      >
        {content || children || "Submit"}
      </Button>
    </Box>
  );
};
