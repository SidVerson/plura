'use client'
import React from 'react'
import {z} from 'zod'
import {useToast} from '../ui/use-toast'
import {useRouter} from 'next/navigation'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '../ui/card'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '../ui/form'
import {createMedia, saveActivityLogsNotification} from '@/lib/queries'
import {Input} from '../ui/input'
import FileUpload from '../global/file-upload'
import {Button} from '../ui/button'

type Props = {
  subaccountId: string
}

const formSchema = z.object({
  link: z.string().min(1, { message: 'Файл необходим' }),
  name: z.string().min(1, { message: 'Имя необходимо' }),
})

const UploadMediaForm = ({ subaccountId }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      link: '',
      name: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await createMedia(subaccountId, values)
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Файл загружен | ${response.name}`,
        subaccountId,
      })

      toast({ title: 'Успех', description: 'загружено' })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'не получилось загрузить файл',
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Информация файла</CardTitle>
        <CardDescription>
          Пожалуйста, введите данные для вашего файла
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Название</FormLabel>
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

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Файл</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="mt-4"
            >
              Загрузить
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UploadMediaForm
