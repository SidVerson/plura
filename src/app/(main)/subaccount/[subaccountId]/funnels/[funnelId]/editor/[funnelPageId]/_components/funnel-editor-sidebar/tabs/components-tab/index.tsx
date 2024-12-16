import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from '@/components/ui/accordion'
import {EditorBtns} from '@/lib/constants'
import React from 'react'
import TextPlaceholder from './text-placeholder'
import ContainerPlaceholder from './container-placeholder'
import VideoPlaceholder from './video-placeholder'
import TwoColumnsPlaceholder from './two-columns-placeholder'
import LinkPlaceholder from './link-placeholder'
import ContactFormComponentPlaceholder from './contact-form-placeholder'
import CheckoutPlaceholder from './checkout-placeholder'

type Props = {}

const ComponentsTab = (props: Props) => {
  const elements: {
    Component: React.ReactNode
    label: string
    id: EditorBtns
    group: 'layout' | 'elements'
  }[] = [
    {
      Component: <TextPlaceholder />,
      label: 'Текст',
      id: 'text',
      group: 'elements',
    },
    {
      Component: <ContainerPlaceholder />,
      label: 'Контейнер',
      id: 'container',
      group: 'layout',
    },
    {
      Component: <TwoColumnsPlaceholder />,
      label: '2 Колонки',
      id: '2Col',
      group: 'layout',
    },
    {
      Component: <VideoPlaceholder />,
      label: 'Видео',
      id: 'video',
      group: 'elements',
    },
    {
      Component: <ContactFormComponentPlaceholder />,
      label: 'Форма',
      id: 'contactForm',
      group: 'elements',
    },
    {
      Component: <CheckoutPlaceholder />,
      label: 'Расчет',
      id: 'paymentForm',
      group: 'elements',
    },
    {
      Component: <LinkPlaceholder />,
      label: 'Ссылка',
      id: 'link',
      group: 'elements',
    },
  ]

  return (
    <Accordion
      type="multiple"
      className="w-full"
      defaultValue={['Layout', 'Elements']}
    >
      <AccordionItem
        value="Layout"
        className="px-6 py-0 border-y-[1px]"
      >
        <AccordionTrigger className="!no-underline">Макет</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {elements
            .filter((element) => element.group === 'layout')
            .map((element) => (
              <div
                key={element.id}
                className="flex-col items-center justify-center flex"
              >
                {element.Component}
                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="Elements"
        className="px-6 py-0 "
      >
        <AccordionTrigger className="!no-underline">Элементы</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {elements
            .filter((element) => element.group === 'elements')
            .map((element) => (
              <div
                key={element.id}
                className="flex-col items-center justify-center flex"
              >
                {element.Component}
                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default ComponentsTab
