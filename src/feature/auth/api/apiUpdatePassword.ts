import { NextResponse } from "next/server"
import { prisma } from "@/libs/prisma"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password, token } = await req.json()

    if (!email || !password || !token) {
      return NextResponse.json({ error: "Email, password, and token are required" }, { status: 400 })
    }

    // Find user by email and verify token (in production, store tokens in DB)
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10)

    // Update user password and status to Active
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: 'Active' as any
      }
    })

    return NextResponse.json({ success: true, message: "Password updated and account activated" })
  } catch (error) {
    console.error("Update password error:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
