import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { resetPasswordValidator, AuthUser, ApiResponse, SafeAccount, Account } from '@backend/db/schemas'
import authFetch, { type Endpoint } from './AuthApi';
import type z from 'zod';

type ResetPassword = z.infer<typeof resetPasswordValidator>
type AuthFormValues = { email: string; password?: string; newPassword?: string }

type AuthFormProps = {
  isRegistering: boolean
  onModeChange: (isRegistering: boolean) => void
}

function AuthForm({ isRegistering, onModeChange }: AuthFormProps) {
  const inputClasses = "border-2 border-text-main bg-surface p-3 text-[18px] font-normal leading-normal text-text-main shadow-hard transition-all placeholder:text-muted focus:border-accent focus:outline-none focus:ring-0 aria-invalid:border-accent my-3"
  const [message, setMessage] = useState('');
  const [isForgotPassword, setForgotPassword] = useState(false);
  const { clearErrors, formState: { errors, isSubmitting }, handleSubmit,
    getValues, register, reset, setError } = useForm<AuthFormValues>({
      defaultValues: { email: '', password: '', newPassword: '' },
      shouldUnregister: true,
    })

  async function submit(values: AuthFormValues) {
    setMessage('')
    clearErrors()
    const endpoint: Endpoint = isForgotPassword ? 'reset-password' : (isRegistering ? 'register' : 'login')
    const requestValues: AuthUser | ResetPassword = isForgotPassword
      ? { email: values.email, newPassword: values.newPassword ?? '' }
      : { email: values.email, password: values.password ?? '' }

    try {
      const result = await authFetch<Account | null>(endpoint, requestValues)
      if ('error' in result) {
        setError('root.serverError', { message: result.error })
        return
      }
      switch (endpoint) {
        case "reset-password": {
          reset({ email: values.email });
          setForgotPassword(false);
          setMessage('Your password has been reset. Log in with your new password.');
          break;
        }

        case "register": {
          reset({ email: values.email, password: '' });
          onModeChange(false);
          setMessage('Your account has been created and is ready for log in!');
          break;
        }

        case "login": 
        default: {
          if (result.data === null) {
            throw new Error("Failed to get account");
          }
          setMessage("Logged in");
          const account = result.data;
          console.log(`Account user ${account.userId}`);
          break;
        }
      }
    } catch (err) {
      console.error(err);
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

  function startPasswordReset() {
    reset({ email: getValues('email') })
    setForgotPassword(true)
    setMessage('')
    clearErrors()
  }

  function returnToLogin() {
    reset({ email: getValues('email'), password: '' })
    setForgotPassword(false)
    setMessage('')
    clearErrors()
  }

  return (
    <div className="flex w-full max-w-110 flex-col my-auto">
      <div className="mb-8">
        <p className="text-[14px] font-bold uppercase text-accent">
          {isForgotPassword ? 'Account recovery' : isRegistering ? 'Join the team' : 'Welcome back'}
        </p>
        <h2 className="mt-2 font-heading text-[36px] font-semibold leading-tight text-text-main">
          {isForgotPassword ? 'Reset your password' : isRegistering ? 'Create your account' : 'Log in'}
        </h2>
        <p className="mt-3 text-[18px] text-muted">
          {isForgotPassword
            ? 'Enter your email and choose a new password.'
            : isRegistering
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
        {!isForgotPassword && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[18px] font-bold leading-normal text-text-main">
                Password
              </label>
              {!isRegistering && (
                <button type="button" onClick={startPasswordReset}
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
        )}

        {isForgotPassword && (
          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="text-[18px] font-bold leading-normal text-text-main">
              New password
            </label>
            <input autoComplete="new-password" id="newPassword" placeholder="Enter a new password" type="password"
              {...register('newPassword', { required: 'New password is required.' })}
              aria-invalid={Boolean(errors.newPassword)}
              aria-describedby={errors.newPassword ? 'new-password-error' : undefined}
              className={inputClasses} />
            {errors.newPassword && (
              <p id="new-password-error" role="alert" className="text-[14px] font-bold text-accent">
                {errors.newPassword.message}
              </p>
            )}
          </div>
        )}

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
          {isSubmitting ? 'Please wait…' : isForgotPassword ? 'Reset password' : isRegistering ? 'Create account' : 'Log in'}
        </button>
      </form>

      {isForgotPassword ? (
        <button className="self-start text-[18px] font-bold text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-accent"
          onClick={returnToLogin}
          type="button">
          Back to log in
        </button>
      ) : (
        <p className="text-[18px] text-text-main">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button className="ml-1 font-bold text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-accent"
            onClick={() => changeMode(!isRegistering)}
            type="button">
            {isRegistering ? 'Log in' : 'Sign up here'}
          </button>
        </p>
      )}
    </div>
  )
}

export default AuthForm
