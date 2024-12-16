'use client'
import ContactUserForm from '@/components/forms/contact-user-form'
import CustomModal from '@/components/global/custom-modal'
import {Button} from '@/components/ui/button'
import {useModal} from '@/providers/modal-provider'
import React from 'react'

type Props = {
  subaccountId: string
}

const CraeteContactButton = ({ subaccountId }: Props) => {
  const { setOpen } = useModal()

  const handleCreateContact = async () => {
    setOpen(
      <CustomModal
        title="Создайте или обновите контактную информацию"
        subheading="Контакты - это как клиенты."
      >
        <ContactUserForm subaccountId={subaccountId} />
      </CustomModal>
    )
  }

  return <Button className={'mb-2'} onClick={handleCreateContact}>Создать контакт</Button>
}

export default CraeteContactButton
