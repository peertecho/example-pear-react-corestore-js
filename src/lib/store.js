/* global Pear */
/** @typedef {import('pear-interface')} */

import path from 'path'
import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import b4a from 'b4a'

const { updates, reload, teardown } = Pear

updates(() => reload())

const swarm = new Hyperswarm()
teardown(() => swarm.destroy())

export async function createStoreWriter ({ name = 'writer' } = {}) {
  console.log('starting writer')
  const store = new Corestore(path.join(Pear.config.storage, name))
  await store.ready()
  swarm.on('connection', (conn) => store.replicate(conn))

  const core1 = store.get({ name: 'core-1', valueEncoding: 'json' })
  const core2 = store.get({ name: 'core-2' })
  const core3 = store.get({ name: 'core-3' })
  await Promise.all([core1.ready(), core2.ready(), core3.ready()])

  console.log('joining', b4a.toString(core1.discoveryKey, 'hex'))
  swarm.join(core1.discoveryKey)

  console.log('appending', core1.length)
  if (core1.length === 0) {
    await core1.append({
      otherKeys: [core2, core3].map((core) => b4a.toString(core.key, 'hex'))
    })
  }

  return { core1, core2, core3 }
}

export async function createStoreReader ({ name = 'reader', coreKeyWriter, onData } = {}) {
  console.log('starting reader', coreKeyWriter)
  const store = new Corestore(path.join(Pear.config.storage, name))
  await store.ready()
  swarm.on('connection', (conn) => store.replicate(conn))

  const core1 = store.get({ key: coreKeyWriter, valueEncoding: 'json' })
  await core1.ready()

  console.log('joining', b4a.toString(core1.discoveryKey, 'hex'))
  const foundPeers = core1.findingPeers()
  swarm.join(core1.discoveryKey)
  swarm.flush().then(() => foundPeers())

  console.log('updating')
  await core1.update()

  if (core1.length === 0) {
    throw new Error('Could not connect to the writer peer')
  }

  const { otherKeys } = await core1.get(0)
  for (const key of otherKeys) {
    console.log('reading', key)
    const core = store.get({ key: b4a.from(key, 'hex') })
    core.on('append', () => {
      const seq = core.length - 1
      core.get(seq).then(block => {
        onData({ key, seq, block })
      })
    })
  }
}
