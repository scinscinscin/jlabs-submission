import { BrowserRouter, Routes, Route } from "react-router";
import { LoginPage } from "./login";
import { RegisterPage } from "./register";
import { ToastContainer } from "react-toastify";
import { HomepageWrapper } from "./homepage";

export function App() {
  return (
    <BrowserRouter>
      <ToastContainer />

      <Routes>
        <Route path="/" element={<HomepageWrapper />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
