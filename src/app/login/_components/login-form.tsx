import Image from "next/image"
import { useState } from "react"
import { Eye, EyeOff, LogIn, FileSearch, ShieldCheck, Users } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"
import { useZodForm } from "@/hooks/use-zod-form"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().min(1, "Email obrigatório").email("Email inválido"),
  password: z.string().min(1, "Palavra-passe obrigatória"),
})

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useZodForm(loginSchema, {
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors("root")
    setIsLoading(true)

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })

    if (result?.error) {
      form.setError("root", {
        type: "manual",
        message: "Email ou palavra-passe incorretos",
      })
    } else {
      router.push("/")
      router.refresh()
    }

    setIsLoading(false)
  })

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[oklch(0.22_0.04_172)] text-white p-12">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, oklch(0.55 0.14 172) 0%, transparent 55%), radial-gradient(circle at 80% 80%, oklch(0.45 0.14 200) 0%, transparent 55%), linear-gradient(135deg, oklch(0.20 0.05 172) 0%, oklch(0.16 0.04 220) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10">
          <Image
            src="/TATICCA_LOGO_LIGHTGRAY_BICOLOR.png"
            alt="Taticca"
            width={260}
            height={62}
            priority
          />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Gestão inteligente
              <br />
              de currículos.
            </h1>
            <p className="text-base text-white/70 max-w-md">
              Centralize candidatos, automatize triagens e tome decisões de
              recrutamento mais rápidas com o Banco CV.
            </p>
          </div>

          <ul className="space-y-4 text-sm text-white/85">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
                <FileSearch className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-white">Extração automática</p>
                <p className="text-white/65">
                  IA estrutura dados de CVs em segundos.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-white">Pipeline colaborativo</p>
                <p className="text-white/65">
                  Acompanhe candidatos por etapa e equipa.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-white">Conformidade RGPD</p>
                <p className="text-white/65">
                  Dados sensíveis protegidos por padrão.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Taticca · Todos os direitos reservados
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex justify-center">
            <div className="bg-[oklch(0.22_0.04_172)] rounded-lg px-5 py-3">
              <Image
                src="/TATICCA_LOGO_LIGHTGRAY_MONOCROMATICO.png"
                alt="Taticca"
                width={120}
                height={47}
                priority
              />
            </div>
          </div>
          <div className="relative z-10">
            <Image
              src="/TATICCA_LOGO_LIGHTGRAY_MONOCROMATICO.png"
              alt="Taticca"
              width={260}
              height={62}
              priority
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-muted-foreground">
              Aceda à plataforma de gestão de currículos do Banco CV.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu.email@taticca.pt"
                        autoComplete="email"
                        className="h-11 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Palavra-passe
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="h-11 bg-background pr-10"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Esconder" : "Mostrar"} palavra-passe
                        </span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root?.message && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-1 shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            Problemas para entrar? Contacte o administrador.
          </p>
        </div>
      </div>
    </div>
  )
}
