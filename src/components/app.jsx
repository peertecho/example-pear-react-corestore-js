/* global alert */
import { useState } from 'react'
import b4a from 'b4a'

import { createStoreWriter, createStoreReader } from '../lib/store'

export default function App () {
  const [cores, setCores] = useState({})
  const [message, setMessage] = useState('')

  const [inputCoreKey, setInputCoreKey] = useState('')
  const [status, setStatus] = useState('')
  const [messsages, setMessages] = useState([])

  const { core1, core2, core3 } = cores
  const coreKey = core1 ? b4a.toString(core1.key, 'hex') : ''
  const append = (data) => {
    if (data.length > 5) core2?.append(data)
    else core3?.append(data)
  }

  const onStartWriter = async () => {
    const cores = await createStoreWriter()
    setCores(cores)
  }

  const onStartReader = async () => {
    if (!inputCoreKey) {
      alert('Please enter a core key')
      return
    }
    setStatus('starting...')
    await createStoreReader({
      coreKeyWriter: inputCoreKey,
      onData: (data) => {
        setMessages((msgs) => [...msgs, {
          ...data,
          block: b4a.toString(data.block, 'utf8')
        }])
      }
    })
    setStatus('started')
  }

  return (
    <div style={{ padding: 10, background: 'cyan' }}>
      <h1>MyApp</h1>

      <h2>Writer</h2>
      <button onClick={onStartWriter}>Start writer</button>
      <p>Core key: {coreKey}</p>

      <h3>Send message</h3>
      <div>
        <textarea type='text' value={message} onChange={(evt) => setMessage(evt.currentTarget.value)} />
      </div>
      <button onClick={() => append(message)}>Send</button>

      <hr />

      <h2>Reader</h2>
      <div>
        <textarea type='text' value={inputCoreKey} onChange={(evt) => setInputCoreKey(evt.currentTarget.value)} />
      </div>
      <button onClick={onStartReader}>Start reader</button>
      <p>Status: {status}</p>

      <h3>Receive message</h3>
      {messsages.map((msg, idx) => (
        <p key={idx}>
          {msg.key} - {msg.seq} - {msg.block}
        </p>
      ))}
    </div>
  )
}
