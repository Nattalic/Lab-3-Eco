import { useEffect, useState } from 'react';
import { API_URL } from '../api/api';
import type { User } from '../App';

export default function MyOrders({ user }: { user: User }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    fetch(`${API_URL}/orders/my`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (r) => {
        const data = await r.json();
        console.log('MY ORDERS RESPONSE:', data);
        return data;
      })
      .then((data) => {
        const parsedOrders = Array.isArray(data) ? data : data.data ?? [];
        setOrders(parsedOrders);
      })
      .catch((err) => {
        console.error(err);
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user.id]);

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-500 mb-2">Tu actividad</p>
        <h2 className="text-3xl font-bold text-gray-900">Mis pedidos</h2>
        <p className="text-gray-500 mt-2">
          Revisa tus órdenes y su estado actual, {user.name}.
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-orange-100 rounded-3xl p-8 text-center text-gray-500">
          Cargando pedidos...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-3xl p-8 text-center text-gray-500">
          No tienes pedidos aún.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = order.order_items || order.orderItems || [];

            return (
              <div
                key={order.id}
                className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3 gap-4">
                  <p className="font-semibold text-gray-700">
                    Tienda: {order.stores?.name || order.store?.name || 'Tienda'}
                  </p>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusColor[order.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  {items.length > 0 ? (
                    items.map((item: any) => {
                      const product = item.products || item.product;
                      const price = product?.price;

                      return (
                        <p key={item.id}>
                          {product?.name || 'Producto'} x{item.quantity}
                          {price ? ` — $${(price * item.quantity).toLocaleString('es-CO')}` : ''}
                        </p>
                      );
                    })
                  ) : (
                    <p className="text-gray-400">Sin productos</p>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString('es-CO')
                    : 'Fecha no disponible'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}