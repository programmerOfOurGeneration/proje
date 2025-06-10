'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import styles from '../sohbet/page.module.css'

export default function GrupSohbet({ onGrupSecimi }) {
  const { data: session } = useSession()
  const [gruplar, setGruplar] = useState([])
  const [yeniGrupAdi, setYeniGrupAdi] = useState('')
  const [yeniGrupAciklama, setYeniGrupAciklama] = useState('')
  const [seciliUyeler, setSeciliUyeler] = useState([])
  const [kullanicilar, setKullanicilar] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingKullanicilar, setLoadingKullanicilar] = useState(true)

  // Grupları getir
  useEffect(() => {
    const getGruplar = async () => {
      try {
        const response = await fetch('/api/grup-sohbet')
        if (response.ok) {
          const data = await response.json()
          setGruplar(data)
        }
      } catch (error) {
        console.error('Gruplar yüklenemedi:', error)
        setError('Gruplar yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      getGruplar()
    }
  }, [session])  // Kullanıcıları getir (admin için)
  useEffect(() => {
    const getKullanicilar = async () => {
      if (!session?.user?.email) {
        setLoadingKullanicilar(false)
        return
      }
      
      try {
        setLoadingKullanicilar(true)
        const response = await fetch('/api/ozel-mesaj')
        if (response.ok) {
          const data = await response.json()
          setKullanicilar(data || [])
        }
      } catch (error) {
        console.error('Kullanıcılar yüklenemedi:', error)
        setError('Kullanıcılar yüklenemedi')
      } finally {
        setLoadingKullanicilar(false)
      }
    }

    getKullanicilar()
  }, [session])

  const handleGrupOlustur = async (e) => {
    e.preventDefault()
    if (!yeniGrupAdi.trim()) return

    try {
      const response = await fetch('/api/grup-sohbet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isim: yeniGrupAdi,
          aciklama: yeniGrupAciklama,
          uyeIdleri: seciliUyeler
        }),
      })

      if (response.ok) {
        const yeniGrup = await response.json()
        setGruplar(prev => [...prev, yeniGrup])
        setYeniGrupAdi('')
        setYeniGrupAciklama('')
        setSeciliUyeler([])
      } else {
        const error = await response.json()
        setError(error.error || 'Grup oluşturulamadı')
      }
    } catch (error) {
      console.error('Grup oluşturulamadı:', error)
      setError('Grup oluşturulamadı')
    }
  }

  if (loading) {
    return <div className={styles.loading}>Yükleniyor...</div>
  }

  return (
    <div>
      <h3>Grup Sohbetleri</h3>
      <div className={styles.grupList}>
        {gruplar.map(grup => (
          <div
            key={grup.id}
            className={styles.grupItem}
            onClick={() => onGrupSecimi(grup)}
          >
            <div className={styles.grupInfo}>
              <span className={styles.grupName}>{grup.isim}</span>
              <span className={styles.grupDesc}>{grup.aciklama}</span>
            </div>
          </div>
        ))}
      </div>      {session?.user?.isAdmin && (
        <form onSubmit={handleGrupOlustur} className={styles.grupForm}>
          <h4>Yeni Grup Oluştur</h4>
          <input
            type="text"
            value={yeniGrupAdi}
            onChange={(e) => setYeniGrupAdi(e.target.value)}
            placeholder="Grup adı"
            className={styles.grupInput}
          />
          <textarea
            value={yeniGrupAciklama}
            onChange={(e) => setYeniGrupAciklama(e.target.value)}
            placeholder="Grup açıklaması"
            className={styles.grupInput}
          />
          <div className={styles.uyeSecimi}>
            <h5>Üyeleri Seç</h5>
            {loadingKullanicilar ? (
              <div className={styles.loading}>Kullanıcılar yükleniyor...</div>
            ) : kullanicilar && kullanicilar.length > 0 ? (
              kullanicilar.map(kullanici => (
              <label key={kullanici.id} className={styles.uyeCheckbox}>
                <input
                  type="checkbox"
                  checked={seciliUyeler.includes(kullanici.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSeciliUyeler(prev => [...prev, kullanici.id])
                    } else {
                      setSeciliUyeler(prev => prev.filter(id => id !== kullanici.id))
                    }
                  }}
                />
                {kullanici.isim}              </label>
            ))) : (
              <div className={styles.message}>Henüz kullanıcı bulunmuyor.</div>
            )}
          </div>
          <button 
            type="submit" 
            className={styles.createButton}
            disabled={!yeniGrupAdi.trim() || loadingKullanicilar || seciliUyeler.length === 0}
          >
            {loadingKullanicilar ? 'Yükleniyor...' : 'Grup Oluştur'}
          </button>
        </form>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
