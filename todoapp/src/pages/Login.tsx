import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5202"; // change if different

type UserDto = { id: number; username: string; email: string };

export default function Login() {
  const nav = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.message ?? `Login failed (HTTP ${res.status})`);
      }

      const user: UserDto = await res.json();

      // store logged-in user (simple approach)
      localStorage.setItem("user", JSON.stringify(user));

      // go somewhere after login
      nav("/todos", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Username or Email</span>
          <input
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            placeholder="e.g. alcan or alcan@example.com"
            autoComplete="username"
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
            autoComplete="current-password"
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
            No account? <a href="/register">Register</a>
          </p>

          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
