import { lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./layouts/AppShell";
import LandingPage from "./pages/LandingPage";

// Split per sector: a visitor reading about the course should not have to
// download the agency page to do it.
const AgencyPage = lazy(() => import("./pages/AgencyPage"));
const InstitutePage = lazy(() => import("./pages/InstitutePage"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<LandingPage />} />
          <Route path="agency" element={<AgencyPage />} />
          <Route path="institute" element={<InstitutePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
