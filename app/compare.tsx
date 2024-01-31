'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const problematicEntityIds: string[] = [
  'bafkreiarkmiqdnx7sydzf27gprlt6cxxpwy2373c4rklwe4nlrzlmbgs7a',
  'bafkreieffhchjewsaenctrkgfk46lg3qaff3vh7bf5ou6fxdn47uwidwm4',
  'bafkreibmgy4rlpt6xrmsd7rrbx77m7hfofqi5qzwmmy7emfecejsrhgec4',
  'bafkreibkjtgz3s7golypk5xx2md7ewfo3agh47e2yp5b2hnmnftshder3u',
  'bafkreig3ic7lmodoydmm6pobzqkfvltvu6a4tvokod77tecbrmjsxszxna',
  'bafkreihud7x7cackcwcclmubxcqheyrcqteqrpdqxwjxjogq6z5kf54254',
  'bafkreihrivpeyizwgtzj7z3uniucn3f5ukvpfuqqg4lme57aevemo3dmg4',
  'bafkreigqdzstqdyot6ygv26a4qfucynmpng7hggbabtc7hmir4wp7kfmoa',
  'bafkreihon64r73t7syahsgr7elf7kxfzb5ys6kxgsucjwetuvs7zdfvvje',
  'bafkreif3rpvon6nfd2tvgo57u225snkfneupghpwcswsg7j6lfjxe2afnu',
  'bafkreiak3gcqpjbcblelpoanxwfaclejhtf4y54y3kk7ngfhishxcrfh5u',
  'bafkreid3pq53yjb3acbkqmsbk4eknnphapdpa344d7ng46dlnctxmmgkru',
  'bafkreidaqbxrgb2oljddyzizhaqddq7j42dbyfqxv6hdfd6wkrtla5tbei', // Se ven los ojos a través de la máscara
  'bafkreihmn6teertrob5praqvtkc6hall63gqvpqd3numjzuylyywzmekpm'
]

const catalystBaseUrl = 'https://peer.decentraland.org'
const cdnBaseUrl = 'https://profile-images-bucket-43d0c58.decentraland.org/v1/entities'

type EntityData = {
  id: string
  address: string
  body: string | undefined
  face: string | undefined
  raw: any
}

function uniqBy<T>(a: T[], key: (item: any) => string) {
  const seen: Record<string, boolean> = {}
  return a.filter(function (item) {
    const k = key(item)
    return seen.hasOwnProperty(k) ? false : (seen[k] = true)
  })
}

