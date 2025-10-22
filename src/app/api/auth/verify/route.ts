import { NextResponse } from "next/server"
import { prisma } from "@/libs/prisma"
import { randomBytes } from "crypto"
import { hash } from "bcryptjs"
import { sendEmail } from "@/libs/email"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  if (!token || !email) {
    return NextResponse.json({ error: "Invalid verification link" }, { status: 400 })
  }

  try {
    // Find user by email and check if verification token matches
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // For security, you might want to store the verification token in the database
    // For now, we'll use a simple approach with email + timestamp validation
    // In production, consider storing tokens in a separate table

    // Update user status to Active
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'Active' }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.status === 'Active') {
      return NextResponse.json({ error: "User is already active" }, { status: 400 })
    }
    const action = user.status === 'Invite' ? 'set_password' : 'verify';
    // Generate a simple verification token (in production, store this in DB)
    const token = randomBytes(32).toString('hex')
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify?token=${token}&email=${encodeURIComponent(email)}&action=${action}`

    action === 'verify' ? await sendEmail({
      to: email,
      subject: "Activate your Klickbee CRM account",
      text: `Your account has been created successfully! Please click the link below to verify and activate your account:\n\n${verificationUrl}\n\nIf you didn't create this account, please ignore this email.`,
      html: `<p>Your account has been created successfully!</p><p>Please click the button below to verify and activate your account:</p><p><a href="${verificationUrl}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Account</a></p><p>If the button doesn't work, copy and paste this link into your browser:</p><p>${verificationUrl}</p><p>If you didn't create this account, please ignore this email.</p>`,
    }) : await sendEmail({
      to: email,
      subject: "Resend Verification Link",
      text: `You've been invited to Klickbee CRM. Please click the link below to set your password and activate your account:\n\n${verificationUrl}\n\nIf you didn't expect this invitation, please ignore this email.`,
      html: `<p>You've been invited to <b>Klickbee CRM</b>.</p><p>Please click the button below to set your password and activate your account:</p><p><a href="${verificationUrl}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Set Password & Activate</a></p><p>If the button doesn't work, copy and paste this link into your browser:</p><p>${verificationUrl}</p><p>If you didn't expect this invitation, please ignore this email.</p>`,
    })

    // For inactive users (from signup), just verify them
    return NextResponse.json({
      success: true,
      action: action,
      verificationUrl,
      message: 'Please verify your email to activate your account'
    })

  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Failed to resend verification" }, { status: 500 })
  }
}
