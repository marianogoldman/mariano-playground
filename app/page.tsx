'use client'

import Notifications from '@/app/notifications'
import Crdt from '@/app/crdt'
import Compare from '@/app/compare'

export default function Home() {
  return (
    <main className=" min-h-screen p-24">
      <Compare />
      {false && <Crdt />}
      {false && <Notifications />}
    </main>
  )
}
