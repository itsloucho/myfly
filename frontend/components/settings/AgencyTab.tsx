import React, { useEffect, useState } from "react";
import api from "@/lib/api";

type AgencySettings = {
  name: string;
  logo_light_url?: string;
  logo_dark_url?: string;
  contact?: {
    phone1?: string | null;
    phone2?: string | null;
    email?: string | null;
    address?: string | null;
    maps_url?: string | null;
    whatsapp?: string | null;
    social?: {
      facebook?: string | null;
      instagram?: string | null;
      linkedin?: string | null;
      x?: string | null;
    };
  };
  public_language?: "fr" | "ar" | "en";
  timezone?: string | null;
  currency?: string | null;
  brand_primary?: string | null;
};

export function AgencyTab() {
  const [data, setData] = useState<AgencySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<AgencySettings>("/agency-settings");
        setData(
          res.data ?? {
            name: "",
            contact: { social: {} },
          }
        );
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load agency settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const uploadLogo = async (variant: "light" | "dark", file: File) => {
    const form = new FormData();
    form.append("variant", variant);
    form.append("file", file);
    const res = await api.post<{ url: string }>("/agency-logo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setData((prev) =>
      prev
        ? {
            ...prev,
            ...(variant === "light" ? { logo_light_url: res.data.url } : { logo_dark_url: res.data.url }),
          }
        : prev
    );
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        contact_phone1: data.contact?.phone1 ?? "",
        contact_phone2: data.contact?.phone2 ?? "",
        contact_email: data.contact?.email ?? "",
        address: data.contact?.address ?? "",
        public_language: data.public_language ?? "fr",
        timezone: data.timezone ?? "",
        currency: data.currency ?? "",
        maps_url: data.contact?.maps_url ?? "",
        whatsapp: data.contact?.whatsapp ?? "",
        brand_primary: data.brand_primary ?? "",
        social: {
          facebook: data.contact?.social?.facebook ?? "",
          instagram: data.contact?.social?.instagram ?? "",
          linkedin: data.contact?.social?.linkedin ?? "",
          x: data.contact?.social?.x ?? "",
        },
      };
      const res = await api.post<AgencySettings>("/agency-settings", payload);
      setData(res.data);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to save agency settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <form onSubmit={onSave} className="card">
      <h3>Agency Identity</h3>
      <div className="grid">
        <label>
          <span>Agency name</span>
          <input
            required
            value={data.name || ""}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Agency name"
            style={{ cursor: "text" }}
          />
        </label>
        <div className="logo-group">
          <span>Logo (light)</span>
          {data.logo_light_url ? <img src={data.logo_light_url} alt="logo light" height={40} /> : <em>No logo</em>}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && uploadLogo("light", e.target.files[0])}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className="logo-group">
          <span>Logo (dark)</span>
          {data.logo_dark_url ? <img src={data.logo_dark_url} alt="logo dark" height={40} /> : <em>No logo</em>}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && uploadLogo("dark", e.target.files[0])}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      <h3>Contact</h3>
      <div className="grid">
        <label>
          <span>Phone 1</span>
          <input
            value={data.contact?.phone1 || ""}
            onChange={(e) => setData({ ...data, contact: { ...data.contact, phone1: e.target.value } })}
            placeholder="+213…"
            style={{ cursor: "text" }}
          />
        </label>
        <label>
          <span>Phone 2</span>
          <input
            value={data.contact?.phone2 || ""}
            onChange={(e) => setData({ ...data, contact: { ...data.contact, phone2: e.target.value } })}
            placeholder="+213…"
            style={{ cursor: "text" }}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={data.contact?.email || ""}
            onChange={(e) => setData({ ...data, contact: { ...data.contact, email: e.target.value } })}
            placeholder="contact@example.com"
            style={{ cursor: "text" }}
          />
        </label>
        <label>
          <span>Address</span>
          <textarea
            value={data.contact?.address || ""}
            onChange={(e) => setData({ ...data, contact: { ...data.contact, address: e.target.value } })}
            placeholder="Address"
          />
        </label>
        <label>
          <span>WhatsApp</span>
          <input
            value={data.contact?.whatsapp || ""}
            onChange={(e) => setData({ ...data, contact: { ...data.contact, whatsapp: e.target.value } })}
            placeholder="+213…"
            style={{ cursor: "text" }}
          />
        </label>
        <label>
          <span>Google Maps URL</span>
          <input
            value={data.contact?.maps_url || ""}
            onChange={(e) => setData({ ...data, contact: { ...data.contact, maps_url: e.target.value } })}
            placeholder="https://maps.google.com/?q=…"
            style={{ cursor: "text" }}
          />
        </label>
      </div>

      <h3>Public Site</h3>
      <div className="grid">
        <label>
          <span>Public language</span>
          <select
            value={data.public_language || "fr"}
            onChange={(e) => setData({ ...data, public_language: e.target.value as any })}
            style={{ cursor: "pointer" }}
          >
            <option value="fr">French</option>
            <option value="ar">Arabic</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          <span>Brand primary color</span>
          <input
            value={data.brand_primary || ""}
            onChange={(e) => setData({ ...data, brand_primary: e.target.value })}
            placeholder="#0A84FF"
            style={{ cursor: "text" }}
          />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="submit" disabled={saving} style={{ cursor: "pointer" }}>
          {saving ? "Saving…" : "Save"}
        </button>
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
        .logo-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        h3 {
          margin: 0 0 8px;
        }
      `}</style>
    </form>
  );
}


