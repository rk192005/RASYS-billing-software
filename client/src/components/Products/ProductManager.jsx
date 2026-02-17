import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../config';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({ id: '', name: '', description: '', price: 0, unit: 'KG' });
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch products on mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch products", err);
            toast.error("Failed to load products");
        }
    };

    const handleSave = async () => {
        if (!currentProduct.name) return toast.error("Product name is required");

        try {
            const method = currentProduct.id && products.find(p => p.id === currentProduct.id) ? 'PUT' : 'POST';
            const url = method === 'PUT'
                ? `${API_BASE_URL}/api/products/${currentProduct.id}`
                : `${API_BASE_URL}/api/products`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentProduct)
            });

            if (res.ok) {
                toast.success("Product Saved!");
                fetchProducts();
                setIsEditing(false);
                setCurrentProduct({ id: '', name: '', description: '', price: 0, unit: 'KG' });
            }
        } catch (err) {
            console.error("Error saving product", err);
            toast.error("Failed to save product");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this product?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' });
            toast.success("Product Deleted");
            fetchProducts();
        } catch (err) {
            console.error("Error deleting product", err);
            toast.error("Failed to delete product");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Product Catalog</h1>
                <button className="btn-primary" onClick={() => {
                    setCurrentProduct({ id: '', name: '', description: '', price: 0, unit: 'KG' });
                    setIsEditing(true);
                }}>
                    <Plus size={16} /> Add Product
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Description</th>
                            <th style={{ padding: '1rem' }}>Unit</th>
                            <th style={{ padding: '1rem' }}>Price (₹)</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{product.name}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{product.description}</td>
                                <td style={{ padding: '1rem' }}>{product.unit}</td>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹ {product.price}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => { setCurrentProduct(product); setIsEditing(true); }} style={{ marginRight: '1rem', color: 'var(--primary)', background: 'none' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} style={{ color: '#ef4444', background: 'none' }}>
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
                            <h2 style={{ fontSize: '1.25rem' }}>{currentProduct.id ? 'Edit Product' : 'New Product'}</h2>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label>Product Name</label>
                                <input value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} autoFocus />
                            </div>
                            <div>
                                <label>Description (Optional)</label>
                                <input value={currentProduct.description} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} />
                            </div>
                            <div className="grid-cols-2">
                                <div>
                                    <label>Price</label>
                                    <input type="number" value={currentProduct.price} onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label>Unit</label>
                                    <select value={currentProduct.unit} onChange={e => setCurrentProduct({ ...currentProduct, unit: e.target.value })}>
                                        <option>KG</option>
                                        <option>PCS</option>
                                        <option>BOX</option>
                                        <option>LTR</option>
                                        <option>MTR</option>
                                    </select>
                                </div>
                            </div>
                            <button className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }} onClick={handleSave}>
                                <Save size={16} /> Save Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
