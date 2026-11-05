import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastContainer } from "./components/common/Toast";
import { ChatBot } from "./components/common/ChatBot";
import { AppRoutes } from "./routes/AppRoutes";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer />
          <AppRoutes />
          <ChatBot />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
