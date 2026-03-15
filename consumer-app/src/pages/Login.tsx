import { useState, type FormEvent } from 'react';
import { API_URL } from '../api/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type LoginProps = {
  onBack: () => void;
  onRegister: () => void;
  onSuccess: (user: User) => void;
};

export default function Login({ onBack, onRegister, onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Completa todos los campos');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('LOGIN RESPONSE:', data);

      if (!response.ok) {
        alert(data.message || 'Login failed');
        return;
      }

      const payload = data.data ?? data;
      const userData = payload.user ?? {};
      const sessionData = payload.session ?? {};

      localStorage.setItem('access_token', sessionData?.access_token || '');
      localStorage.setItem('user', JSON.stringify(userData));

      onSuccess({
        id: userData?.id || '',
        name: userData?.name || userData?.user_metadata?.name || 'Usuario',
        email: userData?.email || email,
        role: 'consumer',
      });
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-orange-500 mb-2">Consumer App</p>
          <h1 className="text-3xl font-bold text-gray-900">Inicia sesión</h1>
          <p className="text-sm text-gray-500 mt-2">
            Entra para explorar tiendas y ver tus pedidos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo
            </label>
            <input
              type="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-orange-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-orange-500 px-5 py-3 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onRegister}
            className="w-full rounded-2xl border border-gray-200 px-5 py-3 text-gray-800 font-medium hover:bg-gray-50 transition"
          >
            Crear cuenta
          </button>

          <button
            onClick={onBack}
            className="w-full rounded-2xl px-5 py-3 text-gray-500 font-medium hover:bg-gray-50 transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}