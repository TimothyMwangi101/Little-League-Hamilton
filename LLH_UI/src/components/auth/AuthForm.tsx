import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import type { ApiResponse, createUserSchema, resetPasswordSchema } from '@backend/db/schemas'

type CreateUser = z.infer<typeof createUserSchema>
type ResetPassword = z.infer<typeof resetPasswordSchema>

type AuthFormProps = {
  isRegistering: boolean
  onModeChange: (isRegistering: boolean) => void
}

function AuthForm({ isRegistering, onModeChange }: AuthFormProps) {
  const inputClasses = "border-2 border-text-main bg-surface p-3 text-[18px] font-normal leading-normal text-text-main shadow-hard transition-all placeholder:text-muted focus:border-accent focus:outline-none focus:ring-0 aria-invalid:border-accent my-3"
  const [message, setMessage] = useState('')
  const { clearErrors, formState: { errors, isSubmitting },
    handleSubmit, register, reset, setError,
  } = useForm<CreateUser>({
    defaultValues: { email: '', password: '' },
  })

  async function submit(values: CreateUser) {
    setMessage('')
    clearErrors()

    try {
      const response = await fetch(`/api/auth/${isRegistering ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const result: unknown = await response.json()
      const responseError =
        typeof result === 'object' &&
          result !== null &&
          'error' in result &&
          typeof result.error === 'string'
          ? result.error
          : ''

      if (!response.ok) {
        setError('root.serverError', {
          message: responseError || 'We could not complete your request. Please try again.',
        })
        return
      }

      if (isRegistering) {
        reset({ email: values.email, password: '' })
        onModeChange(false)
        setMessage('Your account is ready. Log in with your new details.')
      } else {
        setMessage('You are logged in successfully.')
      }
    } catch {
      setError('root.serverError', {
        message: 'Unable to reach the server. Please try again in a moment.',
      })
    }
  }

  function changeMode(nextMode: boolean) {
    onModeChange(nextMode)
    setMessage('')
    clearErrors()
  }

  return (
    <div className="flex w-full max-w-110 flex-col my-auto">
      <div className="mb-8">
        <p className="text-[14px] font-bold uppercase text-accent">
          {isRegistering ? 'Join the team' : 'Welcome back'}
        </p>
        <h2 className="mt-2 font-heading text-[36px] font-semibold leading-tight text-text-main">
          {isRegistering ? 'Create your account' : 'Log in'}
        </h2>
        <p className="mt-3 text-[18px] text-muted">
          {isRegistering
            ? 'Get started with Hamilton Little League.'
            : 'Sign in to get back in the game.'}
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit(submit)}>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[18px] font-bold leading-normal text-text-main">
            Email address
          </label>
          <input autoComplete="email"
            id="email" placeholder="you@example.com" type="email"
            {...register('email', { required: 'Email address is required.' })}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={inputClasses} />
          {errors.email && (
            <p id="email-error" role="alert" className="text-[14px] font-bold text-accent">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[18px] font-bold leading-normal text-text-main">
              Password
            </label>
            {!isRegistering && (
              <button type="button"
                onClick={() => {
                  setMessage('To be implemented.')
                  clearErrors()
                }}
                className="text-[14px] font-bold text-primary underline decoration-1 underline-offset-2 transition-colors hover:text-accent">
                Forgot password?
              </button>
            )}
          </div>
          <input autoComplete={isRegistering ? 'new-password' : 'current-password'}
            id="password" placeholder="Enter your password" type="password"
            {...register('password', { required: 'Password is required.' })}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={inputClasses} />
          {errors.password && (
            <p id="password-error" role="alert" className="text-[14px] font-bold text-accent">
              {errors.password.message}
            </p>
          )}
        </div>

        {errors.root?.serverError && (
          <p role="alert" className="text-[14px] font-bold text-accent">
            {errors.root.serverError.message}
          </p>
        )}
        {message && (
          <p role="status" className="text-[14px] font-bold text-auth-green">
            {message}
          </p>
        )}

        <button className="flex h-16 w-full cursor-pointer items-center justify-center border-2 border-text-main bg-auth-green px-5 text-[20px] font-bold uppercase text-surface shadow-hard transition-all hover:translate-y-0.5 hover:shadow-hard-hover active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-6 my-6"
          disabled={isSubmitting}
          type="submit">
          {isSubmitting ? 'Please wait…' : (isRegistering ? 'Create account' : 'Log in')}
        </button>
      </form>

      <p className="text-[18px] text-text-main">
        {isRegistering ? 'Already have an account?' : "Don't have an account?"}
        <button className="ml-1 font-bold text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-accent"
          onClick={() => changeMode(!isRegistering)}
          type="button">
          {isRegistering ? 'Log in' : 'Sign up here'}
        </button>
      </p>
    </div>
  )
}

export default AuthForm
