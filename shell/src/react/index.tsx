import React from "react";
import ReactDOM from "react-dom/client";
import { ScheptaProvider } from "@schepta/adapter-react";
import { components } from "./basic-ui/components/ComponentRegistry";
import App from "./App";
import './index.css';

const Root = () => (
  <ScheptaProvider
    components={components}
    externalContext={{
      user: { id: 1, name: "React User" },
      api: "https://api.example.com",
    }}
  >
    <App />
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