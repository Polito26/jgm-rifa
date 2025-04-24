import nodemailer from 'nodemailer';

export async function enviarCorreo(destinatario: string, boletos: number[]) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const texto = `Gracias por tu compra. Tus boletos son:\n\n${boletos.map(n => '#' + n.toString().padStart(5, '0')).join(', ')}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: 'Confirmación de Compra - JGM Group',
    text: texto,
  });
}
