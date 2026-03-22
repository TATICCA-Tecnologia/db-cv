import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type UseFormProps } from "react-hook-form"
import type { z } from "zod"

export function useZodForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, "resolver">,
) {
  return useForm<z.infer<TSchema>>({
    ...options,
    resolver: zodResolver(schema),
  })
}
