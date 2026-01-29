import React from "react";
import { Typography, TypographyProps } from "@mui/material";
import type { FormSectionTitleProps } from "@schepta/factory-react";

export const FormSectionTitle: React.FC<FormSectionTitleProps & TypographyProps> = ({
  "x-content": content,
  children,
  ...props
}) => {
  return (
    <Typography
      variant="h5"
      sx={{ mb: 2 }}
      {...props}
    >
      {content || children}
    </Typography>
  );
};
