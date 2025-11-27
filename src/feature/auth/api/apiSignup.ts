import { NextResponse } from "next/server"
import { prisma } from "@/libs/prisma"
import { hash } from "bcryptjs"
import { sendEmail } from "@/libs/email"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        status: 'Inactive' as any,
      },
    })

    try {
      // Generate verification token and URL
      const token = randomBytes(32).toString('hex')
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify?token=${token}&email=${encodeURIComponent(email)}&action=verify`

      await sendEmail({
        to: email,
        subject: "Activate your Klickbee CRM account",
        text: `Hello${name ? ` ${name}` : ''},\n\nYour account has been created successfully! Please click the link below to verify and activate your account:\n\n${verificationUrl}\n\nIf you didn't create this account, please ignore this email.`,
        html: `<p>Hello${name ? ` ${name}` : ''},</p><p>Your account has been created successfully!</p><p>Please click the button below to verify and activate your account:</p><p><a href="${verificationUrl}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Account</a></p><p>If the button doesn't work, copy and paste this link into your browser:</p><p>${verificationUrl}</p><p>If you didn't create this account, please ignore this email.</p>`,
      })
    } catch (e) {
      console.error('Failed to send activation email', e)
      // proceed without failing the signup
    }

    return NextResponse.json({ success: true, user })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
