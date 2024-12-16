'use client'
import {useModal} from '@/providers/modal-provider'
import React from 'react'
import {Button} from '../ui/button'
import CustomModal from '../global/custom-modal'
import UploadMediaForm from '../forms/upload-media'

type Props = {
  subaccountId: string
}

const MediaUploadButton = ({ subaccountId }: Props) => {
  const { isOpen, setOpen, setClose } = useModal()

  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal
            title="Загрузить файлы"
            subheading="Загрузите медиа в ваше хранилище"
          >
            <UploadMediaForm subaccountId={subaccountId}></UploadMediaForm>
          </CustomModal>
        )
      }}
    >
      Загрузить
    </Button>
  )
}

export default MediaUploadButton
