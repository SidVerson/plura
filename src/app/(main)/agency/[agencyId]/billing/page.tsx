import React from 'react'
import {stripe} from '@/lib/stripe'
import {addOnProducts, pricingCards} from '@/lib/constants'
import {db} from '@/lib/db'
import {Separator} from '@/components/ui/separator'
import PricingCard from './_components/pricing-card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table'
import clsx from 'clsx'
import SubscriptionHelper from './_components/subscription-helper'

type Props = {
  params: { agencyId: string }
}

const page = async ({ params }: Props) => {
  //CHALLENGE : Create the add on  products
  const addOns = await stripe.products.list({
    ids: addOnProducts.map((product) => product.id),
    expand: ['data.default_price'],
  })

  const agencySubscription = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    select: {
      customerId: true,
      Subscription: true,
    },
  })

  const prices = await stripe.prices.list({
    product: process.env.NEXT_PLURA_PRODUCT_ID,
    active: true,
  })

  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === agencySubscription?.Subscription?.priceId
  )

  const charges = await stripe.charges.list({
    limit: 50,
    customer: agencySubscription?.customerId,
  })

  const allCharges = [
    ...charges.data.map((charge) => ({
      description: charge.description,
      id: charge.id,
      date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(
        charge.created * 1000
      ).toLocaleDateString()}`,
      status: 'Paid',
      amount: `$${charge.amount / 100}`,
    })),
  ]

  return (
    <>
      <SubscriptionHelper
        prices={prices.data}
        customerId={agencySubscription?.customerId || ''}
        planExists={agencySubscription?.Subscription?.active === true}
      />
      <h1 className="text-4xl p-4">Билинг</h1>
      <Separator className=" mb-6" />
      <h2 className="text-2xl p-4">Текущий план</h2>
      <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          planExists={agencySubscription?.Subscription?.active === true}
          prices={prices.data}
          customerId={agencySubscription?.customerId || ''}
          amt={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.price || '$0'
              : '$0'
          }
          buttonCta={
            agencySubscription?.Subscription?.active === true
              ? 'Сменить план'
              : 'Начать'
          }
          highlightDescription="Хотите изменить свой план? Вы можете сделать это здесь. Если у вас
          дополнительные вопросы, обращайтесь по адресу support@plura-app.com.
"
          highlightTitle="Варианты"
          description={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.description || 'Начнем!'
              : 'Начнем! Выберите план, который подходит вам больше всего.\n'
          }
          duration="/ month"
          features={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features ||
                pricingCards.find((pricing) => pricing.title === 'Starter')
                  ?.features ||
                []
          }
          title={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.title || 'Начальный'
              : 'Начальный'
          }
        />
        {addOns.data.map((addOn) => (
          <PricingCard
            planExists={agencySubscription?.Subscription?.active === true}
            prices={prices.data}
            customerId={agencySubscription?.customerId || ''}
            key={addOn.id}
            amt={
              //@ts-ignore
              addOn.default_price?.unit_amount
                ? //@ts-ignore
                  `$${addOn.default_price.unit_amount / 100}`
                : '$0'
            }
            buttonCta="Подписаться"
            description="Выделенная линия поддержки и командный канал поддержки
"
            duration="/ месяц"
            features={[]}
            title={'24/7 приоритетная поддержка'}
            highlightTitle="Получите поддержку прямо сейчас!
"
            highlightDescription="Получите приоритетную поддержку и избавьтесь от долгого ожидания одним нажатием кнопки.
"
          />
        ))}
      </div>
      <h2 className="text-2xl p-4">История платежей
      </h2>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead className="w-[200px]">Описание</TableHead>
            <TableHead className="w-[200px]">Id счета</TableHead>
            <TableHead className="w-[300px]">Дата</TableHead>
            <TableHead className="w-[200px]">Уплачено</TableHead>
            <TableHead className="text-right">Кол-во</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allCharges.map((charge) => (
            <TableRow key={charge.id}>
              <TableCell>{charge.description}</TableCell>
              <TableCell className="text-muted-foreground">
                {charge.id}
              </TableCell>
              <TableCell>{charge.date}</TableCell>
              <TableCell>
                <p
                  className={clsx('', {
                    'text-emerald-500': charge.status.toLowerCase() === 'paid',
                    'text-orange-600':
                      charge.status.toLowerCase() === 'pending',
                    'text-red-600': charge.status.toLowerCase() === 'failed',
                  })}
                >
                  {charge.status.toUpperCase()}
                </p>
              </TableCell>
              <TableCell className="text-right">{charge.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default page
