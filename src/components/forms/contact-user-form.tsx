'use client'
import {zodResolver} from '@hookform/resolvers/zod'
import React, {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/components/ui/card'
import {Input} from '../ui/input'
import {Button} from '../ui/button'
import Loading from '../global/loading'
import {ContactUserFormSchema} from '@/lib/types'
import {saveActivityLogsNotification, upsertContact} from '@/lib/queries'
import {toast} from '../ui/use-toast'
import {useRouter} from 'next/navigation'
import {useModal} from '@/providers/modal-provider'

interface ContactUserFormProps {
  subaccountId: string
}

const ContactUserForm: React.FC<ContactUserFormProps> = ({ subaccountId }) => {
  const { setClose, data } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof ContactUserFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(ContactUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    if (data.contact) {
      form.reset(data.contact)
    }
  }, [data, form.reset])

  const isLoading = form.formState.isLoading

  const handleSubmit = async (
      values: z.infer<typeof ContactUserFormSchema>
  ) => {
    try {
      const response = await upsertContact({
        email: values.email,
        subAccountId: subaccountId,
        name: values.name,
      })
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Обновлен контакт | ${response?.name}`,
        subaccountId: subaccountId,
      })
      toast({
        title: 'Успешно',
        description: 'Данные контакта сохранены',
      })
      setClose()
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка!',
        description: 'Не удалось сохранить данные контакта',
      })
    }
  }

  return (
      <Card className=" w-full">
        <CardHeader>
          <CardTitle>Информация о контакте</CardTitle>
          <CardDescription>
            Вы можете назначать тикеты контактам и задавать значение для каждого контакта в тикете.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-4"
            >
              <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя</FormLabel>
                        <FormControl>
                          <Input
                              placeholder="Имя"
                              {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                              type="email"
                              placeholder="Email"
                              {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />

              <Button
                  className="mt-4"
                  disabled={isLoading}
                  type="submit"
              >
                {form.formState.isSubmitting ? (
                    <Loading />
                ) : (
                    'Сохранить контакт!'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  )
}

export default ContactUserForm
