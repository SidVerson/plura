'use client'
import {Agency} from '@prisma/client'
import {useForm} from 'react-hook-form'
import React, {useEffect, useState} from 'react'
import {NumberInput} from '@tremor/react'
import {v4} from 'uuid'

import {useRouter} from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog'
import {zodResolver} from '@hookform/resolvers/zod'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '../ui/card'
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '../ui/form'
import {useToast} from '../ui/use-toast'

import * as z from 'zod'
import FileUpload from '../global/file-upload'
import {Input} from '../ui/input'
import {Switch} from '../ui/switch'
import {deleteAgency, initUser, saveActivityLogsNotification, updateAgencyDetails, upsertAgency,} from '@/lib/queries'
import {Button} from '../ui/button'
import Loading from '../global/loading'

type Props = {
  data?: Partial<Agency>
}

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Название агентства должно быть не менее 2 символов.' }),
  companyEmail: z.string().min(1),
  companyPhone: z.string().min(1),
  whiteLabel: z.boolean(),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  agencyLogo: z.string().min(1),
})

const AgencyDetails = ({ data }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const [deletingAgency, setDeletingAgency] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name,
      companyEmail: data?.companyEmail,
      companyPhone: data?.companyPhone,
      whiteLabel: data?.whiteLabel || false,
      address: data?.address,
      city: data?.city,
      zipCode: data?.zipCode,
      state: data?.state,
      country: data?.country,
      agencyLogo: data?.agencyLogo,
    },
  })
  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (data) {
      form.reset(data)
    }
  }, [data])

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      let newUserData
      let custId
      if (!data?.id) {
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.zipCode,
            },
            name: values.name,
          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.zipCode,
          },
        }

        const customerResponse = await fetch('/api/stripe/create-customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData),
        })
        const customerData: { customerId: string } =
            await customerResponse.json()
        custId = customerData.customerId
      }

      newUserData = await initUser({ role: 'AGENCY_OWNER' })
      if (!data?.customerId && !custId) return

      const response = await upsertAgency({
        id: data?.id ? data.id : v4(),
        customerId: data?.customerId || custId || '',
        address: values.address,
        agencyLogo: values.agencyLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        whiteLabel: values.whiteLabel,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        connectAccountId: '',
        goal: 5,
      })
      toast({
        title: 'Агентство создано',
      })
      if (data?.id) return router.refresh()
      if (response) {
        return router.refresh()
      }
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Ошибка!',
        description: 'Не удалось создать агентство',
      })
    }
  }
  const handleDeleteAgency = async () => {
    if (!data?.id) return
    setDeletingAgency(true)
    try {
      const response = await deleteAgency(data.id)
      toast({
        title: 'Агентство удалено',
        description: 'Ваше агентство и все связанные учетные записи удалены',
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Ошибка!',
        description: 'Не удалось удалить агентство',
      })
    }
    setDeletingAgency(false)
  }

  return (
      <AlertDialog>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Информация об агентстве</CardTitle>
            <CardDescription>
              Создайте агентство для вашего бизнеса. Вы сможете изменить настройки агентства позже на соответствующей вкладке.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
              >
                <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="agencyLogo"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Логотип агентства</FormLabel>
                          <FormControl>
                            <FileUpload
                                apiEndpoint="agencyLogo"
                                onChange={field.onChange}
                                value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex md:flex-row gap-4">
                  <FormField
                      disabled={isLoading}
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Название агентства</FormLabel>
                            <FormControl>
                              <Input
                                  placeholder="Введите название агентства"
                                  {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="companyEmail"
                      render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Email агентства</FormLabel>
                            <FormControl>
                              <Input
                                  readOnly
                                  placeholder="Введите email"
                                  {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>
                <div className="flex md:flex-row gap-4">
                  <FormField
                      disabled={isLoading}
                      control={form.control}
                      name="companyPhone"
                      render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Телефон агентства</FormLabel>
                            <FormControl>
                              <Input
                                  placeholder="Введите номер телефона"
                                  {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>

                <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="whiteLabel"
                    render={({ field }) => {
                      return (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                            <div>
                              <FormLabel>Белый лейбл</FormLabel>
                              <FormDescription>
                                Включение режима "белого лейбла" будет отображать логотип вашего агентства на всех субаккаунтах по умолчанию. Эту функцию можно изменить через настройки субаккаунта.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                      )
                    }}
                />
                <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Адрес</FormLabel>
                          <FormControl>
                            <Input
                                placeholder="Введите адрес"
                                {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex md:flex-row gap-4">
                  <FormField
                      disabled={isLoading}
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Город</FormLabel>
                            <FormControl>
                              <Input
                                  placeholder="Введите город"
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
                      name="state"
                      render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Город</FormLabel>
                            <FormControl>
                              <Input
                                  placeholder="Город..."
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
                      name="zipCode"
                      render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Почтовый индекс</FormLabel>
                            <FormControl>
                              <Input
                                  placeholder="Введите почтовый индекс"
                                  {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>
                <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Страна</FormLabel>
                          <FormControl>
                            <Input
                                placeholder="Введите страну"
                                {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
                {data?.id && (
                    <div className="flex flex-col gap-2">
                      <FormLabel>Цель агентства</FormLabel>
                      <FormDescription>
                        ✨ Установите цель для вашего агентства. С ростом бизнеса увеличиваются и цели, так что не забывайте поднимать планку!
                      </FormDescription>
                      <NumberInput
                          defaultValue={data?.goal}
                          onValueChange={async (val) => {
                            if (!data?.id) return
                            await updateAgencyDetails(data.id, { goal: val })
                            await saveActivityLogsNotification({
                              agencyId: data.id,
                              description: `Обновлена цель агентства до | ${val} субаккаунтов`,
                              subaccountId: undefined,
                            })
                            router.refresh()
                          }}
                          min={1}
                          className="bg-background !border !border-input"
                          placeholder="Введите цель для субаккаунтов"
                      />
                    </div>
                )}
                <Button
                    type="submit"
                    disabled={isLoading}
                >
                  {isLoading ? <Loading /> : 'Сохранить информацию об агентстве'}
                </Button>
              </form>
            </Form>

            {data?.id && (
                <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
                  <div>
                    <div>Опасная зона</div>
                  </div>
                  <div className="text-muted-foreground">
                    Удаление агентства необратимо. Это также удалит все субаккаунты и данные, связанные с ними. Субаккаунты потеряют доступ к воронкам, контактам и другим данным.
                  </div>
                  <AlertDialogTrigger
                      disabled={isLoading || deletingAgency}
                      className="text-red-600 p-2 text-center mt-2 rounded-md hover:bg-red-600 hover:text-white whitespace-nowrap"
                  >
                    {deletingAgency ? 'Удаление...' : 'Удалить агентство'}
                  </AlertDialogTrigger>
                </div>
            )}
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-left">
                  Вы уверены?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left">
                  Это действие нельзя отменить. Это навсегда удалит учетную запись агентства и все связанные субаккаунты.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex items-center">
                <AlertDialogCancel className="mb-2">Отменить</AlertDialogCancel>
                <AlertDialogAction
                    disabled={deletingAgency}
                    className="bg-destructive hover:bg-destructive"
                    onClick={handleDeleteAgency}
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </CardContent>
        </Card>
      </AlertDialog>
  )
}

export default AgencyDetails
