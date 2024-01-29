'use client'

import Notifications from '@/app/notifications'
import Crdt from '@/app/crdt'

export default function Home() {
  return (
    <main className=" min-h-screen p-24">
      <Crdt />
      {false && <Notifications />}
    </main>
  )
}
