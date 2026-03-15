import { useState, type FormEvent } from 'react';
import { API_URL } from '../api/api';

type RegisterProps = {
  onSuccess: () => void;
  onLogin: () => void;
};

export default function Register({ onSuccess, onLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert('Completa todos los campos');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'consumer',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Register failed');
        return;
      }

      alert('Cuenta creada correctamente');
      onSuccess();
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
          <h1 className="text-3xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-sm text-gray-500 mt-2">
            Regístrate para empezar a pedir
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo
            </label>
            <input
              type="email"
              placeholder="Tu correo"
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
              placeholder="Tu contraseña"
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
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={onLogin}
            className="w-full rounded-2xl border border-gray-200 px-5 py-3 text-gray-800 font-medium hover:bg-gray-50 transition"
          >
            Ya tengo cuenta
          </button>
        </div>
      </div>
    </div>
  );
}