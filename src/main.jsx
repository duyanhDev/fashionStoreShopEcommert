import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainLayout from "./Layout";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store"; // Thêm persistor
import { PersistGate } from "redux-persist/integration/react";
import { HelmetProvider } from "react-helmet-async";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>
          <MainLayout />
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
