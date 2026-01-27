import { Routes, Route } from "react-router-dom";
import Todos from "./pages/Todo";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Todos />} />
        <Route path="/todos" element={<Todos />} />
      </Routes>
  );
}
