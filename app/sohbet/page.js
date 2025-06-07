'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import styles from './page.module.css'

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !session) return

    try {
      const response = await fetch('/api/sohbet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          email: session.user.email,
        }),
      })

      if (response.ok) {
        setNewMessage('')
        // Mesajları yenile
        fetchMessages()
      }
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/sohbet')
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!session) {
    return (
      <div className={styles.container}>
        <p>Sohbet etmek için lütfen Gmail ile giriş yapın.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div key={msg.id} className={styles.message}>
            <img src={msg.kullanici.resim} alt="" className={styles.avatar} />
            <div>
              <p className={styles.name}>{msg.kullanici.isim}</p>
              <p>{msg.icerik}</p>
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={sendMessage} className={styles.form}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Mesajınızı yazın..."
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Gönder
        </button>
      </form>
    </div>
  )
}
