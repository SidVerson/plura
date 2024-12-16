import React from 'react'

import {Funnel} from '@prisma/client'
import {db} from '@/lib/db'
import {getConnectAccountProducts} from '@/lib/stripe/stripe-actions'


import FunnelForm from '@/components/forms/funnel-form'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/components/ui/card'
import FunnelProductsTable from './funnel-products-table'

interface FunnelSettingsProps {
  subaccountId: string
  defaultData: Funnel
}

const FunnelSettings: React.FC<FunnelSettingsProps> = async ({
  subaccountId,
  defaultData,
}) => {
  //CHALLENGE: go connect your stripe to sell products

  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })

  if (!subaccountDetails) return
  if (!subaccountDetails.connectAccountId) return
  const products = await getConnectAccountProducts(
    subaccountDetails.connectAccountId
  )

  return (
    <div className="flex gap-4 flex-col xl:!flex-row">
      <Card className="flex-1 flex-shrink">
        <CardHeader>
          <CardTitle>Воронки</CardTitle>
          <CardDescription>
            Выберите продукты и услуги, которые вы хотите продавать в этой воронке.
            Вы можете продавать как одноразовые, так и повторяющиеся продукты.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <>
            {subaccountDetails.connectAccountId ? (
              <FunnelProductsTable
                defaultData={defaultData}
                products={products}
              />
            ) : (
              'Подключите свой аккаунт stripe, чтобы продавать товары.'
            )}
          </>
        </CardContent>
      </Card>

      <FunnelForm
        subAccountId={subaccountId}
        defaultData={defaultData}
      />
    </div>
  )
}

export default FunnelSettings
