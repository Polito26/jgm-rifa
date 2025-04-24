import { useEffect, useState } from 'react';

export default function Gracias() {
  const [boletos, setBoletos] = useState<number[]>([]);

  useEffect(() => {
    const datos = localStorage.getItem('mis_boletos');
    if (datos) {
      setBoletos(JSON.parse(datos));
    }
  }, []);

  return (
    <div className="min-h-screen p-6 bg-white text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-center">¡Gracias por tu compra!</h1>
      <p className="text-center mb-6">Tus boletos asignados:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {boletos.map((n, i) => (
          <span key={i} className="px-3 py-1 bg-gray-200 rounded-full">
            #{n.toString().padStart(5, '0')}
          </span>
        ))}
      </div>
    </div>
  );
}