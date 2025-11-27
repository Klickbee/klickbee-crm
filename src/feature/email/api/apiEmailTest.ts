import nodemailer from 'nodemailer';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { recipient, host, port, sender, username, password } = body;

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    // Use provided settings or get from database
    let emailSettings;
    if (host && port && sender && username && password) {
      emailSettings = { host, port, sender, username, password };
    } else {
      // Get settings from database
      const dbSettings = await prisma.emailSettings.findFirst({
        where: { userId: session.user.id }
      });

      if (!dbSettings) {
        return NextResponse.json(
          { error: 'Email settings not found. Please save your email settings first.' },
          { status: 400 }
        );
      }

      emailSettings = dbSettings;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: emailSettings.host,
      port: parseInt(emailSettings.port),
      secure: emailSettings.port === '465', // true for 465, false for other ports
      auth: {
        user: emailSettings.username,
        pass: emailSettings.password
      }
    });

    // Send test email
    await transporter.sendMail({
      from: emailSettings.sender,
      to: recipient,
      subject: "Test Email from Klickbee CRM",
      text: "This is a test email to verify your email settings are working correctly.",
      html: "<p>This is a test email to verify your email settings are working correctly.</p><p>If you received this email, your SMTP configuration is working properly! 🎉</p>",
    });

    return NextResponse.json({
      message: 'Test email sent successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({
      error: 'Failed to send test email. Please check your email settings.'
    }, { status: 500 });
  }
}
