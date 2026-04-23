'use client';

import { useState, useEffect } from 'react';

export default function OrdersPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState('');
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    const [printingOrder, setPrintingOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [limit, setLimit] = useState(10);

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit,
                status: statusFilter,
                date: dateFilter
            });
            const res = await fetch(`/api/orders?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            setOrders(data.orders);
            setTotalPages(data.totalPages);
            setTotalOrders(data.total);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const menuRes = await fetch('/api/menu');
            if (!menuRes.ok) throw new Error('Failed to fetch menu');
            setMenuItems(await menuRes.json());
            await fetchOrders();
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) {
            fetchOrders();
        }
    }, [currentPage, limit, statusFilter, dateFilter]);

    const handleFilterChange = (type, value) => {
        if (type === 'status') setStatusFilter(value);
        if (type === 'date') setDateFilter(value);
        if (type === 'limit') setLimit(parseInt(value));
        setCurrentPage(1); // Reset to first page on filter/limit change
    };

    const addToCart = (item) => {
        const existing = cart.find(i => i.menuItemId === item.id);
        if (existing) {
            setCart(cart.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }]);
        }
    };

    const updateQuantity = (itemId, delta) => {
        setCart(cart.map(i => {
            if (i.menuItemId === itemId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    }

    const removeFromCart = (itemId) => {
        setCart(cart.filter(i => i.menuItemId !== itemId));
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    };

    const submitOrder = async () => {
        if (cart.length === 0) return alert('Your cart belongs in a mug, but it is empty!');

        try {
            const url = editingOrder ? `/api/orders/${editingOrder.id}` : '/api/orders';
            const method = editingOrder ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: customer || 'Distinguished Guest',
                    items: cart,
                    total: calculateTotal()
                })
            });
            if (res.ok) {
                setCart([]);
                setCustomer('');
                setEditingOrder(null);
                fetchOrders();
            }
        } catch (error) {
            console.error('Error submitting order:', error);
        }
    };

    const handleEditOrder = (order) => {
        setEditingOrder(order);
        setCustomer(order.customer);
        setCart(order.items.map(item => ({
            menuItemId: item.menuItem.id,
            name: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity
        })));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingOrder(null);
        setCart([]);
        setCustomer('');
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchData();
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Preparing the POS terminal...</p>
        </div>
    );

    return (
        <div className="orders-page animate-fade">
            <header className="page-header">
                <div>
                    <h1>Commerce & Concierge</h1>
                    <p>Real-time order fulfillment system</p>
                </div>
            </header>

            <div className="pos-layout">
                <section className="menu-selection">
                    <div className="section-header">
                        <h2>Select Offerings</h2>
                        <div className="category-tabs">
                            <span className="tab active">All Items</span>
                        </div>
                    </div>
                    <div className="items-grid">
                        {menuItems.map(item => (
                            <button key={item.id} className="card item-tile" onClick={() => addToCart(item)}>
                                <span className="tile-category">{item.category.name}</span>
                                <span className="tile-name">{item.name}</span>
                                <span className="tile-price">${parseFloat(item.price).toFixed(2)}</span>
                                <div className="tile-hover">+ Add</div>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="cart-container card glass">
                    <div className="cart-header">
                        <h2>{editingOrder ? 'Refine Order' : 'Order Summary'}</h2>
                        {editingOrder && <span className="edit-badge">Editing #{editingOrder.id.slice(-4)}</span>}
                        <span className="cart-count">{cart.length} items</span>
                    </div>

                    <div className="customer-field">
                        <label>Customer Identity</label>
                        <input
                            type="text"
                            placeholder="Name or Table Number"
                            value={customer}
                            onChange={(e) => setCustomer(e.target.value)}
                        />
                    </div>

                    <div className="cart-list">
                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <p>Begin an order by selecting items from the menu.</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.menuItemId} className="cart-item">
                                    <div className="cart-item-info">
                                        <span className="cart-item-name">{item.name}</span>
                                        <span className="cart-item-price">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="qty-controls">
                                            <button onClick={() => updateQuantity(item.menuItemId, -1)}>−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.menuItemId, 1)}>+</button>
                                        </div>
                                        <button className="remove-btn" onClick={() => removeFromCart(item.menuItemId)}>×</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="cart-footer">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>Total Due</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <button className="btn btn-primary place-order-btn" onClick={submitOrder} disabled={cart.length === 0}>
                            {editingOrder ? 'Update Order' : 'Complete Purchase'}
                        </button>
                        {editingOrder && (
                            <button className="btn btn-outline cancel-edit-btn" onClick={cancelEdit}>
                                Discard Changes
                            </button>
                        )}
                    </div>
                </section>
            </div>

            <section className="fulfillment-tracker">
                <div className="section-header tracker-header">
                    <div>
                        <h2>Fulfillment Tracker</h2>
                        <p>Live status of pending and active orders</p>
                    </div>
                    <div className="filter-group">
                        <label>Date:</label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                            className="status-filter-select"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="status-filter-select"
                        >
                            <option value="ALL">All Orders</option>
                            <option value="PENDING">Pending</option>
                            <option value="PREPARING">Preparing</option>
                            <option value="READY">Ready</option>
                            <option value="SERVED">Served</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Size:</label>
                        <select
                            value={limit}
                            onChange={(e) => handleFilterChange('limit', e.target.value)}
                            className="status-filter-select"
                        >
                            <option value="5">5 / Page</option>
                            <option value="10">10 / Page</option>
                            <option value="20">20 / Page</option>
                        </select>
                    </div>
                </div>
                <div className="orders-table-wrapper card">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Value</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="time-col">
                                        <span className="full-timestamp">
                                            {new Date(order.createdAt).toISOString().replace('T', ' ').split('.')[0]}
                                        </span>
                                    </td>
                                    <td className="cust-col">{order.customer}</td>
                                    <td>
                                        <div className="item-dots">
                                            {order.items.slice(0, 3).map((it, idx) => (
                                                <span key={idx} className="dot-desc">{it.menuItem.name}{idx < 2 && idx < order.items.length - 1 ? ',' : ''} </span>
                                            ))}
                                            {order.items.length > 3 && <span className="more-dots">+{order.items.length - 3} more</span>}
                                        </div>
                                    </td>
                                    <td className="price-col">${parseFloat(order.total).toFixed(2)}</td>
                                    <td>
                                        <span className={`badge badge-${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="actions-col">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PREPARING">Preparing</option>
                                            <option value="READY">Ready</option>
                                            <option value="SERVED">Served</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                        <button className="btn btn-outline btn-icon" onClick={() => handleEditOrder(order)} title="Edit items">
                                            ✎
                                        </button>
                                        <button className="btn btn-outline btn-icon" onClick={() => {
                                            setPrintingOrder(order);
                                            setTimeout(() => {
                                                window.print();
                                                setPrintingOrder(null);
                                            }, 500);
                                        }} title="Print Receipt">
                                            ⎙
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-controls">
                    <div className="pagination-info">
                        Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalOrders)} of {totalOrders} orders
                    </div>
                    <div className="pagination-buttons">
                        <button
                            className="btn btn-outline btn-sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            Previous
                        </button>
                        <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                        <button
                            className="btn btn-outline btn-sm"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </section>

            {printingOrder && (
                <div className="print-wrapper">
                    <div className="print-receipt">
                        <div className="receipt-content-luxury">
                            <header className="luxury-header">
                                <h1 className="luxury-brand-name">BREW & BYTE</h1>
                                <p className="luxury-tagline">Artisan Coffee & Digital Precision</p>
                                <div className="luxury-divider gold"></div>
                            </header>

                            <div className="luxury-meta-list">
                                <div className="meta-line">
                                    <div className="meta-item">
                                        <span className="label">DATE:</span>
                                        <span className="value">{new Date(printingOrder.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="meta-item text-right">
                                        <span className="label">TIME:</span>
                                        <span className="value">{new Date(printingOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="meta-line">
                                    <div className="meta-item">
                                        <span className="label">TABLE:</span>
                                        <span className="value">{printingOrder.customer}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="luxury-divider thin"></div>

                            <table className="luxury-order-table">
                                <thead>
                                    <tr>
                                        <th className="col-desc">DESCRIPTION</th>
                                        <th className="col-qty">QTY</th>
                                        <th className="col-total">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {printingOrder.items.map((item, idx) => (
                                        <tr key={idx} className="luxury-item-row">
                                            <td className="item-name">{item.menuItem?.name || 'Unknown Item'}</td>
                                            <td className="item-qty">{item.quantity}</td>
                                            <td className="item-total">${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="luxury-divider thin"></div>

                            <div className="luxury-summary">
                                <div className="summary-row">
                                    <span>SUBTOTAL</span>
                                    <span>${parseFloat(printingOrder.total).toFixed(2)}</span>
                                </div>
                                <div className="summary-row grand-amount">
                                    <span>TOTAL AMOUNT</span>
                                    <span>${parseFloat(printingOrder.total).toFixed(2)}</span>
                                </div>
                            </div>

                            <footer className="luxury-footer">
                                <div className="luxury-divider gold"></div>
                                <p className="footer-msg">Thank you for your visit</p>
                                <p className="footer-url">www.brewandbyte.coffee</p>
                            </footer>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .orders-page { display: flex; flex-direction: column; gap: 4rem; }
                .page-header h1 { font-size: 2.5rem; color: var(--primary); }
                
                .pos-layout { display: grid; grid-template-columns: 1fr 400px; gap: 3rem; min-height: 600px; }
                
                .section-header { margin-bottom: 2rem; }
                .section-header h2 { font-size: 1.75rem; color: var(--primary); }
                
                .category-tabs { display: flex; gap: 1rem; margin-top: 1rem; }
                .tab { padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.85rem; font-weight: 700; color: var(--muted-foreground); cursor: pointer; border: 1px solid var(--border); }
                .tab.active { background: var(--primary); color: white; border-color: var(--primary); }

                .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.5rem; }
                
                .item-tile { 
                    display: flex; flex-direction: column; align-items: flex-start; text-align: left; 
                    padding: 1.5rem; min-height: 160px; justify-content: flex-start; gap: 0.5rem; position: relative; overflow: hidden;
                }
                .tile-category { font-size: 0.65rem; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; }
                .tile-name { font-weight: 700; font-size: 1.1rem; color: var(--primary); }
                .tile-price { font-weight: 800; color: var(--foreground); margin-top: auto; }
                

                .tile-hover { 
                    position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5rem; 
                    background: var(--primary); color: white; text-align: center; font-size: 0.8rem; font-weight: 700;
                    transform: translateY(100%); transition: transform 0.2s;
                }
                .item-tile:hover .tile-hover { transform: translateY(0); }

                .full-timestamp { font-family: monospace; font-size: 0.85rem; color: var(--primary); font-weight: 600; white-space: nowrap; }

                .cart-container { display: flex; flex-direction: column; height: fit-content; position: sticky; top: 2rem; padding: 2rem; border-top: 4px solid var(--secondary); }
                .cart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .cart-count { background: var(--muted); padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 800; }

                .customer-field { margin-bottom: 2rem; }
                .customer-field label { font-size: 0.75rem; font-weight: 800; color: var(--muted-foreground); text-transform: uppercase; display: block; margin-bottom: 0.5rem; }
                .customer-field input { width: 100%; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--fdfcfb); }

                .cart-list { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; min-height: 200px; }
                .empty-cart { text-align: center; color: var(--muted-foreground); padding: 3rem 1rem; font-style: italic; font-size: 0.9rem; }
                
                .cart-item { display: flex; flex-direction: column; gap: 0.75rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
                .cart-item-info { display: flex; justify-content: space-between; font-weight: 600; }
                .cart-item-actions { display: flex; justify-content: space-between; align-items: center; }
                
                .qty-controls { display: flex; align-items: center; gap: 1rem; background: var(--muted); padding: 0.25rem; border-radius: 0.5rem; }
                .qty-controls button { background: white; border: 1px solid var(--border); width: 24px; height: 24px; border-radius: 4px; cursor: pointer; font-weight: bold; }
                .qty-controls span { font-weight: 800; font-size: 0.9rem; min-width: 20px; text-align: center; }

                .remove-btn { color: #f87171; background: none; border: none; font-size: 1.5rem; cursor: pointer; }

                .cart-footer { margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; }
                .total-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--muted-foreground); }
                .grand-total { font-size: 1.5rem; font-weight: 800; color: var(--primary); margin: 0.5rem 0; }
                .place-order-btn { width: 100%; padding: 1.25rem; border-radius: var(--radius); }

                .orders-table-wrapper { padding: 0; overflow: hidden; }
                .orders-table { width: 100%; border-collapse: collapse; }
                .orders-table th { background: var(--muted); padding: 1.25rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground); }
                .orders-table td { padding: 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
                
                .time-col { color: var(--muted-foreground); font-weight: 600; }
                .cust-col { font-weight: 800; color: var(--primary); }
                .item-dots { font-size: 0.85rem; color: var(--muted-foreground); }
                .price-col { font-weight: 800; }
                
                .status-select { padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border); background: white; font-size: 0.85rem; font-weight: 600; }

                .actions-col { display: flex; gap: 0.5rem; }
                .btn-icon { padding: 0.5rem; font-size: 1.2rem; min-width: 40px; }

                .tracker-header { display: flex; justify-content: space-between; align-items: center; }
                .filter-group { display: flex; align-items: center; gap: 1rem; }
                .filter-group label { font-size: 0.85rem; font-weight: 700; color: var(--muted-foreground); text-transform: uppercase; }
                .status-filter-select { padding: 0.75rem 1rem; border-radius: var(--radius); border: 1px solid var(--border); background: var(--muted); font-weight: 600; font-family: var(--font-sans); }

                .loading-screen { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; }
                .loader { width: 50px; height: 50px; border: 5px solid var(--muted); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .pagination-controls { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding: 1rem; }
                .pagination-info { font-size: 0.85rem; color: var(--muted-foreground); font-weight: 600; }
                .pagination-buttons { display: flex; align-items: center; gap: 1.5rem; }
                .page-indicator { font-size: 0.9rem; font-weight: 800; color: var(--primary); }

                .edit-badge { background: var(--accent); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
                .cancel-edit-btn { width: 100%; margin-top: 0.5rem; }

                /* Luxury Print Styles */
                .print-wrapper { display: none; }

                @media print {
                    @page { margin: 0; size: A7 portrait; }
                    html, body { height: 100vh; overflow: hidden !important; margin: 0 !important; padding: 0 !important; }
                    body * { display: none !important; }
                    
                    .print-wrapper { 
                        display: flex !important;
                        justify-content: center;
                        align-items: center;
                        position: fixed;
                        top: 0; left: 0; width: 100vw; height: 100vh;
                        background: white;
                        page-break-after: avoid;
                        page-break-before: avoid;
                    }

                    .print-receipt { 
                        display: block !important; 
                        width: 74mm; 
                        padding: 8mm 4mm; 
                        background: white;
                        color: #1a1512;
                        font-family: 'Outfit', sans-serif;
                        border: 1pt solid #e9e3dc; /* Subtle boundary for centering check */
                    }

                    .luxury-header { text-align: center; margin-bottom: 8mm; }
                    .luxury-brand-name { font-family: 'Playfair Display', serif; font-size: 18pt; margin: 0; letter-spacing: 1.5px; font-weight: 800; color: #3e2723; text-align: center; }
                    .luxury-tagline { font-size: 6.5pt; text-transform: uppercase; letter-spacing: 2px; color: #bc6c25; margin-top: 1.5mm; font-weight: 700; text-align: center; }

                    .luxury-divider { margin: 3mm 0; }
                    .luxury-divider.gold { border-top: 1.2pt solid #d4a373; }
                    .luxury-divider.thin { border-top: 0.7pt solid #e9e3dc; }

                    .luxury-meta-list { margin: 4mm 0; display: flex; flex-direction: column; gap: 1.5mm; }
                    .meta-line { display: flex; justify-content: space-between; }
                    .meta-item { display: flex; gap: 2.5mm; align-items: baseline; }
                    .meta-item.text-right { justify-content: flex-end; }
                    .meta-line .label { font-weight: 800; color: #bc6c25; text-transform: uppercase; font-size: 6.5pt; letter-spacing: 0.8px; }
                    .meta-line .value { font-weight: 600; color: #3e2723; font-size: 8.5pt; }

                    .luxury-order-table { width: 100%; border-collapse: collapse; margin: 4mm 0; table-layout: fixed; }
                    .luxury-order-table th { font-size: 7.5pt; font-weight: 800; color: #bc6c25; text-align: left; padding-bottom: 3mm; text-transform: uppercase; border-bottom: 0.7pt solid #e9e3dc; }
                    .luxury-order-table th.col-qty { text-align: center; width: 25px; white-space: nowrap; }
                    .luxury-order-table th.col-total { text-align: right; width: 60px; white-space: nowrap; }
                    
                    .luxury-order-table td { padding: 3mm 0; font-size: 9.5pt; vertical-align: top; }
                    .item-name { font-weight: 600; color: #3e2723; }
                    .item-qty { text-align: center; color: #7f746d; font-weight: 500; }
                    .item-total { text-align: right; font-weight: 700; color: #1a1512; }

                    .luxury-summary { margin-top: 6mm; }
                    .summary-row { display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 500; margin-bottom: 2mm; color: #7f746d; }
                    .summary-row.grand-amount { font-size: 13pt; font-weight: 800; margin-top: 3mm; padding-top: 3mm; border-top: 1.5pt solid #3e2723; color: #3e2723; }

                    .luxury-footer { text-align: center; margin-top: 10mm; }
                    .footer-msg { font-size: 9pt; font-weight: 600; color: #bc6c25; margin: 4mm 0 2mm; font-family: 'Playfair Display', serif; font-style: italic; }
                    .footer-url { font-size: 6.5pt; font-weight: 800; color: #d4a373; text-transform: uppercase; letter-spacing: 1.5px; }
                }
            `}</style>
        </div >
    );
}
