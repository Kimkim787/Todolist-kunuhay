import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
const API = "http://localhost:5202"; // change if your backend url differs

type UserDto = { id: number; username: string; email: string };

export default function Register() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.message ?? `Registration failed (HTTP ${res.status})`);
      }

      const user: UserDto = await res.json();

      // simple "logged-in" state
      localStorage.setItem("user", JSON.stringify(user));

      // go to login or home
      nav("/todos", { replace: true }); // or nav("/login") if you prefer
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Register</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. alcan"
            autoComplete="username"
            required
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. alcan@example.com"
            autoComplete="email"
            required
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            required
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        {err && <p style={{ color: "crimson", margin: 0 }}>{err}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <p style={{ marginTop: 10 }}>
            Already have an account? <a href="/login">Login</a>
          </p>

          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
