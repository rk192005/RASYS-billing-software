import { useState, useEffect, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Printer,
  Plus,
  Trash2,
  Save,
  Users,
  Bell,
  Package,
  UserCheck
} from 'lucide-react';
import { defaultInvoice, printSettings, businessProfile as defaultBusinessProfile } from './constants';
import InvoicePreview from './components/Invoice/InvoicePreview';
import InvoiceList from './components/Invoice/InvoiceList';
import ProductManager from './components/Products/ProductManager';
import PurchaseManager from './components/Purchases/PurchaseManager';
import ClientManager from './components/Clients/ClientManager';
import { API_BASE_URL } from './config';

// Hook: useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'editor' for invoices

  const [currentInvoice, setCurrentInvoice] = useState(defaultInvoice);
  const debouncedInvoice = useDebounce(currentInvoice, 500); // 500ms delay to stop typing lag

  const [settings, setSettings] = useState(printSettings);
  const [businessProfile, setBusinessProfile] = useState(defaultBusinessProfile);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);

  // Dashboard Metrics
  const [dashboardStats, setDashboardStats] = useState({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    invoiceCount: 0
  });

  // --- Effects ---
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        // Load Settings with timeout
        const loadWithTimeout = (promise, ms = 5000) => new Promise((resolve, reject) => {
          const id = setTimeout(() => reject(new Error("Timeout")), ms);
          promise.then(res => { clearTimeout(id); resolve(res); }).catch(err => { clearTimeout(id); reject(err); });
        });

        // Initialize defaults
        setProducts([]); setClients([]);

        try {
          const settingsRes = await loadWithTimeout(fetch(`${API_BASE_URL}/api/settings`));
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            if (settingsData && settingsData.name) setBusinessProfile(settingsData);
          }

          // Load Products
          const prodRes = await fetch(`${API_BASE_URL}/api/products`);
          if (prodRes.ok) {
            const prodData = await prodRes.json();
            setProducts(Array.isArray(prodData) ? prodData : []);
          }
        } catch (e) {
          console.warn("Soft init failure:", e);
        }

        // Load Clients
        const clientRes = await fetch(`${API_BASE_URL}/api/clients`);
        if (clientRes.ok) {
          const clientData = await clientRes.json();
          setClients(Array.isArray(clientData) ? clientData : []);
        }

        await fetchDashboardMetrics();
      } catch (e) {
        console.error("Init failed", e);
        // Only show error screen if EVERYTHING failed (e.g. server down)
        // If we just failed to load clients but server is up, continue.
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`);
      if (!res.ok) return;
      const invoices = await res.json();
      if (Array.isArray(invoices)) {
        let invoiced = 0;
        let collected = 0;
        let outstanding = 0;

        invoices.forEach(inv => {
          const total = inv.items?.reduce((s, i) => s + (i.qty * i.price), 0) || 0;
          invoiced += total;
          if (inv.status === 'Paid') collected += total;
          else outstanding += total;
        });

        setDashboardStats({
          totalInvoiced: invoiced,
          totalCollected: collected,
          totalOutstanding: outstanding,
          invoiceCount: invoices.length
        });
      }
    } catch (e) { console.error("Failed metrics fetch"); }
  };

  const saveSettingsToBackend = async (newProfile) => {
    setBusinessProfile(newProfile);
    // Debounce save to prevent spamming server
    try {
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      // Silent save for better UX on text inputs, or use toast sparingly
    } catch (err) { console.error(err); }
  };

  const saveInvoiceToBackend = async () => {
    if (!currentInvoice.client.name) return toast.error("Client Name is required!");
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentInvoice)
      });
      if (res.ok) {
        toast.success("Invoice Saved!");
        fetchDashboardMetrics(); // Refresh stats
        setCurrentView('list'); // Go back to list
      }
    } catch (err) { toast.error("Error saving invoice"); }
  };

  // --- Handlers ---
  const handlePrint = () => {
    document.body.className = `print-${settings.paperSize}${settings.orientation === 'landscape' ? '-landscape' : ''}`;
    window.print();
    setTimeout(() => { document.body.className = ''; }, 1000);
  };

  const handleNewInvoice = () => {
    setCurrentInvoice({ ...defaultInvoice, id: `INV-${Date.now().toString().slice(-4)}`, date: new Date().toISOString().split('T')[0], items: [{ id: 1, name: '', qty: 1, price: 0, unit: 'KG' }] });
    if (activeTab !== 'invoices') setActiveTab('invoices');
    setCurrentView('editor');
  };

  const updateItem = (index, field, value) => {
    const newItems = [...(currentInvoice.items || [])];
    if (!newItems[index]) return; // Guard clause

    newItems[index] = { ...newItems[index], [field]: value }; // Immutable update

    // Auto-fill product
    if (field === 'name') {
      const product = products.find(p => p.name === value);
      if (product) {
        newItems[index].price = product.price;
        newItems[index].unit = product.unit;
        newItems[index].description = product.description || '';
      }
    }

    setCurrentInvoice(p => ({ ...p, items: newItems }));
  };

  const handleClientSelect = (e) => {
    const clientName = e.target.value;
    const client = clients.find(c => c.name === clientName);
    if (client) {
      setCurrentInvoice(p => ({
        ...p,
        client: {
          name: client.name,
          address: client.address,
          gstin: client.gstin
        }
      }));
    } else {
      // Allow manual entry if not in list
      setCurrentInvoice(p => ({ ...p, client: { ...p.client, name: clientName } }));
    }
  };

  const [aiInsights, setAiInsights] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchAiInsights = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/analyze`, { method: 'POST' });
      const data = await res.json();
      if (data.insights) setAiInsights(data.insights);
    } catch (err) { toast.error("AI Scan Failed"); }
    finally { setIsAiLoading(false); }
  };

  // --- Render Sections ---
  const renderDashboard = () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Dashboard</h1>
        <button className="btn-primary" onClick={handleNewInvoice}>
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="dashboard-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="dashboard-stat-label">Total Sales</div>
          <div className="dashboard-stat-value">₹ {dashboardStats.totalInvoiced.toFixed(0)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {dashboardStats.invoiceCount} Total Invoices
          </div>
        </div>

        <div className="dashboard-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="dashboard-stat-label">Outstanding</div>
          <div className="dashboard-stat-value" style={{ color: '#f59e0b' }}>₹ {dashboardStats.totalOutstanding.toFixed(0)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Pending Payment
          </div>
        </div>

        <div className="dashboard-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="dashboard-stat-label">Collected</div>
          <div className="dashboard-stat-value" style={{ color: '#10b981' }}>₹ {dashboardStats.totalCollected.toFixed(0)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Cash in Hand
          </div>
        </div>

        {/* AI Security Card */}
        <div className="dashboard-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Rasys AI Shield</span>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '1rem' }}>
            System Protected & Active
          </div>

          <button onClick={fetchAiInsights} disabled={isAiLoading} style={{
            width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            {isAiLoading ? "Scanning..." : "AI Security Scan"}
          </button>

          {aiInsights.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: 0.9, lineHeight: '1.4' }}>
              {aiInsights.map((insight, i) => <div key={i}>• {insight}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '2rem' }}>Settings</h1>
      <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} /> Business Profile
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, auto) 1fr', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '150px', height: '150px', background: '#f8fafc',
              border: '1px dashed var(--border-color)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', margin: '0 auto'
            }}>
              {businessProfile.logo ? (
                <img src={businessProfile.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Upload Logo</span>}
            </div>
            <label className="btn-primary" style={{ marginTop: '1rem', cursor: 'pointer', display: 'inline-flex', padding: '0.5rem 1rem' }}>
              Upload
              <input type="file" hidden accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => saveSettingsToBackend({ ...businessProfile, logo: reader.result });
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="grid-cols-2">
              <div>
                <label>Business Name</label>
                <input value={businessProfile.name} onChange={e => saveSettingsToBackend({ ...businessProfile, name: e.target.value })} />
              </div>
              <div>
                <label>GSTIN</label>
                <input value={businessProfile.gstin} onChange={e => saveSettingsToBackend({ ...businessProfile, gstin: e.target.value })} />
              </div>
            </div>
            <div>
              <label>Address</label>
              <textarea rows="3" value={businessProfile.address} onChange={e => saveSettingsToBackend({ ...businessProfile, address: e.target.value })} />
            </div>
            <div className="grid-cols-2">
              <div>
                <label>Phone</label>
                <input value={businessProfile.phone} onChange={e => saveSettingsToBackend({ ...businessProfile, phone: e.target.value })} />
              </div>
              <div>
                <label>Email</label>
                <input value={businessProfile.email} onChange={e => saveSettingsToBackend({ ...businessProfile, email: e.target.value })} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button onClick={() => { if (confirm("Clear local data?")) window.location.reload(); }} style={{ color: '#ef4444', background: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
          <Trash2 size={16} /> Reset Local Cache
        </button>
      </div>
    </div>
  );

  const renderInvoiceEditor = () => (
    <div style={{ display: 'flex', height: '100%', gap: '1.5rem' }}>
      <div className="dashboard-card no-print" style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-light)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Edit Invoice</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setCurrentView('list')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
            <button className="btn-primary" onClick={saveInvoiceToBackend} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <Save size={14} /> Save
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
            <div>
              <label>Invoice #</label>
              <input value={currentInvoice.id} onChange={(e) => setCurrentInvoice(p => ({ ...p, id: e.target.value }))} />
            </div>
            <div>
              <label>Date</label>
              <input type="date" value={currentInvoice.date} onChange={(e) => setCurrentInvoice(p => ({ ...p, date: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} /> Bill To
            </h4>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <input
                list="client-list"
                placeholder="Search Client Name"
                value={currentInvoice.client.name}
                onChange={handleClientSelect}
              />
              <datalist id="client-list">
                {clients.map(c => <option key={c.id} value={c.name} />)}
              </datalist>

              <textarea placeholder="Address" rows="2" value={currentInvoice.client.address} onChange={(e) => setCurrentInvoice(p => ({ ...p, client: { ...p.client, address: e.target.value } }))} />
              <input placeholder="Client GSTIN" value={currentInvoice.client.gstin} onChange={(e) => setCurrentInvoice(p => ({ ...p, client: { ...p.client, gstin: e.target.value } }))} />

            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem' }}>Line Items</h4>
              <button onClick={() => setCurrentInvoice(p => ({ ...p, items: [...(p.items || []), { id: Date.now(), name: '', qty: 1, price: 0, unit: 'KG' }] }))}
                style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', padding: 0, border: 'none', cursor: 'pointer' }}>
                <Plus size={14} /> Add Item
              </button>
            </div>

            {/* Safety check to prevent crash if items is undefined */}
            {(currentInvoice.items || []).map((item, index) => (
              <div key={index} style={{ marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Item {index + 1}</span>
                  <button onClick={() => setCurrentInvoice(p => ({ ...p, items: p.items.filter((_, i) => i !== index) }))}
                    style={{ color: '#ef4444', background: 'none', padding: 0, border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                    <input
                      list={`products-${index}`}
                      placeholder="Item Name"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                    />
                    <datalist id={`products-${index}`}>
                      {products.map(p => <option key={p.id} value={p.name} />)}
                    </datalist>
                    <input placeholder="Desc" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem' }}>Qty</label>
                      <input type="number" value={item.qty} onChange={(e) => updateItem(index, 'qty', Number(e.target.value))} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem' }}>Unit</label>
                      <select value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)}>
                        <option>KG</option><option>PCS</option><option>BOX</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem' }}>Price</label>
                      <input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!currentInvoice.items?.length && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              No items added. Click "Add Item" to start.
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <div className="grid-cols-2">
              <div>
                <label>Discount</label>
                <input type="number" value={currentInvoice.discount} onChange={(e) => setCurrentInvoice(p => ({ ...p, discount: Number(e.target.value) }))} />
              </div>
              <div>
                <label>Tax (%)</label>
                <input type="number" value={currentInvoice.taxRate} onChange={(e) => setCurrentInvoice(p => ({ ...p, taxRate: Number(e.target.value) }))} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#334155', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        <div className="glass-header no-print" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', color: 'white', borderBottom: 'none' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Live Preview
          </span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setSettings(s => ({ ...s, paperSize: s.paperSize === 'A4' ? 'A5' : 'A4' }))} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
              {settings.paperSize}
            </button>
            <button className="btn-primary" onClick={handlePrint} style={{ background: 'white', color: '#1e293b', boxShadow: 'none' }}>
              <Printer size={16} /> Print / PDF
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center', background: '#334155' }}>
          <InvoicePreview invoice={debouncedInvoice} settings={settings} businessProfile={businessProfile} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="layout">
      <Toaster position="top-right" richColors />
      {/* Sidebar - Rasys Style */}
      <aside className={`sidebar no-print`}>
        <div className="sidebar-logo">
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold'
          }}>R</div>
          <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#f8fafc' }}>Rasys</span>
        </div>

        <nav className="sidebar-menu">
          <button className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={`menu-item ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => { setActiveTab('invoices'); setCurrentView('list'); }}>
            <FileText size={18} /> Invoices
          </button>
          <button className={`menu-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>
            <UserCheck size={18} /> Clients
          </button>
          <button className={`menu-item ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Package size={18} />
              <span>Purchases</span>
            </div>
          </button>
          <button className={`menu-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={18} /> Products
          </button>
          <button className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} /> Settings
          </button>
        </nav>
      </aside>

      <main className="main-wrapper">
        <header className="top-header no-print">
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <Bell size={20} />
            </button>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: '600' }}>
              A
            </div>
          </div>
        </header>

        <div className="content-area">
          {isLoading && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: '#64748b', gap: '1rem'
            }}>
              <div className="spinner"></div>
              <p>Loading Rasys Billing...</p>
            </div>
          )}

          {!isLoading && hasError && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: '#ef4444', gap: '1rem'
            }}>
              <div style={{ fontSize: '3rem' }}>⚠️</div>
              <h2 style={{ color: '#1e293b' }}>Connection Error</h2>
              <p style={{ color: '#64748b' }}>Could not connect to the backend server.</p>
              <button className="btn-primary" onClick={() => window.location.reload()}>Retry Connection</button>
            </div>
          )}

          {!isLoading && !hasError && (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'invoices' && (
                currentView === 'list'
                  ? <InvoiceList
                    onNewInvoice={handleNewInvoice}
                    onEditInvoice={(inv) => { setCurrentInvoice(inv); setCurrentView('editor'); }}
                  />
                  : renderInvoiceEditor()
              )}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'products' && <ProductManager />}
              {activeTab === 'clients' && <ClientManager />}
              {activeTab === 'purchases' && <PurchaseManager />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
