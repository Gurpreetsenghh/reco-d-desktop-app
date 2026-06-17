import { UseMutateFunction } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, DefaultValues, FieldValues } from 'react-hook-form'
import { z, ZodType } from 'zod'

const useZodForm = <T extends ZodType<any, any, any>>(
  schema: T,
  mutation: UseMutateFunction<any, any, z.output<T>, any>,
  defaultValues?: DefaultValues<z.input<T>>
) => {
  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<T> & FieldValues, any, z.output<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onFormSubmit = handleSubmit(async (values) => mutation(values))

  return { register, watch, reset, onFormSubmit, errors }
}

export default useZodForm