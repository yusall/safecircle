import { Routes, Route } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";

function Auth() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default Auth;