export default function Compare() {
  const [editingEntities, setEditingEntities] = useState<string[]>([])
  const [entities, setEntities] = useState<EntityData[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [slideOverOpen, setSlideOver] = useState<EntityData | null>(null)

  function loadProfiles(entityIds: string[] = []) {
    fetch(
      `${catalystBaseUrl}/content/deployments?` +
        new URLSearchParams([
          ['entityType', 'profile'],
          ['from', '1706497200000'],
          ['to', `${Date.now() - 2 * 60 * 1000}`],
          ['limit', '50'],
          ...entityIds.map((entityId) => ['entityId', entityId])
        ])
    )
      .then((response) => response.json())
      .then(
        (data): Promise<EntityData[]> =>
          data.deployments.map((entity: any) => ({
            id: entity.entityId,
            address: entity.pointers[0],
            body: entity.metadata.avatars[0].avatar.snapshots.body,
            face: entity.metadata.avatars[0].avatar.snapshots.face256,
            raw: entity
          }))
      )
      .then((data) => setEntities(uniqBy(data, (a: EntityData) => a.id)))
      .catch(console.error)
  }

  useEffect(() => {
    loadProfiles(problematicEntityIds)
  }, [])

  return (
    <div className="bg-white">
      <h1 className="text-center text-4xl font-bold text-gray-600 my-4">Compare images</h1>
      <div className="flex justify-between">
        <div className="m-2 text-gray-500">
          Displaying {entities.length} profiles of {entities.length}
        </div>
        <div className="flex justify-between gap-2">
          <button
            className="h-8 rounded bg-indigo-600 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => loadProfiles()}
          >
            Recent deployments
          </button>
          <button
            className="h-8 rounded bg-indigo-600 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => loadProfiles(problematicEntityIds)}
          >
            Profiles with issues
          </button>
          <button
            className="h-8 rounded bg-indigo-600 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => {
              setEditingEntities(entities.map((e) => e.id))
              setIsDialogOpen(!isDialogOpen)
            }}
          >
            Specific profiles
          </button>
        </div>
      </div>

      {/* Form Dialog */}
      <Transition.Root show={isDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setIsDialogOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center">One entity id per line</div>
                    <div className="grid grid-cols-1">
                      <textarea
                        rows={10}
                        name="comment"
                        id="comment"
                        className="block w-full font-mono rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        defaultValue={entities.map((e) => e.id).join('\n')}
                        onChange={(e) => setEditingEntities(e.target.value.split('\n'))}
                      />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={() => {
                        loadProfiles(editingEntities)
                        setIsDialogOpen(false)
                      }}
                    >
                      Load set
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Slide over */}
      <Transition.Root show={slideOverOpen !== null} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setSlideOver(null)}>
          <div className="fixed inset-0" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Wearables
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => setSlideOver(null)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <div className="text-center mb-3">
                          <div className="overflow-hidden h-full w-full">
                            <img
                              className="object-cover border w-24 h-48"
                              src={`${catalystBaseUrl}/content/contents/${slideOverOpen?.body}`}
                              alt=""
                            />
                          </div>
                        </div>
                        <ol className="grid grid-cols-1 gap-1">
                          {slideOverOpen?.raw.metadata.avatars[0].avatar.wearables.map((wearable: string) => (
                            <li key={wearable} className="p-1 bg-white text-sm border">
                              {wearable}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="text-sm m-4">
        {entities.map((entityData) => (
          <div key={entityData.id} className="mt-6 grid gap-x-2 grid-cols-4 text-gray-500 border-2 p-2">
            <div className="col-span-4 text-xs text-center">
              <div>
                <span
                  className="text-indigo-600 hover:text-indigo-800 hover:cursor-pointer"
                  onClick={() => setSlideOver(entityData)}
                >
                  {' '}
                  {entityData.id}
                </span>
              </div>{' '}
              -{' '}
              <a
                href={`https://decentraland.org/profile/accounts/${entityData.address}`}
                target="_blank"
                className="text-indigo-600"
              >
                {entityData.address}
              </a>
            </div>

            <div className="col-span-1 text-xs text-center">Body (Catalyst)</div>
            <div className="col-span-1 text-xs text-center">Body (CDN)</div>
            <div className="col-span-1 text-xs text-center">Face (Catalyst)</div>
            <div className="col-span-1 text-xs text-center">Face (CDN)</div>

            <div className="col-span-1 text-center">
              <div className="overflow-hidden h-full w-full">
                <img
                  className="object-cover border"
                  src={`${catalystBaseUrl}/content/contents/${entityData.body}`}
                  alt=""
                />
              </div>
            </div>
            <div className="col-span-1 text-center">
              <div className="overflow-hidden h-full w-full">
                <img className="object-cover border" src={`${cdnBaseUrl}/${entityData.id}/body.png`} alt="" />
              </div>
            </div>
            <div className="col-span-1 text-center">
              <div className="overflow-hidden h-full w-full">
                <img
                  className="object-cover border"
                  src={`${catalystBaseUrl}/content/contents/${entityData.face}`}
                  alt=""
                />
              </div>
            </div>
            <div className="col-span-1 text-center">
              <div className="overflow-hidden h-full w-full">
                <img className="object-cover border" src={`${cdnBaseUrl}/${entityData.id}/face.png`} alt="" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
