import Link from 'next/link'
import React from 'react'

type Props = {}

const Unauthorized = (props: Props) => {
  return (
    <div className="p-4 text-center h-screen w-screen flex justify-center items-center flex-col">
      <h1 className="text-3xl md:text-6xl">Неавторизованный вход!</h1>
      <p>Чтобы получить доступ, обратитесь в службу поддержки или к владельцу вашего агентства.</p>
      <Link
        href="/"
        className="mt-4 bg-primary p-2"
      >
        Назад
      </Link>
    </div>
  )
}

export default Unauthorized
