import fs from 'fs';
import path from 'path';
import { GetServerSideProps } from 'next';

interface Boleto {
  numero: number;
  email: string;
  fecha: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const auth = req.headers.cookie
    ?.split(';')
    .find(c => c.trim().startsWith('auth='))
    ?.split('=')[1];

  if (auth !== process.env.ADMIN_KEY) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const filePath = path.resolve('./boletos.json');
  const fileExists = fs.existsSync(filePath);

  const boletos: Boleto[] = fileExists
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : [];

  return {
    props: { boletos },
  };
};

export default function AdminPage({ boletos }: { boletos: Boleto[] }) {
  return (
    <div className="min-h-screen p-6 bg-white text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Número de Boleto</th>
            <th className="p-2 border">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {boletos.map((boleto, i) => (
            <tr key={i} className="border-t">
              <td className="p-2 border">{boleto.email}</td>
              <td className="p-2 border">#{boleto.numero.toString().padStart(5, '0')}</td>
              <td className="p-2 border">{new Date(boleto.fecha).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}