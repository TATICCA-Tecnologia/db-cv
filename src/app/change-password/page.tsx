"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, KeyRound } from "lucide-react"
import { z } from "zod"
import { useZodForm } from "@/hooks/use-zod-form"
import { trpc } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"

const schema = z
  .object({
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a palavra-passe"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "As palavras-passe não coincidem",
    path: ["confirmPassword"],
  })

export default function ChangePasswordPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useZodForm(schema, {
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: async () => {
      await update({ mustChangePassword: false })
      router.push("/")
      router.refresh()
    },
    onError: (err) => {
      form.setError("root", { type: "manual", message: err.message })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!session?.user?.email) return
    changePassword.mutate({
      email: session.user.email,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    })
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto h-14 w-14 rounded-xl bg-primary flex items-center justify-center mb-4">
            <KeyRound className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Definir nova palavra-passe
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Por segurança, é necessário alterar a palavra-passe antes de continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Nova palavra-passe</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showNew ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          autoComplete="new-password"
                          className="bg-secondary border-border pr-10"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNew(!showNew)}
                      >
                        {showNew ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Confirmar palavra-passe</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repita a nova palavra-passe"
                          autoComplete="new-password"
                          className="bg-secondary border-border pr-10"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root?.message && (
                <p className="text-sm text-destructive text-center">
                  {form.formState.errors.root.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Guardar palavra-passe
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
