import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const body = req.body;

    if (body.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const payer = body.resource.payer.email_address;
      const MAX_BOLETOS = 100000;
      const boletosPath = path.resolve('./boletos.json');

      const existentes = fs.existsSync(boletosPath)
        ? JSON.parse(fs.readFileSync(boletosPath, 'utf-8'))
        : [];

      const usados = new Set(existentes.map((b: any) => b.numero));
      const nuevos: number[] = [];

      while (nuevos.length < 5 && usados.size < MAX_BOLETOS) {
        const nuevo = Math.floor(Math.random() * MAX_BOLETOS);
        if (!usados.has(nuevo)) {
          nuevos.push(nuevo);
          usados.add(nuevo);
        }
      }

      const nuevosRegistros = nuevos.map(numero => ({
        numero,
        email: payer,
        fecha: new Date().toISOString(),
      }));

      const actualizados = [...existentes, ...nuevosRegistros];
      fs.writeFileSync(boletosPath, JSON.stringify(actualizados, null, 2));

      console.log(`✅ Boleto generado para ${payer}:`, nuevos);
    }

    res.status(200).json({ received: true, boletos: nuevos });
  } catch (err: any) {
    console.error('❌ Error en webhook PayPal:', err.message);
    res.status(500).json({ error: err.message });
  }
}