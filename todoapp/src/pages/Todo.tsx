import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Todo.css";

type Todo = { id: number; title: string; isDone: boolean };

const API = "http://localhost:5202/todos";

export default function Todos() {
  const nav = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // add form state
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  // search state
  const [query, setQuery] = useState("");

  // delete state (track which id is being deleted)
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  function logout() {
    localStorage.removeItem("user");
    nav("/login", { replace: true });
  }

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const res = await fetch(`${API}/getall`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTodos(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();

    const title = newTitle.trim();
    if (!title) return;

    setAdding(true);
    setErr("");

    try {
      const res = await fetch(`${API}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setNewTitle("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to add todo");
    } finally {
      setAdding(false);
    }
  }

  async function deleteTodo(id: number) {
    setDeletingId(id);
    setErr("");

    // optimistic UI
    const prev = todos;
    setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${API}/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      // rollback if delete failed
      setTodos(prev);
      setErr(e instanceof Error ? e.message : "Failed to delete todo");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleTodo(id: number){
    setTogglingId(id);
    setErr("");

    const prev = todos;
    // Optimistic UI
    setTodos((curr) => 
      curr.map((t) => (t.id == id ? {...t, isDone: !t.isDone } : t))
    );

    try {
      const res = await fetch(`${API}/toggle/${id}`, { method: "PUT"});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);

    } catch (e) {
      setErr( e instanceof Error ? e.message : "Failed to delete todo");
      setTodos(prev);
    } finally {
      setTogglingId(null);
    }
  }

  const filteredTodos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return todos;
    return todos.filter((t) => t.title.toLowerCase().includes(q));
  }, [todos, query]);

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <div className="header">
            <div className="titleWrap">
              <h1 className="title">Todos</h1>
              <p className="subtitle">Loading your list…</p>
            </div>
            <span className="badge">Please wait</span>
          </div>
          <div className="body">
            <div className="list skeleton">
              <div className="skeletonText">Loading…</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showingText = `Showing ${filteredTodos.length} of ${todos.length}`;

  return (
    <div className="page">
      <div className="card">
        <div className="header">
          <div className="titleWrap">
            <h1 className="title">Todos</h1>
            <p className="subtitle">Keep track of what matters today.</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="badge">{showingText}</span>
            <button className="btn" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div className="body">
          {err && <div className="alert">Error: {err}</div>}

          {/* SEARCH */}
          <div className="section">
            <div className="row">
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search todos…"
              />
              <button
                className="btn"
                type="button"
                onClick={() => setQuery("")}
                disabled={!query.trim()}
              >
                Clear
              </button>
            </div>
            <div className="hint">Type to filter by title.</div>
          </div>

          {/* ADD */}
          <form onSubmit={addTodo} className="section">
            <div className="row">
              <input
                className="input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="New todo…"
                disabled={adding}
              />
              <button
                className="btn btnPrimary"
                type="submit"
                disabled={adding || !newTitle.trim()}
              >
                {adding ? "Adding…" : "Add"}
              </button>
            </div>
          </form>

          <div className="divider" />

          {/* LIST */}
          <ul className="list">
            {filteredTodos.length === 0 ? (
              <li className="listItem listItemLast empty">
                No todos found{query.trim() ? ` for "${query.trim()}"` : ""}.
              </li>
            ) : (
              filteredTodos.map((t, idx) => {
                const isLast = idx === filteredTodos.length - 1;
                return (
                  <li
                    key={t.id}
                    className={`listItem ${isLast ? "listItemLast" : ""}`}
                  >
                    <span className={`status ${t.isDone ? "statusDone" : "statusTodo"}`} onClick={() => toggleTodo(t.id)}>
                      {t.isDone ? "Done" : "Todo"}
                    </span>

                    <div className="todoTextWrap">
                      <div className="todoTitle" title={t.title}>
                        {t.title}
                      </div>
                      <div className="todoMeta">
                        Status: {t.isDone ? "Completed ✅" : "Not done ❌"}
                      </div>
                    </div>

                    <button
                      className="btn btnDanger pushRight"
                      onClick={() => deleteTodo(t.id)}
                      disabled={deletingId === t.id}
                      type="button"
                    >
                      {deletingId === t.id ? "Deleting…" : "Delete"}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className="footer">
          <span>{showingText}</span>
          <span className="muted">API: {API}</span>
        </div>
      </div>
    </div>
  );
}
