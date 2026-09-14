"use client"

import { useActionState } from "react"
import Link from "next/link"

import { register } from "@/lib/actions/auth"
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

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Set up your workspace to start tracking leads.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <FieldGroup>
            {state?.error && (
              <FieldError role="alert">{state.error}</FieldError>
            )}
            <Field data-invalid={!!state?.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                defaultValue={state?.values?.name}
                aria-invalid={!!state?.fieldErrors?.name}
                data-invalid={!!state?.fieldErrors?.name}
                required
              />
              <FieldError
                errors={state?.fieldErrors?.name?.map((message) => ({
                  message,
                }))}
              />
            </Field>
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
                autoComplete="new-password"
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
            <Field data-invalid={!!state?.fieldErrors?.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!state?.fieldErrors?.confirmPassword}
                data-invalid={!!state?.fieldErrors?.confirmPassword}
                required
              />
              <FieldError
                errors={state?.fieldErrors?.confirmPassword?.map(
                  (message) => ({ message })
                )}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Spinner />}
            Create account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
