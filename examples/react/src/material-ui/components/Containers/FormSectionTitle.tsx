import React from "react";
import { Typography } from "@mui/material";

export const FormSectionTitle = ({
  "x-content": content,
  children,
  ...props
}: any) => {
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
