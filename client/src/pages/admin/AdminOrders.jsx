import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatINR } from '../../utils/format.js';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersToday: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });

  const load = () => api.get('/orders').then(({ data }) => setOrders(data));

  const loadStats = () => api.get('/admin/stats').then(({ data }) => setStats(data));
  useEffect(() => {
    load();
    loadStats();
  }, []);

  const changeStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    load();
  };

  return (
    <section>
      <div className="row-between">
        <h1>Admin · Orders</h1>
        <Link to="/admin/products" className="btn btn-ghost">← Products</Link>
      </div>
      <div className="stats-grid">
        <div className="card stat-card">
          <span className="muted">Total revenue</span>
          <strong>₹{stats.totalRevenue.toLocaleString('en-IN')}</strong>
        </div>
        <div className="card stat-card">
          <span className="muted">Orders today</span>
          <strong>{stats.ordersToday}</strong>
        </div>
        <div className="card stat-card">
          <span className="muted">Pending orders</span>
          <strong>{stats.pendingOrders}</strong>
        </div>
        <div className="card stat-card">
          <span className="muted">Low-stock products</span>
          <strong>{stats.lowStockProducts}</strong>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-6).toUpperCase()}</td>
              <td>{o.user?.name}<br /><span className="muted">{o.user?.email}</span></td>
              <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              <td>{formatINR(o.totalAmount)}</td>
              <td>
                <select value={o.status} onChange={(e) => changeStatus(o._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
