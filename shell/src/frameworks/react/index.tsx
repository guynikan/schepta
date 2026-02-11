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
});

export const homeLifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: HomePage,
});