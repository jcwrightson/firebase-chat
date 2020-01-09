import React, { useEffect, useState } from 'react'
import firebase from 'firebase'
import { firebaseConfig } from './firebase-config'
import moment from 'moment'
import './App.css'

const fb = firebase.initializeApp(firebaseConfig)
const db = fb.firestore()

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  )
}

const names = [
  'L. Hamilton',
  'C. Leclerc',
  'S. Perez',
  'M. Verstappen',
  'V. Bottas',
  'S. Vettel',
  'A. Albon',
  'L. Norris',
  'K. Magnussen',
  'G. Russell',
  'L. Stroll',
  'K. Raikkonen'
]

let myId
if (localStorage.getItem('chat-demo::myId')) {
  myId = localStorage.getItem('chat-demo::myId')
} else {
  myId = uuidv4()
  localStorage.setItem('chat-demo::myId', myId)
}

let myName
if (localStorage.getItem('chat-demo::myName')) {
  myName = localStorage.getItem('chat-demo::myName')
} else {
  myName = names[Math.floor(Math.random() * names.length)]
  localStorage.setItem('chat-demo::myName', myName)
}

const App = () => {
  const [msg, setMsg] = useState('')
  const [feed, setFeed] = useState([])
  useEffect(() => {
    db.collection('feed')
      .orderBy('created', 'asc')
      .onSnapshot(snapShot => {
        const messages = []
        snapShot.forEach(doc => {
          messages.push({
            id: doc.id,
            ...doc.data()
          })
        })
        setFeed(messages)
        setTimeout(() => {
          window.scroll(
            0,
            (window.innerHeight || window.outerHeight) +
              document.body.scrollHeight // May not work on iPhone
          )
        }, 100)
      })
  }, [])

  const handleMsg = e => {
    setMsg(e.target.value)
  }

  const handleSend = () => {
    if (msg) {
      db.collection('feed').add({
        body: msg,
        uuid: myId,
        name: myName,
        created: firebase.firestore.FieldValue.serverTimestamp()
      })
      setMsg('')
    }
  }

  const handleSave = e => {
    if (e.key === 'Enter' && msg) {
      handleSend()
    }
  }

  return (
    <div className='App'>
      <div className='feed'>
        {feed &&
          Boolean(feed.length) &&
          feed.map(item => (
            <div
              className={`msg ${item.uuid === myId ? 'mine' : ''}`}
              key={item.id}
            >
              {item.uuid !== myId && <label>{item.name}</label>}
              {item.body}
              {item.created && (
                <label className='timestamp'>
                  {moment(item.created.toDate()).format('H:mm')}
                </label>
              )}
            </div>
          ))}
      </div>
      <div className='row'>
        <input
          type='text'
          onChange={handleMsg}
          onKeyDown={handleSave}
          value={msg}
          placeholder={myName}
        ></input>
        <button
          onClick={() => {
            handleSend()
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default App
