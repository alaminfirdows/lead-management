"use client"

import { useActionState } from "react"
import Link from "next/link"

import { login } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState(login, undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>
          Welcome back. Enter your credentials to continue.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <FieldGroup>
            {state?.error && (
              <FieldError role="alert">{state.error}</FieldError>
            )}
            <input
              type="hidden"
              name="callbackUrl"
              value={callbackUrl ?? ""}
            />
            <Field data-invalid={!!state?.fieldErrors?.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state?.values?.email}
                aria-invalid={!!state?.fieldErrors?.email}
                data-invalid={!!state?.fieldErrors?.email}
                required
              />
              <FieldError
                errors={state?.fieldErrors?.email?.map((message) => ({
                  message,
                }))}
              />
            </Field>
            <Field data-invalid={!!state?.fieldErrors?.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!state?.fieldErrors?.password}
                data-invalid={!!state?.fieldErrors?.password}
                required
              />
              <FieldError
                errors={state?.fieldErrors?.password?.map((message) => ({
                  message,
                }))}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Spinner />}
            Log in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
