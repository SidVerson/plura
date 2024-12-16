'use client'
import {deleteSubAccount, getSubaccountDetails, saveActivityLogsNotification,} from '@/lib/queries'
import {useRouter} from 'next/navigation'
import React from 'react'

type Props = {
  subaccountId: string
}

const DeleteButton = ({ subaccountId }: Props) => {
  const router = useRouter()

  return (
    <div
      className="text-white"
      onClick={async () => {
        const response = await getSubaccountDetails(subaccountId)
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Удалить субаккаунт | ${response?.name}`,
          subaccountId,
        })
        await deleteSubAccount(subaccountId)
        router.refresh()
      }}
    >
      Удалить субаккаунт
    </div>
  )
}

export default DeleteButton
