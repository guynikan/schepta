import React from "react";
import ReactDOM from "react-dom/client";
import { ScheptaProvider } from "@schepta/adapter-react";
import { components } from "./components/ComponentRegistry";
import { ReactFormPage } from "./pages/ReactFormPage";

const Root = () => (
  <ScheptaProvider
    components={components}
    externalContext={{
      user: { id: 1, name: "React User" },
      api: "https://api.example.com",
    }}
  >
    <ReactFormPage />
  </ScheptaProvider>
);

export function bootstrap() {
  return Promise.resolve();
}

export function mount() {
  return new Promise<void>((resolve) => {
    const root = ReactDOM.createRoot(
      document.getElementById("root")!,
    );
    root.render(<Root />);
    resolve();
  });
}

export function unmount() {
  return new Promise<void>((resolve) => {
    const container = document.getElementById("root");
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
    }
    resolve();
  });
}