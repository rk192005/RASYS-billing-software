import { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../config';

export default function PurchaseManager() {
    const [purchases, setPurchases] = useState([]);
    const [newPurchase, setNewPurchase] = useState({ date: new Date().toISOString().split('T')[0], supplier: '', item: '', amount: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/purchases`);
            const data = await res.json();
            setPurchases(Array.isArray(data) ? data.reverse() : []);
        } catch (err) { console.error("Failed to fetch purchases"); toast.error("Failed to load purchases"); }
    };

    const handleSave = async () => {
        if (!newPurchase.amount || !newPurchase.item) return toast.error("Please fill details");
        try {
            await fetch(`${API_BASE_URL}/api/purchases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPurchase)
            });
            toast.success("Purchase added");
            fetchPurchases();
            setIsAdding(false);
            setNewPurchase({ date: new Date().toISOString().split('T')[0], supplier: '', item: '', amount: '' });
        } catch (err) { toast.error("Error saving purchase"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this record?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/purchases/${id}`, { method: 'DELETE' });
            toast.success("Record deleted");
            fetchPurchases();
        } catch (err) { console.error("Error deleting"); toast.error("Failed to delete"); }
    };

    const totalExpenses = purchases.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingBag size={24} /> Purchase & Expenses
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem' }}>
                        Exp: ₹ {totalExpenses.toFixed(2)}
                    </div>
                    <button className="btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={16} /> Add Expense
                    </button>
                </div>
            </div>

            {/* Security Badge */}
            <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <ShieldCheck size={18} color="#10b981" />
                <span>Secure Ledger: All purchase data is encrypted and protected by Rasys Firewall.</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Supplier / Source</th>
                            <th style={{ padding: '1rem' }}>Item Details</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem' }}>{p.date}</td>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{p.supplier || '-'}</td>
                                <td style={{ padding: '1rem' }}>{p.item}</td>
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#dc2626' }}>₹ {Number(p.amount).toFixed(2)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => handleDelete(p.id)} style={{ color: '#ef4444', background: 'none' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAdding && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add Expense</h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <input type="date" value={newPurchase.date} onChange={e => setNewPurchase({ ...newPurchase, date: e.target.value })} />
                            <input placeholder="Supplier Name (Optional)" value={newPurchase.supplier} onChange={e => setNewPurchase({ ...newPurchase, supplier: e.target.value })} />
                            <input placeholder="Item / Service Name" value={newPurchase.item} onChange={e => setNewPurchase({ ...newPurchase, item: e.target.value })} />
                            <input type="number" placeholder="Amount" value={newPurchase.amount} onChange={e => setNewPurchase({ ...newPurchase, amount: e.target.value })} />

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>Save</button>
                                <button onClick={() => setIsAdding(false)} style={{ flex: 1, border: '1px solid var(--border-color)', background: 'white', borderRadius: '6px' }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
