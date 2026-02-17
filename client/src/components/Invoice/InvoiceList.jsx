import { useState, useEffect } from 'react';
import { Plus, Search, FileText, CheckCircle, Clock, Trash2, Edit } from 'lucide-react';

export default function InvoiceList({ onEdit, onCreate }) {
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/invoices');
            const data = await res.json();
            // Sort by newest first
            setInvoices(Array.isArray(data) ? data.reverse() : []);
        } catch (err) {
            console.error("Failed to fetch invoices");
        }
    };

    const handleStatusToggle = async (invoice) => {
        const newStatus = invoice.status === 'Paid' ? 'Unpaid' : 'Paid';
        try {
            // Optimistic update
            const updatedInvoices = invoices.map(i =>
                i.id === invoice.id ? { ...i, status: newStatus } : i
            );
            setInvoices(updatedInvoices);

            await fetch(`http://localhost:3001/api/invoices/${invoice.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            console.error("Failed status update");
            fetchInvoices(); // Revert on fail
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Invoices</h1>
                <button className="btn-primary" onClick={onCreate}>
                    <Plus size={16} /> New Invoice
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            placeholder="Search by client or invoice #..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem', width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                        />
                    </div>
                </div>

                {filteredInvoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No invoices found. Create your first one!</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Invoice #</th>
                                <th style={{ padding: '1rem' }}>Client</th>
                                <th style={{ padding: '1rem' }}>Amount</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv, index) => {
                                const total = inv.items?.reduce((sum, item) => sum + (item.qty * item.price), 0) || 0;
                                const isPaid = inv.status === 'Paid';
                                return (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{inv.date}</td>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{inv.id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{inv.client.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.client.address?.slice(0, 20)}...</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹ {total.toFixed(2)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleStatusToggle(inv); }}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '99px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: isPaid ? '#dcfce7' : '#fee2e2',
                                                    color: isPaid ? '#166534' : '#991b1b',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                                                }}
                                            >
                                                {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                {isPaid ? 'Paid' : 'Unpaid'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button onClick={() => onEdit(inv)} style={{ padding: '0.5rem', color: 'var(--text-muted)', background: 'none' }}>
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
