import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import type { ApiResponse, createUserSchema } from '@backend/db/schemas'

type AuthFormValues = z.infer<typeof createUserSchema>

type AuthFormProps = {
  isRegistering: boolean
  onModeChange: (isRegistering: boolean) => void
}

function AuthForm({ isRegistering, onModeChange }: AuthFormProps) {
  const [message, setMessage] = useState('')
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<AuthFormValues>({
    defaultValues: { email: '', password: '' },
  })

  async function submit(values: AuthFormValues) {
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
    <div className="my-auto w-full max-w-[440px]">
      <div className="mb-[30px] min-[761px]:mb-[38px]">
        <p className="mb-4 text-[13px] leading-[1.4] font-bold tracking-[0.13em] text-[#d95204] uppercase">
          {isRegistering ? 'Join the team' : 'Welcome back'}
        </p>
        <h2 className="m-0 font-['Fraunces',Georgia,serif] text-[clamp(34px,3.5vw,46px)] leading-[1.12] font-semibold tracking-[-0.035em] text-[#121413]">
          {isRegistering ? 'Create your account' : 'Log in'}
        </h2>
        <p className="mt-[14px] text-base leading-[1.55] text-[#636c67]">
          {isRegistering
            ? 'Get started with Hamilton Little League.'
            : 'Sign in to get back in the game.'}
        </p>
      </div>

      <form
        className="flex flex-col gap-[26px]"
        noValidate
        onSubmit={handleSubmit(submit)}
      >
        <div className="flex flex-col gap-[9px]">
          <label htmlFor="email" className="text-base font-bold text-[#121413]">
            Email address
          </label>
          <input
            autoComplete="email"
            id="email"
            placeholder="you@example.com"
            type="email"
            {...register('email', { required: 'Email address is required.' })}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="min-h-[58px] w-full border-2 border-[#121413] bg-white p-[14px_15px] text-base text-[#121413] shadow-[4px_4px_0_#121413] transition-[border-color,box-shadow] duration-150 placeholder:text-[#737a76] focus-visible:border-[#d95204] focus-visible:outline-none focus-visible:shadow-[4px_4px_0_#d95204]"
          />
          {errors.email && (
            <p
              id="email-error"
              className="-mt-2 text-sm leading-[1.45] text-[#a12818]"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-[9px]">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-base font-bold text-[#121413]">
              Password
            </label>
            {!isRegistering && (
              <button
                className="w-fit cursor-pointer border-0 bg-transparent p-0 text-[13px] font-bold text-[#0f4c3a] underline decoration-1 underline-offset-[3px] hover:text-[#d95204] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d95204]"
                onClick={() => {
                  setMessage('Please contact league support to reset your password.')
                  clearErrors()
                }}
                type="button"
              >
                Forgot password?
              </button>
            )}
          </div>
          <input
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            id="password"
            placeholder="Enter your password"
            type="password"
            {...register('password', { required: 'Password is required.' })}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="min-h-[58px] w-full border-2 border-[#121413] bg-white p-[14px_15px] text-base text-[#121413] shadow-[4px_4px_0_#121413] transition-[border-color,box-shadow] duration-150 placeholder:text-[#737a76] focus-visible:border-[#d95204] focus-visible:outline-none focus-visible:shadow-[4px_4px_0_#d95204]"
          />
          {errors.password && (
            <p
              id="password-error"
              className="-mt-2 text-sm leading-[1.45] text-[#a12818]"
              role="alert"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {errors.root?.serverError && (
          <p
            className="-mt-2 text-sm leading-[1.45] text-[#a12818]"
            role="alert"
          >
            {errors.root.serverError.message}
          </p>
        )}
        {message && (
          <p className="-mt-2 text-sm leading-[1.45] text-[#0f4c3a]" role="status">
            {message}
          </p>
        )}

        <button
          className="mt-[6px] min-h-[62px] cursor-pointer border-2 border-[#121413] bg-[#0f4c3a] px-5 py-[14px] text-[17px] font-bold tracking-[0.07em] text-white uppercase shadow-[4px_4px_0_#121413] transition-[transform,box-shadow,background] duration-120 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#0b3e30] hover:shadow-[2px_2px_0_#121413] active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d95204] disabled:cursor-wait disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? 'Please wait…'
            : isRegistering
              ? 'Create account'
              : 'Log in'}
        </button>
      </form>

      <p className="mt-[30px] text-center text-[15px] leading-[1.6] text-[#121413]">
        {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          className="w-fit cursor-pointer border-0 bg-transparent p-0 text-[15px] font-bold text-[#0f4c3a] underline decoration-2 underline-offset-4 hover:text-[#d95204] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d95204]"
          onClick={() => changeMode(!isRegistering)}
          type="button"
        >
          {isRegistering ? 'Log in' : 'Sign up here'}
        </button>
      </p>
    </div>
  )
}

export default AuthForm
