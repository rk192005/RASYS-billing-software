import { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingBag, ShieldCheck, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../config';

export default function PurchaseManager() {
    const [purchases, setPurchases] = useState([]);
    const [newPurchase, setNewPurchase] = useState({
        date: new Date().toISOString().split('T')[0],
        supplier: '',
        category: 'Inventory', // Default category
        item: '',
        qty: '',
        unit: 'KG',
        rate: '',
        amount: ''
    });
    const [isAdding, setIsAdding] = useState(false);
    const [categories, setCategories] = useState(['Inventory', 'Office Supplies', 'Logistics', 'Maintenance', 'Salary', 'Other']);

    useEffect(() => {
        fetchPurchases();
    }, []);

    // Auto-calculate amount when Qty or Rate changes
    useEffect(() => {
        if (newPurchase.qty && newPurchase.rate) {
            setNewPurchase(p => ({ ...p, amount: (Number(p.qty) * Number(p.rate)).toFixed(2) }));
        }
    }, [newPurchase.qty, newPurchase.rate]);

    const fetchPurchases = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/purchases`);
            const data = await res.json();
            setPurchases(Array.isArray(data) ? data.reverse() : []);
        } catch (err) { console.error("Failed to fetch purchases"); toast.error("Failed to load purchases"); }
    };

    const handleSave = async () => {
        if (!newPurchase.item || !newPurchase.amount) return toast.error("Please fill Item and Amount");

        try {
            await fetch(`${API_BASE_URL}/api/purchases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPurchase)
            });
            toast.success("Purchase recorded!");
            fetchPurchases();
            setIsAdding(false);
            setNewPurchase({
                date: new Date().toISOString().split('T')[0],
                supplier: '',
                category: 'Inventory',
                item: '',
                qty: '',
                unit: 'KG',
                rate: '',
                amount: ''
            });
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
                    <ShoppingBag size={24} /> Purchases & Expenses
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem' }}>
                        Total: ₹ {totalExpenses.toFixed(2)}
                    </div>
                    <button className="btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={16} /> Add New Entry
                    </button>
                </div>
            </div>

            {/* List View */}
            <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem' }}>Supplier</th>
                            <th style={{ padding: '1rem' }}>Item</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Qty/Rate</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem' }}>{p.date}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '10px', background: '#e2e8f0', color: '#475569' }}>
                                        {p.category || 'General'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>{p.supplier || '-'}</td>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{p.item}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {p.qty && p.rate ? `${p.qty} ${p.unit} x ₹${p.rate}` : '-'}
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#dc2626', textAlign: 'right' }}>₹ {Number(p.amount).toFixed(2)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => handleDelete(p.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {purchases.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No purchase records found. Click "Add New Entry" to start.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '500px', padding: '2rem', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Add Expense / Purchase</h2>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div className="grid-cols-2">
                                <div>
                                    <label>Date</label>
                                    <input type="date" value={newPurchase.date} onChange={e => setNewPurchase({ ...newPurchase, date: e.target.value })} />
                                </div>
                                <div>
                                    <label>Category</label>
                                    <select value={newPurchase.category} onChange={e => setNewPurchase({ ...newPurchase, category: e.target.value })}>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <input placeholder="Supplier Name (Optional)" value={newPurchase.supplier} onChange={e => setNewPurchase({ ...newPurchase, supplier: e.target.value })} />
                            <input placeholder="Item Name / Service Description" value={newPurchase.item} onChange={e => setNewPurchase({ ...newPurchase, item: e.target.value })} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                <div>
                                    <label>Quantity</label>
                                    <input type="number" placeholder="Qty" value={newPurchase.qty} onChange={e => setNewPurchase({ ...newPurchase, qty: e.target.value })} />
                                </div>
                                <div>
                                    <label>Unit</label>
                                    <select value={newPurchase.unit} onChange={e => setNewPurchase({ ...newPurchase, unit: e.target.value })} style={{ height: '42px' }}>
                                        <option>KG</option>
                                        <option>PCS</option>
                                        <option>BOX</option>
                                        <option>LITERS</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Rate</label>
                                    <input type="number" placeholder="Price/Unit" value={newPurchase.rate} onChange={e => setNewPurchase({ ...newPurchase, rate: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label>Total Amount (₹)</label>
                                <input type="number" placeholder="Total Amount" value={newPurchase.amount} onChange={e => setNewPurchase({ ...newPurchase, amount: e.target.value })}
                                    style={{ fontWeight: 'bold', color: '#dc2626' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>Save Record</button>
                                <button onClick={() => setIsAdding(false)} style={{ flex: 1, border: '1px solid var(--border-color)', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
