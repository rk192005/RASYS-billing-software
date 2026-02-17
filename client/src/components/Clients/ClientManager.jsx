import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../config';

export default function ClientManager() {
    const [clients, setClients] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentClient, setCurrentClient] = useState({ id: '', name: '', gstin: '', address: '', phone: '', email: '' });
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch clients on mount
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/clients`);
            const data = await res.json();
            setClients(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch clients", err);
            toast.error("Failed to load clients");
        }
    };

    const handleSave = async () => {
        if (!currentClient.name) return toast.error("Client Name is required");
        try {
            const method = currentClient.id && clients.find(c => c.id === currentClient.id) ? 'PUT' : 'POST';
            const url = method === 'PUT'
                ? `${API_BASE_URL}/api/clients/${currentClient.id}`
                : `${API_BASE_URL}/api/clients`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentClient)
            });

            if (res.ok) {
                toast.success("Client Saved Successfully!");
                fetchClients();
                setIsEditing(false);
                setCurrentClient({ id: '', name: '', gstin: '', address: '', phone: '', email: '' });
            }
        } catch (err) {
            console.error("Error saving client", err);
            toast.error("Failed to save client");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this client?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/clients/${id}`, { method: 'DELETE' });
            toast.success("Client Deleted");
            fetchClients();
        } catch (err) {
            console.error("Error deleting client", err);
            toast.error("Failed to delete client");
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={24} /> Client Management
                </h1>
                <button className="btn-primary" onClick={() => {
                    setCurrentClient({ id: '', name: '', gstin: '', address: '', phone: '', email: '' });
                    setIsEditing(true);
                }}>
                    <Plus size={16} /> Add Client
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>GSTIN</th>
                            <th style={{ padding: '1rem' }}>Phone</th>
                            <th style={{ padding: '1rem' }}>Address</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(client => (
                            <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{client.name}</td>
                                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{client.gstin || '-'}</td>
                                <td style={{ padding: '1rem' }}>{client.phone || '-'}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.address}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => { setCurrentClient(client); setIsEditing(true); }} style={{ marginRight: '1rem', color: 'var(--primary)', background: 'none' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(client.id)} style={{ color: '#ef4444', background: 'none' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditing && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '500px', padding: '2rem', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem' }}>{currentClient.id ? 'Edit Client' : 'New Client'}</h2>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label>Client Name</label>
                                <input value={currentClient.name} onChange={e => setCurrentClient({ ...currentClient, name: e.target.value })} autoFocus />
                            </div>

                            <div className="grid-cols-2">
                                <div>
                                    <label>GSTIN</label>
                                    <input value={currentClient.gstin} onChange={e => setCurrentClient({ ...currentClient, gstin: e.target.value })} />
                                </div>
                                <div>
                                    <label>Phone</label>
                                    <input value={currentClient.phone} onChange={e => setCurrentClient({ ...currentClient, phone: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label>Billing Address</label>
                                <textarea rows="3" value={currentClient.address} onChange={e => setCurrentClient({ ...currentClient, address: e.target.value })} />
                            </div>

                            <div>
                                <label>Email (Optional)</label>
                                <input type="email" value={currentClient.email} onChange={e => setCurrentClient({ ...currentClient, email: e.target.value })} />
                            </div>

                            <button className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }} onClick={handleSave}>
                                <Save size={16} /> Save Client
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
