'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/orders?limit=1000');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const orders = data.orders || [];

      const weeklyTrend = Array(7).fill(0);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of today

      orders.forEach(o => {
        if (o.status === 'CANCELLED') return;
        const orderDate = new Date(o.createdAt);
        const normalizedOrderDate = new Date(orderDate);
        normalizedOrderDate.setHours(0, 0, 0, 0); // Normalize to start of order day
        
        const diffTime = today - normalizedOrderDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays < 7) {
          // Index 6 is today, 0 is 6 days ago
          weeklyTrend[6 - diffDays] += parseFloat(o.total);
        }
      });

      const maxRev = Math.max(...weeklyTrend, 1);
      const chartData = weeklyTrend.map(v => ({
        value: v,
        height: (v / maxRev) * 100
      }));

      const totalSales = orders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((acc, o) => acc + parseFloat(o.total), 0);

      const completedOrders = orders.filter(o => o.status === 'SERVED').length;

      setStats({
        totalSales,
        orderCount: orders.length,
        completedOrders,
        chartData
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p>Curating your insights...</p>
    </div>
  );

  return (
    <div className="dashboard-page animate-fade">
      <header className="page-header">
        <div>
          <h1>Business Intelligence</h1>
          <p>Performance metrics for Brew & Byte</p>
        </div>
        <button className="btn btn-outline" onClick={fetchStats}>Refresh Data</button>
      </header>

      <div className="stats-grid">
        <div className="card stat-card accent-border">
          <div className="stat-header">
            <span className="stat-label">Total Revenue</span>
            <div className="stat-icon rev-icon">$</div>
          </div>
          <span className="stat-value">${stats.totalSales.toFixed(2)}</span>
          <span className="stat-trend positive">↑ 12.5% vs last period</span>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Orders Handled</span>
            <div className="stat-icon order-icon">📦</div>
          </div>
          <span className="stat-value">{stats.orderCount}</span>
          <span className="stat-trend">Steady operations</span>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Fulfillment Rate</span>
            <div className="stat-icon rate-icon">✓</div>
          </div>
          <span className="stat-value">
            {stats.orderCount > 0 ? ((stats.completedOrders / stats.orderCount) * 100).toFixed(0) : 0}%
          </span>
          <span className="stat-trend positive">Efficient service</span>
        </div>
      </div>

      <div className="dashboard-layout">
        <section className="chart-section card glass">
          <h2>Weekly Revenue Trend</h2>
          <div className="revenue-chart">
            {(stats.chartData || Array(7).fill({ height: 0, value: 0 })).map((d, i) => {
              const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              const label = dayLabels[date.getDay()];

              return (
                <div key={i} className="chart-column">
                  <div className="bar-wrapper">
                    <div className="bar" style={{ height: `${Math.max(d.height, 5)}%` }}>
                      <span className="bar-tooltip">${d.value.toFixed(0)}</span>
                    </div>
                  </div>
                  <span className="chart-label">{label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card promo-card">
          <h3>Pro Tip</h3>
          <p>Items with high margin like "Cold Brew" are driving 80% of your current profit. Consider a featured spot!</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}>AI Insights</button>
        </section>
      </div>

      <style jsx>{`
                .dashboard-page { display: flex; flex-direction: column; gap: 3rem; }
                
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
                .page-header h1 { font-size: 2.5rem; color: var(--primary); }
                
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
                
                .stat-card { position: relative; overflow: hidden; }
                .stat-card.accent-border { border-left: 4px solid var(--accent); }
                
                .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .stat-label { color: var(--muted-foreground); font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; }
                
                .stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; }
                .rev-icon { background: #fef3c7; color: #d97706; }
                .order-icon { background: #e0f2fe; color: #0284c7; }
                .rate-icon { background: #dcfce7; color: #16a34a; }
                
                .stat-value { font-size: 2.75rem; font-weight: 800; color: var(--primary); display: block; margin-bottom: 0.5rem; }
                .stat-trend { font-size: 0.8rem; font-weight: 600; color: var(--muted-foreground); }
                .stat-trend.positive { color: #16a34a; }

                .dashboard-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }

                .revenue-chart { display: flex; align-items: flex-end; justify-content: space-between; height: 250px; padding: 2rem 1rem 1rem; margin-top: 1rem; }
                .chart-column { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .bar-wrapper { width: 100%; height: 200px; display: flex; align-items: flex-end; justify-content: center; position: relative; }
                
                .bar { width: 35px; background: linear-gradient(to top, var(--primary), var(--secondary)); border-radius: 8px 8px 4px 4px; position: relative; transition: all 0.3s ease; }
                .bar:hover { filter: brightness(1.2); cursor: pointer; }
                .bar:hover .bar-tooltip { opacity: 1; transform: translate(-50%, -10px); }
                
                .bar-tooltip { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; opacity: 0; pointer-events: none; transition: all 0.2s ease; z-index: 10; }
                
                .chart-label { font-size: 0.8rem; font-weight: 700; color: var(--muted-foreground); }

                .promo-card { background: var(--primary); color: white; display: flex; flex-direction: column; justify-content: center; padding: 3rem; text-align: center; }
                .promo-card h3 { color: var(--secondary); margin-bottom: 1rem; }

                .loading-screen { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; }
                .loader { width: 50px; height: 50px; border: 5px solid var(--muted); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
    </div>
  );
}
