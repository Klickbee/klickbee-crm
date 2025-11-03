import nodemailer from "nodemailer"

type SendEmailOptions = {
    to: string
    subject: string
    text?: string
    html?: string
    from?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const smtpHost = process.env.SMTP_HOST || "smtp.example.com"
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
    const smtpUser = process.env.SMTP_USER || ""
    const smtpPass = process.env.SMTP_PASS || ""
    const smtpSecure = process.env.SMTP_SECURE || false

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: Boolean(smtpSecure),
        auth: smtpUser && smtpPass ? {user: smtpUser, pass: smtpPass} : undefined,
    })

    const info = await transporter.sendMail({
        from: 'Klickbee CRM <contact@webenvue.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    })

    console.log(info)

    return {success: true, messageId: info.messageId}
}


