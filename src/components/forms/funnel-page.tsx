'use client'
import React, {useEffect} from 'react'
import {z} from 'zod'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '../ui/card'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '../ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Input} from '../ui/input'

import {Button} from '../ui/button'
import Loading from '../global/loading'
import {useToast} from '../ui/use-toast'
import {FunnelPage} from '@prisma/client'
import {FunnelPageSchema} from '@/lib/types'
import {deleteFunnelePage, getFunnels, saveActivityLogsNotification, upsertFunnelPage,} from '@/lib/queries'
import {useRouter} from 'next/navigation'
import {v4} from 'uuid'
import {CopyPlusIcon, Trash} from 'lucide-react'

interface CreateFunnelPageProps {
  defaultData?: FunnelPage
  funnelId: string
  order: number
  subaccountId: string
}

const CreateFunnelPage: React.FC<CreateFunnelPageProps> = ({
  defaultData,
  funnelId,
  order,
  subaccountId,
}) => {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof FunnelPageSchema>>({
    resolver: zodResolver(FunnelPageSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      pathName: '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({ name: defaultData.name, pathName: defaultData.pathName })
    }
  }, [defaultData])

  const onSubmit = async (values: z.infer<typeof FunnelPageSchema>) => {
    if (order !== 0 && !values.pathName)
      return form.setError('pathName', {
        message:
          "Страницы, кроме первой в воронке, требуют указания имени пути, например 'secondstep'.",
      })
    try {
      const response = await upsertFunnelPage(
        subaccountId,
        {
          ...values,
          id: defaultData?.id || v4(),
          order: defaultData?.order || order,
          pathName: values.pathName || '',
        },
        funnelId
      )

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Обновлена страница воронки | ${response?.name}`,
        subaccountId: subaccountId,
      })

      toast({
        title: 'Успешно',
        description: 'Данные страницы воронки сохранены',
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Ошибка!',
        description: 'Не удалось сохранить данные страницы воронки',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Страница воронки</CardTitle>
        <CardDescription>
          Страницы воронки по умолчанию идут в порядке их создания. Вы можете изменить их порядок.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
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
              disabled={form.formState.isSubmitting || order === 0}
              control={form.control}
              name="pathName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Имя пути</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Путь для страницы"
                      {...field}
                      value={field.value?.toLowerCase()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <Button
                className="w-22 self-end"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting ? <Loading /> : 'Сохранить страницу'}
              </Button>

              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  className="w-22 self-end border-destructive text-destructive hover:bg-destructive"
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    const response = await deleteFunnelePage(defaultData.id)
                    await saveActivityLogsNotification({
                      agencyId: undefined,
                      description: `Удалена страница воронки | ${response?.name}`,
                      subaccountId: subaccountId,
                    })
                    router.refresh()
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <Trash />}
                </Button>
              )}
              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  size={'icon'}
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    const response = await getFunnels(subaccountId)
                    const lastFunnelPage = response.find(
                      (funnel) => funnel.id === funnelId
                    )?.FunnelPages.length

                    await upsertFunnelPage(
                      subaccountId,
                      {
                        ...defaultData,
                        id: v4(),
                        order: lastFunnelPage ? lastFunnelPage : 0,
                        visits: 0,
                        name: `${defaultData.name} Копия`,
                        pathName: `${defaultData.pathName}copy`,
                        content: defaultData.content,
                      },
                      funnelId
                    )
                    toast({
                      title: 'Успешно',
                      description: 'Данные страницы воронки сохранены',
                    })
                    router.refresh()
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <CopyPlusIcon />}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CreateFunnelPage

