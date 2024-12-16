'use client'
import React from 'react'
import {Pipeline} from '@prisma/client'
import CreatePipelineForm from '@/components/forms/create-pipeline-form'
import {Button} from '@/components/ui/button'
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
} from '@/components/ui/alert-dialog'
import {deletePipeline} from '@/lib/queries'
import {toast} from '@/components/ui/use-toast'
import {useRouter} from 'next/navigation'

const PipelineSettings = ({
                            pipelineId,
                            subaccountId,
                            pipelines,
                          }: {
  pipelineId: string
  subaccountId: string
  pipelines: Pipeline[]
}) => {
  const router = useRouter()
  return (
      <AlertDialog>
        <div>
          <div className="flex items-center justify-between mb-4">
            <AlertDialogTrigger asChild>
              <Button variant={'destructive'}>Удалить Pipeline</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие необратимо. Оно приведет к удалению вашего
                  аккаунта и всех данных с наших серверов.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="items-center">
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                    onClick={async () => {
                      try {
                        await deletePipeline(pipelineId)
                        //Challenge: Activity log
                        toast({
                          title: 'Удалено',
                          description: 'Pipeline удален',
                        })
                        router.replace(`/subaccount/${subaccountId}/pipelines`)
                      } catch (error) {
                        toast({
                          variant: 'destructive',
                          title: 'Ошибка!',
                          description: 'Не удалось удалить Pipeline',
                        })
                      }
                    }}
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </div>

          <CreatePipelineForm
              subAccountId={subaccountId}
              defaultData={pipelines.find((p) => p.id === pipelineId)}
          />
        </div>
      </AlertDialog>
  )
}

export default PipelineSettings
