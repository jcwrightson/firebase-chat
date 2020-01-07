import React, { useEffect, useState } from 'react'
import firebase from 'firebase'
import { firebaseConfig } from './firebase-config'

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

let myId
if (localStorage.getItem('chat-demo::myId')) {
  myId = localStorage.getItem('chat-demo::myId')
} else {
  myId = uuidv4()
  localStorage.setItem('chat-demo::myId', myId)
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
            body: doc.data().body,
            owner: doc.data().owner
          })
        })
        setFeed(messages)
        setTimeout(() => {
          window.scroll(
            0,
            (window.innerHeight || window.outerHeight) + 1000 // May not work on iPhone
          )
        }, 100)
      })
  }, [])

  const handleMsg = e => {
    setMsg(e.target.value)
  }

  const handleSend = () => {
    db.collection('feed').add({
      body: msg,
      owner: myId,
      created: firebase.firestore.FieldValue.serverTimestamp()
    })
    setMsg('')
  }

  const handleSave = e => {
    if (e.key === 'Enter') {
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
              className={`msg ${item.owner === myId ? 'mine' : ''}`}
              key={item.id}
            >
              {item.body}
            </div>
          ))}
      </div>
      <div className='row'>
        <input
          type='text'
          onChange={handleMsg}
          onKeyDown={handleSave}
          value={msg}
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
