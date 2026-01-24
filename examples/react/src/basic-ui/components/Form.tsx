import { FormFactory } from "@schepta/factory-react";
import React from "react";
import { FormSchema } from "@schepta/core";

export const Form = ({ schema }: { schema: FormSchema }) => {
  return (
    <>
      <div
        style={{
          border: "1px solid #ddd",
          padding: "24px",
          borderRadius: "8px",
        }}
      >
        <FormFactory
          schema={schema}
          debug={true}
        />
      </div>
    </>
  );
};
