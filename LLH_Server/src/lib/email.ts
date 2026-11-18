import { Resend } from "resend";
import "dotenv/config";

export async function sendEmail(
    sender: string,
    receiver: string,
    subject: string,
    text: string,
) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey)
        throw new Error("Resend API key not found");

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
        from: sender,
        to: receiver,
        subject,
        text,
    });

    if (error)
        throw new Error(`Could not send email: ${error.message}`);
}
