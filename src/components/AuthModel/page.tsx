"use client"

import { signIn } from "next-auth/react"
import { useEffect, useMemo, useState, type InputHTMLAttributes } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const baseSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signupSchema = baseSchema.extend({
  name: z.string().min(1, "Full name is required"),
  confirmPassword: z.string().min(6, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
})

const loginSchema = baseSchema.extend({
  name: z.string(),
  confirmPassword: z.string(),
})

type AuthFormValues = z.infer<typeof signupSchema>

export function AuthModal() {
  const [isSignUp, setIsSignUp] = useState(false)
  const signupEnabled = process.env.NEXT_PUBLIC_SIGNUP_ENABLED === "true"
  const [error, setError] = useState("")
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [lastEmailAttempt, setLastEmailAttempt] = useState("")
  const { data: session } = useSession()
  const router = useRouter()

  const resolver = useMemo(() => zodResolver(isSignUp ? signupSchema : loginSchema), [isSignUp])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthFormValues>({
    resolver,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    reset({ name: "", email: "", password: "", confirmPassword: "" })
  }, [isSignUp, reset])

  useEffect(() => {
    if (session?.user) {
      router.push("/")
    }
  }, [session, router])

  const onSubmit = async (values: AuthFormValues) => {
    setError("")
    setShowResendVerification(false)

    if (isSignUp) {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
          callbackUrl: "/",
        })

        if (result?.error) {
          setError(result.error)
        } else if (result?.ok) {
          router.push("/")
        }
      } else {
        const data = await res.json()
        setError(data.error || "Signup failed")
      }
      return
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: "/",
    })

    if (result?.error) {
      if (result.error.includes("Password is incorrect")) {
        setError("Password is incorrect")
      } else if (result.error.includes("No account found")) {
        setError("No account found with this email address")
      } else if (result.error.includes("Email and password are required")) {
        setError("Please enter both email and password")
      } else if (result.error.includes("Account is not active")) {
        setError("Account is not active. Please check your email for the verification link.")
        setShowResendVerification(true)
        setLastEmailAttempt(values.email)
      } else {
        setError(result.error)
      }
    } else if (result?.ok) {
      router.push("/")
    }
  }

  const handleResendVerification = async () => {
    if (!lastEmailAttempt) return

    setResendLoading(true)
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lastEmailAttempt }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Verification email sent! Please check your inbox.")
      } else {
        toast.error(data.error || "Failed to resend verification email")
      }
    } catch (error) {
      toast.error("Failed to resend verification email")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="sm:max-w-md bg-card border-border p-0 overflow-hidden border border-[var(--border-gray)] rounded-lg shadow-lg">
        <div className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-card-foreground">
              {isSignUp ? "Create your account" : "Login to your account"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isSignUp
                ? "Enter your details below to create your account"
                : "Enter your email below to login to your account"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
              {showResendVerification && (
                <div className="mt-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Resend Verification Email"}
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-4">
            {isSubmitting && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            )}

            {isSignUp && (
              <Field
                label="Full Name"
                error={errors.name?.message}
                inputProps={{
                  ...register("name"),
                  placeholder: "John Doe",
                }}
              />
            )}

            <Field
              label="Email"
              error={errors.email?.message}
              inputProps={{
                ...register("email"),
                type: "email",
                placeholder: "m@example.com",
              }}
            />

            <Field
              label="Password"
              error={errors.password?.message}
              inputProps={{
                ...register("password"),
                type: "password",
              }}
            />

            {isSignUp && (
              <Field
                label="Confirm Password"
                error={errors.confirmPassword?.message}
                inputProps={{
                  ...register("confirmPassword"),
                  type: "password",
                }}
              />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSignUp ? "Sign up" : "Login"}
            </button>
          </form>

          {signupEnabled && (
            <div className="text-center text-sm">
              <span className="text-gray-600">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-black hover:text-gray-800 font-semibold hover:underline transition-colors duration-200"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  inputProps,
}: {
  label: string
  error?: string
  inputProps: InputHTMLAttributes<HTMLInputElement>
}) {
  return (
    <div className="space-y-2">
      <label className="text-card-foreground font-medium" htmlFor={inputProps.name}>
        {label}
      </label>
      <input
        {...inputProps}
        className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 w-full px-3 py-1.5 rounded-lg focus:outline-none focus:ring-0.5 focus:ring-black focus:border-black transition-all duration-200 shadow-sm hover:border-gray-400"
      />
      {error ? <div className="text-red-500 text-sm">{error}</div> : null}
    </div>
  )
}
