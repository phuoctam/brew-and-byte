'use client';

export default function Home() {
  return (
    <div className="home-page animate-fade">
      <section className="hero card glass">
        <span className="welcome-tag">Premium Coffee Management</span>
        <h1>Elevate Your Shop Experience</h1>
        <p className="subtitle">
          Manage your menu, track orders, and gain deep business insights with one elegant dashboard.
        </p>
        <div className="quick-actions">
          <a href="/orders" className="btn btn-primary">
            Start New Order
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </a>
          <a href="/menu" className="btn btn-outline">Configure Menu</a>
        </div>
      </section>

      <div className="feature-highlight">
        <div className="card stat-preview">
          <h3>Recent Growth</h3>
          <div className="bar-group">
            <div className="mini-bar" style={{ height: '40%' }}></div>
            <div className="mini-bar" style={{ height: '60%' }}></div>
            <div className="mini-bar" style={{ height: '80%' }}></div>
          </div>
          <p>+24% revenue this week</p>
        </div>
      </div>

      <style jsx>{`
        .home-page {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 4rem;
          height: 80vh;
          padding: 0 2rem;
        }

        .hero {
          padding: 4rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          text-align: left;
          background: linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(212,163,115,0.05) 100%);
        }

        .welcome-tag {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .hero h1 {
          font-size: 4.5rem;
          line-height: 1.1;
          color: var(--primary);
        }

        .subtitle {
          font-size: 1.2rem;
          color: var(--muted-foreground);
          max-width: 500px;
          margin-bottom: 1rem;
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
        }

        .stat-preview {
            width: 300px;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            background: var(--primary);
            color: white;
            justify-self: center;
        }

        .bar-group {
            display: flex;
            align-items: flex-end;
            gap: 10px;
            height: 60px;
        }

        .mini-bar {
            flex: 1;
            background: var(--secondary);
            border-radius: 4px;
        }

        @media (max-width: 1100px) {
            .home-page { grid-template-columns: 1fr; height: auto; padding: 4rem 1rem; }
            .feature-highlight { display: none; }
        }
      `}</style>
    </div>
  );
}
