'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Image from 'next/image'
import GrupSohbet from '../components/GrupSohbet'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [adminler, setAdminler] = useState([])
  const [seciliKullanici, setSeciliKullanici] = useState(null)
  const [seciliGrup, setSeciliGrup] = useState(null)
  const [mesajlar, setMesajlar] = useState([])
  const [yeniMesaj, setYeniMesaj] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [chatType, setChatType] = useState('bireysel') // 'bireysel' veya 'grup'

  // Adminleri getir
  useEffect(() => {
    const getAdminler = async () => {
      try {
        const response = await fetch('/api/ozel-mesaj')
        if (response.ok) {
          const data = await response.json()
          setAdminler(data)
        }
      } catch (error) {
        console.error('Adminler yüklenemedi:', error)
        setError('Adminler yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      getAdminler()
    }
  }, [session])

  // Mesajları getir
  useEffect(() => {
    const getMesajlar = async () => {
      if (chatType === 'bireysel' && !seciliKullanici) return
      if (chatType === 'grup' && !seciliGrup) return

      try {
        const url = chatType === 'bireysel' 
          ? `/api/ozel-mesaj/${seciliKullanici.id}`
          : `/api/grup-sohbet/${seciliGrup.id}`
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setMesajlar(chatType === 'grup' ? data.mesajlar : data)
        }
      } catch (error) {
        console.error('Mesajlar yüklenemedi:', error)
        setError('Mesajlar yüklenemedi')
      }
    }

    getMesajlar()
    // Mesajları periyodik olarak güncelle
    const interval = setInterval(getMesajlar, 5000)
    return () => clearInterval(interval)
  }, [chatType, seciliKullanici, seciliGrup])

  const handleMesajGonder = async (e) => {
    e.preventDefault()
    if (!yeniMesaj.trim()) return
    if ((chatType === 'bireysel' && !seciliKullanici) || 
        (chatType === 'grup' && !seciliGrup)) return

    try {
      const url = chatType === 'bireysel' ? '/api/ozel-mesaj' : `/api/grup-sohbet/${seciliGrup.id}`
      const body = chatType === 'bireysel' 
        ? { aliciId: seciliKullanici.id, icerik: yeniMesaj }
        : { icerik: yeniMesaj }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const yeniMesajData = await response.json()
        setMesajlar(prev => [...prev, yeniMesajData])
        setYeniMesaj('')
      } else {
        const error = await response.json()
        setError(error.error || 'Mesaj gönderilemedi')
      }
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error)
      setError('Mesaj gönderilemedi')
    }
  }

  if (status === 'loading' || loading) {
    return <div className={styles.loading}>Yükleniyor...</div>
  }

  if (!session) {
    return (
      <div className={styles.container}>
        <p>Sohbet etmek için lütfen giriş yapın.</p>
      </div>
    )
  }
  const handleGrupSecimi = (grup) => {
    setSeciliGrup(grup)
    setSeciliKullanici(null)
    setChatType('grup')
  }

  const handleKullaniciSecimi = (kullanici) => {
    setSeciliKullanici(kullanici)
    setSeciliGrup(null)
    setChatType('bireysel')
  }

  const currentChat = chatType === 'bireysel' ? seciliKullanici : seciliGrup

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.chatTypeSelector}>
          <button
            className={`${styles.typeButton} ${chatType === 'bireysel' ? styles.active : ''}`}
            onClick={() => setChatType('bireysel')}
          >
            Bireysel Sohbet
          </button>
          <button
            className={`${styles.typeButton} ${chatType === 'grup' ? styles.active : ''}`}
            onClick={() => setChatType('grup')}
          >
            Grup Sohbet
          </button>
        </div>

        {chatType === 'bireysel' ? (
          <div>
            <h3>Bireysel Sohbet</h3>
            <div className={styles.adminList}>
              {adminler.map((admin) => (
                <div
                  key={admin.id}
                  className={`${styles.adminItem} ${seciliKullanici?.id === admin.id ? styles.active : ''}`}
                  onClick={() => handleKullaniciSecimi(admin)}
                >
                  {admin.resim ? (
                    <Image
                      src={admin.resim}
                      alt={admin.isim}
                      width={40}
                      height={40}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}></div>
                  )}
                  <div className={styles.adminInfo}>
                    <span className={styles.adminName}>{admin.isim}</span>
                    <span className={styles.userRole}>
                      {admin.isAdmin ? 'Admin' : 'Kullanıcı'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <GrupSohbet onGrupSecimi={handleGrupSecimi} />
        )}
      </div>

      <div className={styles.chatArea}>
        {currentChat ? (
          <>
            <div className={styles.chatHeader}>
              <h3>
                {chatType === 'bireysel' 
                  ? `Sohbet: ${currentChat.isim}`
                  : `Grup: ${currentChat.isim}`
                }
              </h3>
            </div>
            <div className={styles.messages}>
              {mesajlar.map((mesaj) => (
                <div
                  key={mesaj.id}
                  className={`${styles.message} ${
                    mesaj.gonderenId === session?.user?.id ? styles.outgoing : styles.incoming
                  }`}
                >
                  <div className={styles.messageSender}>
                    {mesaj.gonderen.isim}
                  </div>
                  <div className={styles.messageContent}>
                    <p>{mesaj.icerik}</p>
                    <span className={styles.messageTime}>
                      {new Date(mesaj.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleMesajGonder} className={styles.messageForm}>
              <input
                type="text"
                value={yeniMesaj}
                onChange={(e) => setYeniMesaj(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className={styles.messageInput}
              />
              <button type="submit" className={styles.sendButton}>
                Gönder
              </button>
            </form>
          </>
        ) : (
          <div className={styles.noChatSelected}>
            <p>
              {chatType === 'bireysel' 
                ? 'Sohbet başlatmak için bir kullanıcı seçin'
                : 'Sohbet başlatmak için bir grup seçin'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
