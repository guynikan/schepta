import React from "react";
import ReactDOMClient from "react-dom/client";
import App from "./App";
import './index.css';
import singleSpaReact from "single-spa-react";
import { HomePage } from "./pages/HomePage";

export const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  errorBoundary(err, info, props) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#c62828' }}>
        <h2>Something went wrong</h2>
        <pre style={{ textAlign: 'left', overflow: 'auto' }}>{err?.message}</pre>
      </div>
    );
  },
});

export const homeLifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: HomePage,
  errorBoundary(err, info, props) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#c62828' }}>
        <h2>Something went wrong</h2>
        <pre style={{ textAlign: 'left', overflow: 'auto' }}>{err?.message}</pre>
      </div>
    );
  },
});