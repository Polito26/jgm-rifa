import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [key, setKey] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    document.cookie = `auth=${key}; path=/`;
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-xl font-bold mb-4">Acceso Administrador</h1>
        <input
          type="password"
          placeholder="Clave de acceso"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button type="submit" className="w-full bg-gray-900 text-white p-2 rounded hover:bg-gray-700">
          Ingresar
        </button>
      </form>
    </div>
  );
}