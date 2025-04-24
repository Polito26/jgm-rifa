import { useState } from "react";

export default function RifaPage() {
  const [boletosVendidos, setBoletosVendidos] = useState(0);
  const [boletos, setBoletos] = useState<number[]>([]);

  const MAX_BOLETOS = 100000;

  const generarBoletos = (cantidad: number) => {
    const nuevos = [];
    const existentes = new Set(boletos);
    while (nuevos.length < cantidad && existentes.size < MAX_BOLETOS) {
      const nuevo = Math.floor(Math.random() * MAX_BOLETOS);
      if (!existentes.has(nuevo)) {
        nuevos.push(nuevo);
        existentes.add(nuevo);
      }
    }
    setBoletos(prev => [...prev, ...nuevos]);
    setBoletosVendidos(prev => prev + nuevos.length);
  };

  const handleCheckout = async () => {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
    });
    const session = await response.json();
    window.location.href = session.url;
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">JGM Group</h1>
        <p className="text-lg">Participa en la rifa de nuestro exclusivo producto</p>
      </header>

      <main className="animate-fadeIn" className="max-w-3xl mx-auto">
        <div className="mb-6">
          <img src="/producto.jpg" alt="Producto a rifar" className="w-full rounded-xl shadow-lg" />
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-gray-800 h-4 rounded-full" style={{ width: `${(boletosVendidos / MAX_BOLETOS) * 100}%` }} />
          </div>
          <p className="mt-2 text-center">{boletosVendidos} de {MAX_BOLETOS} boletos vendidos</p>
        </div>

        <div className="text-center">
          <button onClick={handleCheckout} className="px-6 py-2 rounded bg-gray-900 text-white hover:bg-gray-700">
            Comprar Boleto ($5 USD)
          </button>
        </div>

        {boletos.length > 0 && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Tus boletos:</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {boletos.map((num, i) => (
                <span key={i} className="px-3 py-1 bg-gray-200 rounded-full">
                  #{num.toString().padStart(5, '0')}
                </span>
              ))}
            </div>
          </div>
        )}
      <script src="https://www.paypal.com/sdk/js?client-id=sb&currency=USD"></script>
<div id="paypal-button-container" className="mt-4"></div>
<script>
  paypal.Buttons({
    createOrder: async function(data, actions) {
      const res = await fetch('/api/create-paypal-order', { method: 'POST' });
      const dataJson = await res.json();
      return dataJson.id;
    },
    onApprove: async function(data, actions) {
      const res = await fetch('/api/paypal-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'CHECKOUT.ORDER.APPROVED', resource: { payer: { email_address: 'comprador@fake.com' } } })
      });
      const result = await res.json();
      if (result.boletos) {
        localStorage.setItem('mis_boletos', JSON.stringify(result.boletos));
      }
      alert('¡Pago realizado! Aún no se han generado boletos.');
      // Aquí se puede agregar lógica para redirigir o mostrar confirmación
    }
  }).render('#paypal-button-container');
</script>
<div className="text-center mt-6">
  <label htmlFor="cantidad" className="block mb-2 font-medium">Cantidad de boletos:</label>
  <input type="number" id="cantidad" name="cantidad" min="1" max="10" value="1"
         className="mx-auto block text-center border border-gray-300 rounded px-4 py-2 w-24"
         oninput="document.getElementById('paypal-button-container').innerHTML = '';" />
</div>
<div id="paypal-button-container" className="mt-4"></div>
<script src="https://www.paypal.com/sdk/js?client-id=sb&currency=USD"></script>
<script>
  paypal.Buttons({
    createOrder: async function(data, actions) {
      const cantidad = parseInt(document.getElementById('cantidad').value || '1');
      const res = await fetch('/api/create-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad })
      });
      const dataJson = await res.json();
      return dataJson.id;
    },
    onApprove: async function(data, actions) {
      const res = await fetch('/api/paypal-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'CHECKOUT.ORDER.APPROVED', resource: { payer: { email_address: 'comprador@fake.com' } } })
      });
      const result = await res.json();
      if (result.boletos) {
        localStorage.setItem('mis_boletos', JSON.stringify(result.boletos));
      }
      window.location.href = '/gracias';
    }
  }).render('#paypal-button-container');
</script>
</main>
    </div>
  );
}