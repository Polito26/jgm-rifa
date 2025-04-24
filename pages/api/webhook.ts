import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const boletosPath = path.resolve('./boletos.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } catch (err: any) {
      console.error('⚠️  Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.customer_email;
      const cantidad = 1;
      const MAX_BOLETOS = 100000;

      const existentes: number[] = fs.existsSync(boletosPath)
        ? JSON.parse(fs.readFileSync(boletosPath, 'utf-8'))
        : [];

      const nuevos: number[] = [];
      const usados = new Set(existentes.map((b: any) => b.numero));

      while (nuevos.length < cantidad && usados.size < MAX_BOLETOS) {
        const nuevo = Math.floor(Math.random() * MAX_BOLETOS);
        if (!usados.has(nuevo)) {
          nuevos.push(nuevo);
          usados.add(nuevo);
        }
      }

      const nuevosRegistros = nuevos.map((numero) => ({
        numero,
        email,
        fecha: new Date().toISOString(),
      }));

      const actualizados = [...existentes, ...nuevosRegistros];

      fs.writeFileSync(boletosPath, JSON.stringify(actualizados, null, 2));

      console.log(`✅ Boletos asignados a ${email}:`, nuevos);
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}