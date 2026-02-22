import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { applyThemeToDocument, getInitialEffectiveTheme, ThemeProvider } from "./components/theme/ThemeProvider";
import "./index.css";

applyThemeToDocument(getInitialEffectiveTheme());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
