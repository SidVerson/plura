'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import {v4} from 'uuid'

import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form'
import {useRouter} from 'next/navigation'

import {Input} from '@/components/ui/input'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/components/ui/card'

import FileUpload from '../global/file-upload'
import {Agency, SubAccount} from '@prisma/client'
import {useToast} from '../ui/use-toast'
import {saveActivityLogsNotification, upsertSubAccount} from '@/lib/queries'
import {useEffect} from 'react'
import Loading from '../global/loading'
import {useModal} from '@/providers/modal-provider'

const formSchema = z.object({
  name: z.string(),
  companyEmail: z.string(),
  companyPhone: z.string().min(1),
  address: z.string(),
  city: z.string(),
  subAccountLogo: z.string(),
  zipCode: z.string(),
  state: z.string(),
  country: z.string(),
})

//CHALLENGE Give access for Subaccount Guest they should see a different view maybe a form that allows them to create tickets

//CHALLENGE layout.tsx oonly runs once as a result if you remove permissions for someone and they keep navigating the layout.tsx wont fire again. solution- save the data inside metadata for current user.

interface SubAccountDetailsProps {
  //To add the sub account to the agency
  agencyDetails: Agency
  details?: Partial<SubAccount>
  userId: string
  userName: string
}

const SubAccountDetails: React.FC<SubAccountDetailsProps> = ({
  details,
  agencyDetails,
  userId,
  userName,
}) => {
  const { toast } = useToast()
  const { setClose } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: details?.name,
      companyEmail: details?.companyEmail,
      companyPhone: details?.companyPhone,
      address: details?.address,
      city: details?.city,
      zipCode: details?.zipCode,
      state: details?.state,
      country: details?.country,
      subAccountLogo: details?.subAccountLogo,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await upsertSubAccount({
        id: details?.id ? details.id : v4(),
        address: values.address,
        subAccountLogo: values.subAccountLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        agencyId: agencyDetails.id,
        connectAccountId: '',
        goal: 5000,
      })
      if (!response) throw new Error('No response from server')
      await saveActivityLogsNotification({
        agencyId: response.agencyId,
        description: `${userName} | обновил | ${response.name}`,
        subaccountId: response.id,
      })

      toast({
        title: 'Успех',
        description: 'Успешно сохранены данные субакккаунта.',
      })

      setClose()
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'упс!',
        description: 'Не удалось сохранить данные субсчета.',
      })
    }
  }

  useEffect(() => {
    if (details) {
      form.reset(details)
    }
  }, [details])

  const isLoading = form.formState.isSubmitting
  //CHALLENGE Create this form.
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Информация о субаккаунте</CardTitle>
                <CardDescription>Пожалуйста, введите данные о бизнесе</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name="subAccountLogo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Логотип аккаунта</FormLabel>
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
                        <div className="flex md:flex-row gap-4">
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Название аккаунта</FormLabel>
                                        <FormControl>
                                            <Input
                                                required
                                                placeholder="Название вашей компании"
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
                                name="companyEmail"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Email аккаунта</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Email"
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
                                        <FormLabel>Номер телефона аккаунта</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Телефон"
                                                required
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
                            name="address"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Адрес</FormLabel>
                                    <FormControl>
                                        <Input
                                            required
                                            placeholder="ул. Примерная, д. 123..."
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
                                                required
                                                placeholder="Город"
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
                                                required
                                                placeholder="Город"
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
                                                required
                                                placeholder="Индекс"
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
                                            required
                                            placeholder="Страна"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loading /> : 'Сохранить информацию о аккаунте'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default SubAccountDetails
