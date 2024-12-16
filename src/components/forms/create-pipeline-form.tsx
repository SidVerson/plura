'use client'
import React, {useEffect} from 'react'
import {z} from 'zod'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form'
import {Card, CardContent, CardHeader, CardTitle,} from '@/components/ui/card'
import {useForm} from 'react-hook-form'
import {Pipeline} from '@prisma/client'
import {Input} from '../ui/input'

import {Button} from '../ui/button'
import Loading from '../global/loading'
import {CreatePipelineFormSchema} from '@/lib/types'
import {saveActivityLogsNotification, upsertPipeline,} from '@/lib/queries'
import {toast} from '../ui/use-toast'
import {useModal} from '@/providers/modal-provider'
import {useRouter} from 'next/navigation'
import {zodResolver} from '@hookform/resolvers/zod'

interface CreatePipelineFormProps {
  defaultData?: Pipeline
  subAccountId: string
}

const CreatePipelineForm: React.FC<CreatePipelineFormProps> = ({
                                                                 defaultData,
                                                                 subAccountId,
                                                               }) => {
  const { data, isOpen, setOpen, setClose } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof CreatePipelineFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CreatePipelineFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || '',
      })
    }
  }, [defaultData])

  const isLoading = form.formState.isLoading

  const onSubmit = async (values: z.infer<typeof CreatePipelineFormSchema>) => {
    if (!subAccountId) return
    try {
      const response = await upsertPipeline({
        ...values,
        id: defaultData?.id,
        subAccountId: subAccountId,
      })

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Обновлена воронка | ${response?.name}`,
        subaccountId: subAccountId,
      })

      toast({
        title: 'Успешно',
        description: 'Детали воронки сохранены',
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка!',
        description: 'Не удалось сохранить детали воронки',
      })
    }

    setClose()
  }
  return (
      <Card className="w-full ">
        <CardHeader>
          <CardTitle>Детали воронки</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
              <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название воронки</FormLabel>
                        <FormControl>
                          <Input
                              placeholder="Название"
                              {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              <Button
                  className="w-20 mt-4"
                  disabled={isLoading}
                  type="submit"
              >
                {form.formState.isSubmitting ? <Loading /> : 'Сохранить'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  )
}

export default CreatePipelineForm
