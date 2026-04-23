import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <h1>Brew & Byte</h1>
      </div>
      <nav>
        <ul>
          <li>
            <Link href="/menu">Menu Management</Link>
          </li>
          <li>
            <Link href="/orders">Take Orders</Link>
          </li>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
