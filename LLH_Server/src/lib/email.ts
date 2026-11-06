import { Resend } from 'resend';
import "dotenv/config"

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY)
    throw new Error("resend api key not found");


const resend = new Resend(RESEND_API_KEY);

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'luismuraya11@gmail.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});