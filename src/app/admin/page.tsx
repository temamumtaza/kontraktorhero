"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2, Search, Edit, Save, X, User as UserIcon } from "lucide-react";

// ===== Helper: format currency =====
function formatRp(n: number) {
    return `Rp ${n.toLocaleString("id-ID")}`;
}
function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ===== Admin Login =====
function AdminLogin({ onLogin }: { onLogin: (token: string, admin: any) => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const adminLogin = useAction(api.adminActions.adminLogin);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await adminLogin({ username, password });
            localStorage.setItem("adminToken", result.token);
            onLogin(result.token, result.admin);
        } catch (err: any) {
            setError(err.message || "Login gagal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-sm space-y-4">
                <h1 className="text-xl font-bold text-white text-center">🔒 Admin Login</h1>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Login"}
                </button>
            </form>
        </div>
    );
}

// ===== Products Tab =====
function ProductsTab({ token }: { token: string }) {
    const products = useQuery(api.admin.getAllProducts, { token }) || [];
    const adminCrud = useAction(api.adminActions.adminCrud);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState({ slug: "", name: "", price: 0, originalPrice: 0, features: "", badge: "", sortOrder: 1, isActive: true });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const resetForm = () => {
        setForm({ slug: "", name: "", price: 0, originalPrice: 0, features: "", badge: "", sortOrder: 1, isActive: true });
        setEditing(null);
    };

    const handleSave = async () => {
        setLoading(true);
        setMsg("");
        try {
            const features = form.features.split("\n").map((f) => f.trim()).filter(Boolean);
            if (editing) {
                await adminCrud({
                    sessionToken: token,
                    operation: "updateProduct",
                    data: {
                        id: editing,
                        slug: form.slug,
                        name: form.name,
                        price: form.price,
                        originalPrice: form.originalPrice,
                        features,
                        badge: form.badge || undefined,
                        sortOrder: form.sortOrder,
                        isActive: form.isActive,
                    },
                });
                setMsg("✅ Produk diupdate!");
            } else {
                await adminCrud({
                    sessionToken: token,
                    operation: "createProduct",
                    data: {
                        slug: form.slug,
                        name: form.name,
                        price: form.price,
                        originalPrice: form.originalPrice,
                        features,
                        badge: form.badge || undefined,
                        sortOrder: form.sortOrder,
                        isActive: form.isActive,
                    },
                });
                setMsg("✅ Produk dibuat!");
            }
            resetForm();
        } catch (err: any) {
            setMsg(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (p: any) => {
        setEditing(p._id);
        setForm({
            slug: p.slug || "",
            name: p.name || "",
            price: p.price || 0,
            originalPrice: p.originalPrice || 0,
            features: (p.features || []).join("\n"),
            badge: p.badge || "",
            sortOrder: p.sortOrder || 1,
            isActive: p.isActive ?? true,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin hapus produk ini?")) return;
        try {
            await adminCrud({ sessionToken: token, operation: "deleteProduct", data: { id } });
            setMsg("✅ Produk dihapus.");
        } catch (err: any) {
            setMsg(`❌ ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">📦 Katalog Produk</h2>
            {msg && <p className="text-sm px-3 py-2 rounded bg-gray-800 text-gray-200">{msg}</p>}

            {/* Product list */}
            <div className="space-y-3">
                {products.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{p.name}</span>
                                {p.badge && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">{p.badge}</span>}
                                {!p.isActive && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">Inactive</span>}
                            </div>
                            <p className="text-sm text-gray-400">
                                slug: {p.slug} · {formatRp(p.price)} <span className="line-through text-gray-600">{formatRp(p.originalPrice)}</span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(p)} className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded">Edit</button>
                            <button onClick={() => handleDelete(p._id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Hapus</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
                <h3 className="font-semibold text-white">{editing ? "Edit Produk" : "Tambah Produk Baru"}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Slug (e.g. hero)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <input placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <input type="number" placeholder="Harga (Rp)" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <input type="number" placeholder="Harga Asli (coret)" value={form.originalPrice || ""} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <input placeholder="Badge (optional)" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                </div>
                <textarea placeholder="Features (1 per baris)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={3} className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                        Aktif
                    </label>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded disabled:opacity-50">
                        {loading ? "..." : editing ? "Update" : "Tambah"}
                    </button>
                    {editing && <button onClick={resetForm} className="px-4 py-2 bg-gray-600 text-white text-sm rounded">Batal</button>}
                </div>
            </div>
        </div>
    );
}

// ===== Promos Tab =====
function PromosTab({ token }: { token: string }) {
    const promos = useQuery(api.admin.getAllPromos, { token }) || [];
    const adminCrud = useAction(api.adminActions.adminCrud);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState({
        code: "", discountType: "percentage", discountValue: 0, minPurchase: "",
        maxUses: "", validFrom: "", validUntil: "", isActive: true, applicableProducts: "",
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const resetForm = () => {
        setForm({ code: "", discountType: "percentage", discountValue: 0, minPurchase: "", maxUses: "", validFrom: "", validUntil: "", isActive: true, applicableProducts: "" });
        setEditing(null);
    };

    // Helper to format date for datetime-local input (handling timezone offset roughly for display)
    const toInputDate = (ts: number | string) => {
        if (!ts) return "";
        const date = new Date(ts);
        // Correcting for local timezone offset manually to ensure it shows up in datetime-local correctly
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

    const handleSave = async () => {
        setLoading(true);
        setMsg("");
        try {
            const data: any = {
                code: form.code.toUpperCase(),
                discountType: form.discountType,
                discountValue: form.discountValue,
                isActive: form.isActive,
                validFrom: new Date(form.validFrom).getTime(),
                validUntil: new Date(form.validUntil).getTime(),
            };
            if (form.minPurchase) data.minPurchase = Number(form.minPurchase);
            if (form.maxUses) data.maxUses = Number(form.maxUses);
            if (form.applicableProducts) data.applicableProducts = form.applicableProducts.split(",").map((s: string) => s.trim()).filter(Boolean);

            if (editing) {
                data.id = editing;
                await adminCrud({ sessionToken: token, operation: "updatePromo", data });
                setMsg("✅ Promo diupdate!");
            } else {
                await adminCrud({ sessionToken: token, operation: "createPromo", data });
                setMsg("✅ Promo dibuat!");
            }
            resetForm();
        } catch (err: any) {
            setMsg(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (p: any) => {
        setEditing(p._id);
        setForm({
            code: p.code || "",
            discountType: p.discountType || "percentage",
            discountValue: p.discountValue || 0,
            minPurchase: p.minPurchase?.toString() || "",
            maxUses: p.maxUses?.toString() || "",
            validFrom: toInputDate(p.validFrom),
            validUntil: toInputDate(p.validUntil),
            isActive: p.isActive ?? true,
            applicableProducts: (p.applicableProducts || []).join(", "),
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin hapus promo ini?")) return;
        try {
            await adminCrud({ sessionToken: token, operation: "deletePromo", data: { id } });
            setMsg("✅ Promo dihapus.");
        } catch (err: any) {
            setMsg(`❌ ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">🎟️ Kode Promo</h2>
            {msg && <p className="text-sm px-3 py-2 rounded bg-gray-800 text-gray-200">{msg}</p>}

            <div className="space-y-3">
                {promos.map((p: any) => (
                    <div key={p._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-mono font-bold text-white text-lg">{p.code}</span>
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${p.isActive ? "bg-green-600" : "bg-red-600"} text-white`}>
                                    {p.isActive ? "Aktif" : "Nonaktif"}
                                </span>
                                {p.maxUses && <span className="ml-2 text-xs text-gray-400">{p.usedCount}/{p.maxUses} dipakai</span>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(p)} className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded">Edit</button>
                                <button onClick={() => handleDelete(p._id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Hapus</button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                            {p.discountType === "percentage" ? `${p.discountValue}%` : formatRp(p.discountValue)} off
                            {p.applicableProducts?.length > 0 && ` · Untuk: ${p.applicableProducts.join(", ")}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatDate(p.validFrom)} — {formatDate(p.validUntil)}
                        </p>
                    </div>
                ))}
                {promos.length === 0 && <p className="text-gray-500 text-sm">Belum ada kode promo.</p>}
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
                <h3 className="font-semibold text-white">{editing ? "Edit Promo" : "Buat Promo Baru"}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Kode (e.g. DISKON50)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm">
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed">Fixed (Rp)</option>
                    </select>
                    <input type="number" placeholder="Nilai Diskon" value={form.discountValue || ""} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <input type="number" placeholder="Min. Pembelian (optional)" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <input type="number" placeholder="Maks. Penggunaan (optional)" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <input placeholder="Produk (slug, pisah koma)" value={form.applicableProducts} onChange={(e) => setForm({ ...form, applicableProducts: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <input type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                    <input type="datetime-local" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                        Aktif
                    </label>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded disabled:opacity-50">
                        {loading ? "..." : editing ? "Update" : "Buat Promo"}
                    </button>
                    {editing && <button onClick={resetForm} className="px-4 py-2 bg-gray-600 text-white text-sm rounded">Batal</button>}
                </div>
            </div>
        </div>
    );
}

// ===== Admins Tab =====
function AdminsTab({ token, currentRole }: { token: string; currentRole: string }) {
    const admins = useQuery(api.admin.getAllAdmins, { token }) || [];
    const createAdmin = useAction(api.adminActions.createAdmin);
    const [form, setForm] = useState({ username: "", password: "", role: "admin", displayName: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleCreate = async () => {
        if (currentRole !== "super_admin") {
            setMsg("❌ Hanya super admin yang bisa membuat akun admin.");
            return;
        }
        setLoading(true);
        setMsg("");
        try {
            await createAdmin({
                sessionToken: token,
                username: form.username,
                password: form.password,
                role: form.role,
                displayName: form.displayName || undefined,
            });
            setMsg("✅ Admin baru dibuat!");
            setForm({ username: "", password: "", role: "admin", displayName: "" });
        } catch (err: any) {
            setMsg(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">👥 Admin Accounts</h2>
            {msg && <p className="text-sm px-3 py-2 rounded bg-gray-800 text-gray-200">{msg}</p>}

            <div className="space-y-3">
                {admins.map((a: any) => (
                    <div key={a._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div>
                            <span className="font-semibold text-white">{a.displayName || a.username}</span>
                            <span className="ml-2 text-xs text-gray-400">@{a.username}</span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded ${a.role === "super_admin" ? "bg-purple-600" : a.role === "admin" ? "bg-blue-600" : "bg-gray-600"} text-white`}>
                                {a.role}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(a._creationTime)}</span>
                    </div>
                ))}
            </div>

            {currentRole === "super_admin" && (
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
                    <h3 className="font-semibold text-white">Tambah Admin Baru</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                        <input placeholder="Display Name (optional)" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm" />
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm">
                            <option value="admin">Admin</option>
                            <option value="content_editor">Content Editor</option>
                        </select>
                    </div>
                    <button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded disabled:opacity-50">
                        {loading ? "..." : "Buat Admin"}
                    </button>
                </div>
            )}
        </div>
    );
}

// ===== Users Tab =====
function UsersTab({ token }: { token: string }) {
    const users = useQuery(api.admin.getAllUsers, { token });
    const adminCrud = useAction(api.adminActions.adminCrud);

    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<any>(null);
    const [newTier, setNewTier] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const filteredUsers = users?.filter((user: any) =>
        (user.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone || "").includes(searchTerm)
    ) || [];

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setNewTier(user.tier || "starter");
    };

    const handleSave = async () => {
        if (!editingUser) return;
        setIsSaving(true);
        try {
            await adminCrud({
                sessionToken: token,
                operation: "updateUserTier",
                data: {
                    userId: editingUser._id,
                    tier: newTier,
                },
            });
            setEditingUser(null);
        } catch (error) {
            console.error("Failed to update tier:", error);
            alert("Gagal mengubah tier user.");
        } finally {
            setIsSaving(false);
        }
    };

    if (users === undefined) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">👥 Manajemen User</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-900 border-b border-gray-700 text-gray-400 text-sm">
                            <th className="p-4 font-semibold">User</th>
                            <th className="p-4 font-semibold">Kontak</th>
                            <th className="p-4 font-semibold">Tier</th>
                            <th className="p-4 font-semibold">Bergabung</th>
                            <th className="p-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    Tidak ada user ditemukan.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user: any) => (
                                <tr key={user._id} className="border-b border-gray-700 last:border-0 hover:bg-gray-750">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold shrink-0">
                                                {user.firstName?.[0] || <UserIcon className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
                                                <div className="text-xs text-gray-500">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-300">{user.email}</div>
                                        <div className="text-xs text-gray-500">{user.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.tier === 'hero'
                                                ? 'bg-amber-900/30 text-amber-400 border border-amber-900/50'
                                                : 'bg-gray-700 text-gray-400 border border-gray-600'
                                            }`}>
                                            {user.tier === 'hero' ? 'HERO' : 'STARTER'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {formatDate(user._creationTime)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-white/5 transition-colors"
                                            title="Edit Tier"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Ubah Tier User</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6 space-y-4">
                            <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
                                User: <span className="text-white font-medium">{editingUser.firstName}</span><br />
                                Email: <span className="text-gray-400">{editingUser.email}</span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Tier</label>
                                <select
                                    value={newTier}
                                    onChange={(e) => setNewTier(e.target.value)}
                                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="starter">Starter</option>
                                    <option value="hero">Hero Member</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ===== Main Admin Page =====
export default function AdminPage() {
    const [token, setToken] = useState<string | null>(null);
    const [adminInfo, setAdminInfo] = useState<any>(null);
    const [tab, setTab] = useState<"products" | "promos" | "admins" | "users">("products");

    // Restore session
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const verifyResult = useQuery(api.admin.verifyAdminSession, { token: savedToken || token || undefined });

    useEffect(() => {
        if (verifyResult && !adminInfo) {
            setToken(savedToken);
            setAdminInfo(verifyResult);
        }
    }, [verifyResult, savedToken, adminInfo]);

    const handleLogin = (t: string, admin: any) => {
        setToken(t);
        setAdminInfo(admin);
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        setToken(null);
        setAdminInfo(null);
    };

    if (!adminInfo) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    const activeToken = token || savedToken || "";

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">⚙️ Admin Dashboard</span>
                    <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                        {adminInfo.username} ({adminInfo.role})
                    </span>
                </div>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">
                    Logout
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800 px-6">
                <div className="flex gap-1 overflow-x-auto">
                    {(["products", "promos", "admins", "users"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${tab === t
                                ? "border-blue-500 text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            {t === "products" ? "📦 Produk" : t === "promos" ? "🎟️ Promo" : t === "admins" ? "👮 Admin" : "👥 User"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-6">
                {tab === "products" && <ProductsTab token={activeToken} />}
                {tab === "promos" && <PromosTab token={activeToken} />}
                {tab === "admins" && <AdminsTab token={activeToken} currentRole={adminInfo.role} />}
                {tab === "users" && <UsersTab token={activeToken} />}
            </div>
        </div>
    );
}
