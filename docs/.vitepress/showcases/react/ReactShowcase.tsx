import React, { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ScheptaProvider } from "@schepta/adapter-react";
import { BasicFormPage } from "./basic/pages/BasicFormPage";
import { MaterialFormPage } from "./material-ui/pages/MaterialFormPage";
import { ChakraFormPage } from "./chakra-ui/pages/ChakraFormPage";
import simpleFormSchema from "../../../../instances/form/simple-form.json";
import { FormSchema } from "@schepta/core";
import { getToken } from "../../utils/getToken";
import { components } from "./basic/components/ComponentRegistry";

interface ReactShowcaseProps {
  variant?: "basic" | "material-ui" | "chakra-ui";
  isDark?: boolean;
}

export function ReactShowcase({
  variant = "basic",
  isDark = false,
}: ReactShowcaseProps) {
  const labelMiddleware = (props: any) => {
    if (props.label) {
      return { ...props, label: `[Provider] ${props.label}` };
    }
    return props;
  };

  const content = (() => {
    switch (variant) {
      case "chakra-ui":
        return <ChakraFormPage isDark={isDark} />;
      case "material-ui":
        return <MaterialFormPage isDark={isDark} />;
      default:
        return <BasicFormPage isDark={isDark} />;
    }
  })();

  return (
    <ScheptaProvider
      components={components}
      middlewares={[labelMiddleware]}
      externalContext={{
        user: { id: 1, name: "Provider User" },
        api: "https://api.example.com",
      }}
    >
      {content}
    </ScheptaProvider>
  );
}
