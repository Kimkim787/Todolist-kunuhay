import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Todos from "./pages/Todo";
import type { JSX } from "react";

function RequireAuth({ children }: { children: JSX.Element }) {
  const raw = localStorage.getItem("user");
  if (!raw) return <Navigate to="/login" replace />;

  try {
    JSON.parse(raw);
    return children;
  } catch {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Todos />
          </RequireAuth>
        }
      />
      <Route
        path="/todos"
        element={
          <RequireAuth>
            <Todos />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
