"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function AuthModal() {
  const [isSignUp, setIsSignUp] = useState(false)
  const {data: session} = useSession()
  const router = useRouter()

  if(session?.user) {
    router.push("/")
  }
  // Validation schema
  const SignupSchema = Yup.object().shape({
    name: isSignUp
      ? Yup.string().required("Full name is required")
      : Yup.string(),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: isSignUp
      ? Yup.string()
          .oneOf([Yup.ref("password")], "Passwords must match")
          .required("Confirm your password")
      : Yup.string(),
  })

  // Form submission
  const handleSubmit = async (values: any) => {
    if (isSignUp) {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: true,
          callbackUrl: "/",
        })
      } else {
        alert("Signup failed")
      }
    } else {
      await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: true,
        callbackUrl: "/",
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="sm:max-w-md bg-card border-border p-0 overflow-hidden border border-[var(--border-gray)] rounded-lg shadow-lg">
        <div className="p-8 space-y-6">
          {/* Header */}
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

          {/* Formik Form */}
          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={SignupSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <>
                {/* Loading Overlay */}
                {isSubmitting && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}

                <Form className="space-y-4">
                {/* Name field (only for sign up) */}
                {isSignUp && (
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-card-foreground font-medium"
                    >
                      Full Name
                    </label>
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 w-full px-3 py-1.5 rounded-lg focus:outline-none focus:ring-0.5 focus:ring-black focus:border-black transition-all duration-200 shadow-sm hover:border-gray-400"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-card-foreground font-medium"
                  >
                    Email
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 w-full px-3 py-1.5 rounded-lg focus:outline-none focus:ring-0.5 focus:ring-black focus:border-black transition-all duration-200 shadow-sm hover:border-gray-400"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-card-foreground font-medium"
                    >
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        className="text-sm text-black hover:text-gray-800  font-medium transition-colors duration-200"
                      >
                        Forgot your password?
                      </button>
                    )}
                  </div>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 w-full px-3 py-1.5 rounded-lg focus:outline-none focus:ring-0.5 focus:ring-black focus:border-black transition-all duration-200 shadow-sm hover:border-gray-400"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Confirm Password (only for sign up) */}
                {isSignUp && (
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-card-foreground font-medium"
                    >
                      Confirm Password
                    </label>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 w-full px-3 py-1.5 rounded-lg focus:outline-none focus:ring-0.5 focus:ring-black focus:border-black transition-all duration-200 shadow-sm hover:border-gray-400"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSignUp ? "Sign up" : "Login"}
                </button>
              </Form>
              </>
            )}
          </Formik>

          {/* Google Button
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isSignUp ? "Sign up with Google" : "Login with Google"}
          </button> */}

          {/* Toggle Sign in / Sign up */}
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
        </div>
      </div>
    </div>
  )
}
