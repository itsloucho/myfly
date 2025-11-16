import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type Role = "agency_admin" | "admin" | "agent" | "viewer";
type User = { id: number; name: string; email: string; phone?: string | null; role: Role };

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{ name: string; email: string; phone?: string; role: Role; password?: string }>({
    name: "",
    email: "",
    phone: "",
    role: "agent",
    password: "",
  });

  const allowedRoles: Role[] = useMemo(() => ["agency_admin", "admin", "agent", "viewer"], []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<User[]>("/users");
      setUsers(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", phone: "", role: "agent", password: "" });
      await fetchUsers();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to create user");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      await fetchUsers();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="users-tab">
      <form onSubmit={createUser} className="card">
        <h3>Create user</h3>
        <div className="grid">
          <label>
            <span>Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Full name"
              style={{ cursor: "text" }}
            />
          </label>
          <label>
            <span>Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder="email@example.com"
              style={{ cursor: "text" }}
            />
          </label>
          <label>
            <span>Phone</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              placeholder="+213…"
              style={{ cursor: "text" }}
            />
          </label>
          <label>
            <span>Role</span>
            <select
              value={form.role}
              onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as Role }))}
              style={{ cursor: "pointer" }}
            >
              {allowedRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Password (optional)</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              placeholder="Min 8 chars"
              style={{ cursor: "text" }}
            />
          </label>
        </div>
        <div>
          <button type="submit" style={{ cursor: "pointer" }}>Create</button>
        </div>
      </form>

      <div className="card">
        <h3>Users</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || "-"}</td>
                <td>{u.role}</td>
                <td>
                  <button onClick={() => deleteUser(u.id)} style={{ cursor: "pointer" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .card {
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 8px;
          padding: 16px;
          background: var(--bgElevated, #fff);
          margin-bottom: 16px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 8px;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          text-align: left;
          border-bottom: 1px solid var(--border, #eee);
          padding: 8px;
        }
        h3 {
          margin: 0 0 8px;
        }
      `}</style>
    </div>
  );
}


