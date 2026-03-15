import { useEffect, useState } from 'react';
import { API_URL } from '../api/api';
import type { User } from '../App';

interface Store {
  id: string;
  name: string;
  isOpen: boolean;
  description?: string;
  address?: string;
  category?: string;
  imageUrl?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

type CartItem = {
  product: Product;
  qty: number;
};

export default function Stores({ user }: { user: User }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [msg, setMsg] = useState('');
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    fetch(`${API_URL}/stores`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (r) => {
        const data = await r.json();
        console.log('STORES RESPONSE:', data);
        return data;
      })
      .then((data) => {
        const parsedStores = Array.isArray(data) ? data : data.data ?? data.stores ?? [];
        setStores(parsedStores);
      })
      .catch((err) => {
        console.error(err);
        setStores([]);
        setMsg('❌ No se pudieron cargar las tiendas');
        setTimeout(() => setMsg(''), 3000);
      })
      .finally(() => {
        setLoadingStores(false);
      });
  }, []);

  const selectStore = async (store: Store) => {
    setSelectedStore(store);
    setCart([]);
    setLoadingProducts(true);

    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`${API_URL}/products/store/${store.id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      console.log('PRODUCTS RESPONSE:', data);

      const parsedProducts = Array.isArray(data) ? data : data.data ?? data.products ?? [];
      setProducts(parsedProducts);
    } catch (error) {
      console.error(error);
      setProducts([]);
      setMsg('❌ No se pudieron cargar los productos');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setLoadingProducts(false);
    }
  };

  const closeStore = () => {
    setSelectedStore(null);
    setProducts([]);
    setCart([]);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const placeOrder = async () => {
    if (!selectedStore || cart.length === 0) return;

    if (!selectedStore.isOpen) {
      setMsg('❌ La tienda está cerrada, no puedes hacer pedidos');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          consumerId: user.id,
          storeId: selectedStore.id,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.qty,
          })),
        }),
      });

      const data = await res.json().catch(() => null);
      console.log('CREATE ORDER RESPONSE:', data);

      if (res.ok) {
        setMsg('✅ ¡Pedido creado exitosamente!');
        setCart([]);
        setTimeout(() => setMsg(''), 3000);
        return;
      }

      setMsg(data?.message || '❌ No se pudo crear el pedido');
      setTimeout(() => setMsg(''), 3000);
    } catch (error) {
      console.error(error);
      setMsg('❌ Ocurrió un error al crear el pedido');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  return (
    <div className="max-w-6xl mx-auto">
      {msg && (
        <div
          className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium border ${
            msg.startsWith('❌')
              ? 'bg-red-50 text-red-700 border-red-100'
              : 'bg-green-50 text-green-700 border-green-100'
          }`}
        >
          {msg}
        </div>
      )}

      <div className="mb-8">
        <p className="text-sm font-medium text-orange-500 mb-2">Explora</p>
        <h2 className="text-3xl font-bold text-gray-900">Tiendas disponibles</h2>
        <p className="text-gray-500 mt-2">
          Hola, {user.name}. Elige una tienda y arma tu pedido.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Tiendas</h3>
          <p className="text-sm text-gray-500 mb-5">
            Selecciona una tienda para ver sus productos
          </p>

          {loadingStores ? (
            <p className="text-sm text-gray-400">Cargando tiendas...</p>
          ) : stores.length === 0 ? (
            <p className="text-sm text-gray-400">No hay tiendas disponibles.</p>
          ) : (
            <div className="space-y-3">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => store.isOpen && selectStore(store)}
                  disabled={!store.isOpen}
                  className={`w-full text-left rounded-2xl border px-4 py-4 transition flex items-center justify-between gap-3 ${
                    selectedStore?.id === store.id
                      ? 'bg-orange-500 text-white border-orange-500'
                      : store.isOpen
                      ? 'bg-white border-gray-200 text-gray-800 hover:bg-orange-50'
                      : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-70'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{store.name}</p>
                    {store.category && (
                      <p
                        className={`text-sm mt-1 ${
                          selectedStore?.id === store.id ? 'text-orange-100' : 'text-gray-500'
                        }`}
                      >
                        {store.category}
                      </p>
                    )}
                  </div>

                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      selectedStore?.id === store.id
                        ? 'bg-white/20 text-white'
                        : store.isOpen
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {store.isOpen ? 'Abierta' : 'Cerrada'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm">
          {!selectedStore ? (
            <div className="h-full min-h-80 flex items-center justify-center text-center">
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">Productos</p>
                <p className="text-sm text-gray-400">
                  Selecciona una tienda para ver sus productos
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStore.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Estos son los productos disponibles
                  </p>
                </div>

                <button
                  onClick={closeStore}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cerrar
                </button>
              </div>

              {loadingProducts ? (
                <p className="text-sm text-gray-400">Cargando productos...</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-gray-400">Esta tienda no tiene productos aún.</p>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                        )}
                        <p className="text-orange-500 font-bold mt-2">
                          ${Number(product.price).toLocaleString('es-CO')}
                        </p>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        className="rounded-2xl bg-orange-500 px-4 py-2 text-white font-semibold hover:bg-orange-600 transition"
                      >
                        Agregar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <section className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Carrito</h3>
          <p className="text-sm text-gray-500 mb-5">Revisa tu pedido antes de enviarlo</p>

          {cart.length === 0 ? (
            <div className="min-h-80] flex items-center justify-center text-center">
              <p className="text-sm text-gray-400">Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-5">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        x{item.qty} — $
                        {(item.product.price * item.qty).toLocaleString('es-CO')}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="rounded-xl px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-orange-50 px-4 py-4 flex items-center justify-between mb-5">
                <span className="font-medium text-gray-700">Total</span>
                <span className="text-lg font-bold text-orange-600">
                  ${total.toLocaleString('es-CO')}
                </span>
              </div>

              <button
                onClick={placeOrder}
                className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-white font-semibold hover:bg-orange-600 transition"
              >
                Hacer pedido
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
}