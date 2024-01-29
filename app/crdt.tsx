'use client'

import { useEffect, useState } from 'react'

export enum MessageType {
  // Only send by this server
  Init = 1,
  ParticipantJoined = 2,
  ParticipantLeft = 3,

  // Just stored and forwarded
  ParticipantSelectedEntity = 4,
  ParticipantUnselectedEntity = 5,
  Crdt = 6
}

function decodeMessage(data: Uint8Array): [MessageType, Uint8Array] {
  const msgType = data.at(0) as number
  return [msgType, data.subarray(1)]
}

function encodeMessage(msgType: MessageType, message: Uint8Array): Uint8Array {
  const packet = new Uint8Array(message.byteLength + 1)
  packet.set([msgType])
  packet.set(message, 1)
  return packet
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function decodeJSON(data: Uint8Array) {
  return JSON.parse(decoder.decode(data))
}

function printAddress(address: string): string {
  return address.slice(0, 7) + '...' + address.slice(-5)
}

const rooms = ['room-1', 'room-2', 'room-3', 'room-4']

const addresses = [
  '0x0000000000085d4780B73119b644AE5ecd22b376',
  '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  '0x31f5Daaae7BFDfa6535C2c7911e3D2465d24C76C',
  '0x473037de59cf9484632f4A27B509CFE8d4a31404',
  '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
  '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  '0x53e0e51b5Ed9202110D7Ecd637A4581db8b9879F',
  '0x69D30b1875d39E13A01AF73CCFED6d84839e84f2',
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  '0x75e89d5979E4f6Fba9F97c104c2F0AFB3F1dcB88',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '0xD9370c94253f080272BA1c28E216146ecE806d33',
  '0xe3c408BD53c31C085a1746AF401A4042954ff740'
]

const colors = [
  'text-red-500',
  'text-teal-500',
  'text-amber-500',
  'text-lime-500',
  'text-orange-500',
  'text-blue-500',
  'text-emerald-500',
  'text-yellow-500',
  'text-cyan-500',
  'text-lightBlue-500',
  'text-indigo-500',
  'text-violet-500',
  'text-purple-500',
  'text-fuchsia-500',
  'text-pink-500',
  'text-rose-500'
]

type Message = {
  id: string
  from: string
  text: string
}

export default function Crdt() {
  const [roomName, setRoomName] = useState<string>(rooms[0])
  const [status, setStatus] = useState<'offline' | 'connected'>('offline')
  const [address, setAddress] = useState<string>('')
  const [participants, setParticipants] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!address || !roomName) {
      return
    }
    const url = `wss://collaborative-editor-server.decentraland.zone/iws/${roomName}?address=${address}`
    // const url = `ws://localhost:5001/iws/${roomName}?address=${address}`
    console.log('Connecting to server', url)
    const socket = new WebSocket(url)
    socket.addEventListener('close', (event) => {
      console.log('Error', event)
      setStatus('offline')
      setAddress('')
      setParticipants([])
      setMessages([])
    })
    socket.addEventListener('open', (_event) => {
      console.log('Connection established')
      setParticipants((prev) => [...prev, address])
      setStatus('connected')
    })

    socket.addEventListener('message', async (event: MessageEvent) => {
      const newVar = await event.data.arrayBuffer()
      const [msgType, message] = decodeMessage(new Uint8Array(newVar))
      // console.log('Message type', msgType, message)
      const decoded = decodeJSON(message)
      switch (msgType) {
        case MessageType.Init:
          console.log('Init', decoded)
          setParticipants((prev) => [...Array.from(new Set([...prev, ...decoded.participants]))])
          break
        case MessageType.ParticipantJoined:
          console.log('ParticipantJoined', decoded)
          setParticipants((prev) => [...Array.from(new Set([...prev, decoded.participant]))])
          break
        case MessageType.ParticipantLeft:
          console.log('ParticipantLeft', decoded)
          setParticipants((prev) => [...prev.filter((p) => p !== decoded.participant)])
          break
        case MessageType.ParticipantSelectedEntity:
          console.log('ParticipantSelectedEntity', decoded)
          break
        case MessageType.ParticipantUnselectedEntity:
          console.log('ParticipantUnselectedEntity', decoded)
          break
        case MessageType.Crdt:
          console.log('Crdt', decoded)
          setMessages((prev) => [...prev, decoded])
          break
      }
    })

    const interval = setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        console.log('Socket is not open')
        return
      }
      const message: Message = {
        id: crypto.randomUUID(),
        from: address,
        text: `Hi at ${Date.now()}`
      }

      console.log('Sending message', message)
      const encoded = encoder.encode(JSON.stringify(message))
      socket.send(encodeMessage(MessageType.Crdt, encoded))
      setMessages((prev) => [...prev, message])
    }, 5_000)

    return () => {
      clearInterval(interval)
      socket.close()
    }
  }, [address, roomName])

  return (
    <div>
      {status === 'offline' && (
        <div className="flex justify-around gap-2  text-sm">
          <div>
            <label htmlFor="room" className="text-sm font-medium leading-6 text-gray-300">
              Room
            </label>
            <select
              id="room"
              name="room"
              className="rounded-md border-0 bg-indigo-600 p-1.5 font-mono text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm sm:leading-6"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            >
              {rooms.map((room) => (
                <option key={room} value={room} className="font-mono">
                  {room}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-300">Address</label>
            <div className="flex flex-wrap justify-items-center gap-2 text-sm">
              {addresses.map((addr: string) => (
                <button
                  key={addr}
                  className="h-8 rounded bg-indigo-600 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => setAddress(addr)}
                >
                  {printAddress(addr)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {status === 'connected' && (
        <div>
          <p>
            Connected to <span className="font-bold text-pink-400">{roomName}</span> as{' '}
            <span className="font-bold text-pink-400">{address}</span>
          </p>
          <button
            className="rounded bg-indigo-600 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => setAddress('')}
          >
            Disconnect
          </button>
        </div>
      )}

      <hr className="my-5" />
      {status === 'connected' && (
        <div className="w-full">
          <h1 className="text-4xl font-bold">CRDT</h1>
          <div className="gap-2 sm:flex">
            <div className="mt-5 w-56 border text-sm">
              <h2 className="text-center text-2xl font-bold">Participants</h2>
              <ul className="flex flex-col gap-2 p-2">
                {participants.map((p) => (
                  <li className={colors[participants.indexOf(p)]} key={p}>
                    {printAddress(p)} {p === address && <span> (me)</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 w-full border text-sm">
              <ul className="flex flex-col gap-2 p-2">
                {messages.map((message) => (
                  <li className={`${message.from === address ? 'text-right' : 'text-left'}`} key={message.id}>
                    <span className={'text-xs ' + colors[participants.indexOf(message.from)]}>
                      {printAddress(message.from)}
                    </span>
                    {'> '}
                    <span className={'text-base ' + colors[participants.indexOf(message.from)]}>{message.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
