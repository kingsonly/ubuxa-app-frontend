import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "mobx-react";
import rootStore from "./stores/rootStore";
import { TenantProvider } from "./hooks/tenantsContext";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider rootStore={rootStore}>
        <TenantProvider>
          <App />
        </TenantProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
