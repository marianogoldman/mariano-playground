'use client'

import { useEffect, useState } from 'react'

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

const catalystBaseUrl = 'https://peer-ec2.decentraland.org'
const cdnBaseUrl = 'https://profile-images-bucket-43d0c58.decentraland.org/v1/entities'

type EntityData = {
  id: string
  address: string
  body: string | undefined
  face: string | undefined
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printEntityId(entityId: string): string {
  return entityId.slice(0, 10) + '...' + entityId.slice(-10)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printAddress(address: string): string {
  return address.slice(0, 7) + '...' + address.slice(-5)
}

function uniqBy<T>(a: T[], key: (item: any) => string) {
  const seen: Record<string, boolean> = {}
  return a.filter(function (item) {
    const k = key(item)
    return seen.hasOwnProperty(k) ? false : (seen[k] = true)
  })
}

async function fetchProfiles(entityIds: string[]): Promise<EntityData[]> {
  console.log('fetching profiles', entityIds)
  return fetch(
    `${catalystBaseUrl}/content/deployments?` +
      new URLSearchParams([
        ['entityType', 'profile'],
        ['from', '1706497200000'],
        ...entityIds.map((entityId) => ['entityId', entityId])
      ])
  )
    .then((response) => response.json())
    .then((data) =>
      data.deployments.map((entity: any) => ({
        id: entity.entityId,
        address: entity.pointers[0],
        body: entity.metadata.avatars[0].avatar.snapshots.body,
        face: entity.metadata.avatars[0].avatar.snapshots.face256
      }))
    )
    .catch((err) => {
      console.error(err)
      return []
    })
}

export default function Compare() {
  const [initialEntities, setInitialEntities] = useState<string[]>(problematicEntityIds)
  const [editingEntities, setEditingEntities] = useState<string[]>(problematicEntityIds)
  const [count, setCount] = useState<number>(10)
  const [entities, setEntities] = useState<EntityData[]>([])
  const [openBox, setOpenBox] = useState<boolean>(false)

  function loadRecentProfiles() {
    fetch(`${catalystBaseUrl}/content/deployments?entityType=profile&from=1706497200000`)
      .then((response) => response.json())
      .then((data) =>
        loadProfilesIds(
          uniqBy(
            data.deployments.map((deployment: any) => deployment.entityId),
            (a: string) => a
          )
        )
      )
      .catch(console.error)
  }

  function loadProfilesIds(entityIds: string[]) {
    setInitialEntities(uniqBy(entityIds, (a: string) => a))
    setEntities([])
    setCount(10)
  }

  useEffect(() => {
    fetchProfiles(initialEntities.slice(count - 10, count))
      .then((data) => {
        console.log('fetched profiles', data)
        setEntities((entities) => uniqBy([...entities, ...data], (a: EntityData) => a.id))
      })
      .catch(console.error)
  }, [initialEntities, count])

  return (
    <div className="bg-white">
      <h1 className="text-center text-4xl font-bold text-gray-600 my-4">Compare images</h1>
      <div className="flex justify-between">
        <div className="m-2 text-gray-500">
          Displaying {entities.length} profiles of {count}
        </div>
        <div className="flex justify-between gap-2">
          <button
            className="h-8 rounded bg-indigo-600 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => loadRecentProfiles()}
          >
            Recent deployments
          </button>
          <button
            className="h-8 rounded bg-indigo-600 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => loadProfilesIds(problematicEntityIds)}
          >
            Profiles with issues
          </button>
          <button
            className="h-8 rounded bg-indigo-600 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => {
              setEditingEntities(initialEntities)
              setOpenBox(!openBox)
            }}
          >
            Specific profiles
          </button>
        </div>
      </div>
      {openBox && (
        <div className="grid grid-cols-1">
          <textarea
            rows={10}
            name="comment"
            id="comment"
            className="block w-full font-mono rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue={initialEntities.join('\n')}
            onChange={(e) => setEditingEntities(e.target.value.split('\n'))}
          />
          <div className="text-center m-2">
            <button
              className="h-8 rounded bg-indigo-600 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => {
                setInitialEntities(editingEntities)
                setEntities([])
                setCount(10)
                setOpenBox(false)
              }}
            >
              Load set
            </button>
          </div>
        </div>
      )}

      <div className="text-sm m-4">
        {entities.map((entityData) => (
          <div key={entityData.id} className="mt-6 grid gap-x-2 grid-cols-4 text-gray-500 border-2 p-2">
            <div className="col-span-4 text-xs text-center">
              {entityData.id} -{' '}
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
      <div className="text-center">
        {count < initialEntities.length && (
          <button
            className="h-8 rounded bg-indigo-600 px-2 py-1 font-mono text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => {
              setCount((count) => count + 10)
            }}
          >
            Load more
          </button>
        )}
      </div>
    </div>
  )
}
