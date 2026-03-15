import { useEffect, useState } from "react";
import { API_URL } from "../api/api";
import type { User } from "../App";

interface Store {
  id: string;
  name: string;
  isOpen: boolean;
  userId?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function Dashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const loadProducts = async (storeId: string) => {
    const res = await fetch(`${API_URL}/products/store/${storeId}`, {
      headers,
    });

    if (!res.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    const data = await res.json();
    console.log("STORE PRODUCTS RESPONSE:", data);

    const parsedProducts = Array.isArray(data) ? data : (data.data ?? []);
    setProducts(parsedProducts);
  };

  const loadOrders = async () => {
    const res = await fetch(`${API_URL}/orders/store`, { headers });

    if (!res.ok) {
      throw new Error("No se pudieron cargar los pedidos");
    }

    const data = await res.json();
    console.log("STORE ORDERS RESPONSE:", data);

    const parsedOrders = Array.isArray(data) ? data : (data.data ?? []);
    setOrders(parsedOrders);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API_URL}/stores/my`, { headers });

        if (!res.ok) {
          throw new Error("No se pudo cargar la tienda");
        }

        const data = await res.json();
        console.log("MY STORE RESPONSE:", data);

        const storesArray = Array.isArray(data) ? data : (data.data ?? []);
        const storeData = storesArray[0];

        if (!storeData) {
          throw new Error("No se encontró una tienda asociada a esta cuenta");
        }

        setStore(storeData);

        await Promise.all([loadProducts(storeData.id), loadOrders()]);
        
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user.id]);

  const toggleStore = async () => {
    if (!store) return;

    try {
      const res = await fetch(`${API_URL}/stores/${store.id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isOpen: !store.isOpen }),
      });

      const data = await res.json();
      console.log("TOGGLE STORE RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "No se pudo actualizar la tienda");
      }

      setStore(data.data ?? data);
    } catch (error) {
      console.error(error);
    }
  };

  const createProduct = async () => {
    if (!store || !newProduct.name || !newProduct.price) return;

    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: newProduct.name,
        price: Number(newProduct.price),
        storeId: store.id,
      }),
    });

    if (!res.ok) {
      console.error("No se pudo crear el producto");
      return;
    }

    setNewProduct({ name: "", price: "" });
    loadProducts(store.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando tienda...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center px-6">
        <div className="bg-white border border-orange-100 rounded-3xl p-8 text-center shadow-sm">
          <p className="text-gray-500">
            No se encontró una tienda para esta cuenta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <nav className="bg-white border-b border-orange-100 px-6 py-4 flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-xl text-gray-900">{store.name}</h1>
          <span
            className={`text-sm ${store.isOpen ? "text-green-600" : "text-red-500"}`}
          >
            {store.isOpen ? "Abierta" : "Cerrada"}
          </span>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={toggleStore}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition ${
              store.isOpen
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {store.isOpen ? "Cerrar tienda" : "Abrir tienda"}
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl font-medium text-sm bg-gray-900 text-white hover:bg-black transition"
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTab("products")}
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              tab === "products"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Productos
          </button>

          <button
            onClick={() => setTab("orders")}
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              tab === "orders"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Pedidos ({orders.length})
          </button>
        </div>

        {tab === "products" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">
                Agregar producto
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
                  placeholder="Nombre del producto"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />

                <input
                  className="w-full sm:w-40 rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
                  placeholder="Precio"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                />

                <button
                  onClick={createProduct}
                  className="bg-orange-500 text-white px-6 py-3 rounded-2xl hover:bg-orange-600 transition font-semibold"
                >
                  Agregar
                </button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white border border-orange-100 rounded-3xl p-8 text-center text-gray-400">
                No hay productos aún
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-5 bg-white border border-orange-100 rounded-3xl shadow-sm"
                  >
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className="text-orange-500 font-bold text-lg">
                      ${Number(p.price).toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className="flex flex-col gap-4">
            {orders.length === 0 ? (
              <div className="bg-white border border-orange-100 rounded-3xl p-8 text-center text-gray-400">
                No hay pedidos aún
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold text-gray-700">
                      Pedido #{order.id.slice(0, 8)}
                    </p>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : order.status === "declined"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 mb-3">
                    {order.order_items?.map((item: any) => (
                      <p key={item.id} className="text-sm text-gray-600">
                        • {item.products?.name} x{item.quantity}
                      </p>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                    {new Date(order.createdAt).toLocaleString("es-CO")}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
