'use client';

import { useState, useEffect } from 'react';

export default function MenuPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        categoryName: '',
    });
    const [editingItem, setEditingItem] = useState(null);

    const fetchMenu = async () => {
        try {
            const res = await fetch('/api/menu');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });
            if (res.ok) {
                setNewItem({ name: '', description: '', price: '', categoryName: '' });
                setShowAddForm(false);
                setEditingItem(null);
                fetchMenu();
            }
        } catch (error) {
            console.error('Error saving menu item:', error);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setNewItem({
            name: item.name,
            description: item.description,
            price: item.price,
            categoryName: item.category.name
        });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this item?')) return;
        try {
            await fetch(`/api/menu/${id}`, { method: 'DELETE' });
            fetchMenu();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Brewing your menu selections...</p>
        </div>
    );

    return (
        <div className="menu-page animate-fade">
            <header className="page-header">
                <div>
                    <h1>Menu Management</h1>
                    <p>Curate your shop offerings and pricing</p>
                </div>
                <button
                    className={`btn ${showAddForm ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => {
                        if (showAddForm) {
                            setEditingItem(null);
                            setNewItem({ name: '', description: '', price: '', categoryName: '' });
                        }
                        setShowAddForm(!showAddForm);
                    }}
                >
                    {showAddForm ? 'Dismiss' : '+ Create New Item'}
                </button>
            </header>

            {showAddForm && (
                <section className="form-section card glass">
                    <div className="form-header">
                        <h2>{editingItem ? `Refine ${editingItem.name}` : 'New Menu Entry'}</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="menu-form">
                        <div className="form-group">
                            <label>Item Name</label>
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                placeholder="e.g. Velvet Flat White"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input
                                type="text"
                                value={newItem.categoryName}
                                onChange={(e) => setNewItem({ ...newItem, categoryName: e.target.value })}
                                placeholder="e.g. Signature Coffee"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={newItem.price}
                                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                placeholder="4.95"
                                required
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                placeholder="A smooth blend of micro-foam and artisanal beans..."
                                rows="3"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingItem ? 'Save Changes' : 'Publish to Menu'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <div className="menu-grid">
                {items.map((item) => (
                    <div key={item.id} className="card item-card">
                        <div className="item-header">
                            <span className="item-category-badge">{item.category.name}</span>
                            <button className="delete-icon-btn" onClick={() => handleDelete(item.id)} title="Delete item">×</button>
                        </div>
                        <div className="item-details">
                            <h3>{item.name}</h3>
                            <p className="item-desc">{item.description}</p>
                        </div>
                        <div className="item-footer">
                            <span className="price-tag">${parseFloat(item.price).toFixed(2)}</span>
                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .menu-page { display: flex; flex-direction: column; gap: 3rem; }
                
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
                .page-header h1 { font-size: 2.5rem; color: var(--primary); }
                
                .form-section { border-top: 4px solid var(--accent); }
                .form-header h2 { font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--primary); }
                
                .menu-form { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group.full-width { grid-column: span 3; }
                .form-group label { font-size: 0.85rem; font-weight: 700; color: var(--muted-foreground); text-transform: uppercase; }
                
                input, textarea { 
                    padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius); 
                    background: var(--muted); font-family: var(--font-sans); transition: all 0.2s; 
                }
                input:focus, textarea:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 3px rgba(62, 39, 35, 0.05); }

                .form-actions { grid-column: span 3; display: flex; justify-content: flex-end; margin-top: 1rem; }

                .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
                
                .item-card { display: flex; flex-direction: column; gap: 1.5rem; height: 100%; position: relative; }
                .item-header { display: flex; justify-content: space-between; align-items: center; }
                .item-category-badge { font-size: 0.7rem; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; }
                
                .delete-icon-btn { 
                    background: none; border: none; font-size: 1.5rem; color: var(--border); cursor: pointer; transition: color 0.2s;
                    position: absolute; top: 1rem; right: 1rem;
                }
                .delete-icon-btn:hover { color: #ef4444; }

                .item-details h3 { font-size: 1.5rem; color: var(--primary); margin-bottom: 0.5rem; }
                .item-desc { font-size: 0.95rem; color: var(--muted-foreground); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                
                .item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--border); }
                .price-tag { font-size: 1.5rem; font-weight: 800; color: var(--foreground); }
                
                .btn-sm { padding: 0.5rem 1rem; font-size: 0.8rem; }

                .loading-screen { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; }
                .loader { width: 50px; height: 50px; border: 5px solid var(--muted); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
