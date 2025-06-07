'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [icerik, setIcerik] = useState({
    heroBaslik: '',
    heroAltBaslik: '',
    servisler: [
      {
        baslik: '',
        aciklama: '',
        ikonUrl: '/stage.svg'
      },
      {
        baslik: '',
        aciklama: '',
        ikonUrl: '/light.svg'
      },
      {
        baslik: '',
        aciklama: '',
        ikonUrl: '/sound.svg'
      }
    ],
    istatistikler: [
      {
        rakam: '',
        aciklama: ''
      },
      {
        rakam: '',
        aciklama: ''
      },
      {
        rakam: '',
        aciklama: ''
      }
    ]
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getIcerik = async () => {
      try {
        const response = await fetch('/api/admin/icerik')
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setIcerik(data)
          }
        }
      } catch (error) {
        console.error('İçerik yüklenemedi:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.isAdmin) {
      getIcerik()
    }
  }, [session])
  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.isAdmin)) {
      router.push('/')
    }
  }, [status, session, router])

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!icerik.heroBaslik.trim() || !icerik.heroAltBaslik.trim()) {
        alert('Hero başlık ve alt başlık zorunludur');
        return;
      }

      // Validate services
      if (!icerik.servisler.every(s => s.baslik.trim() && s.aciklama.trim())) {
        alert('Tüm servislerin başlık ve açıklamaları zorunludur');
        return;
      }

      // Validate statistics
      if (!icerik.istatistikler.every(i => i.rakam.trim() && i.aciklama.trim())) {
        alert('Tüm istatistiklerin rakam ve açıklamaları zorunludur');
        return;
      }

      // Prepare form data with trimmed values
      const formData = {
        heroBaslik: icerik.heroBaslik.trim(),
        heroAltBaslik: icerik.heroAltBaslik.trim(),
        servisler: icerik.servisler.map(servis => ({
          baslik: servis.baslik.trim(),
          aciklama: servis.aciklama.trim(),
          ikonUrl: servis.ikonUrl
        })),
        istatistikler: icerik.istatistikler.map(istatistik => ({
          rakam: istatistik.rakam.trim(),
          aciklama: istatistik.aciklama.trim()
        }))
      };

      const response = await fetch('/api/admin/icerik', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İçerik güncellenemedi');
      }

      // Update the local state with the server response
      setIcerik(data);
      alert('İçerik başarıyla güncellendi!');
      
    } catch (error) {
      console.error('İçerik güncellenemedi:', error);
      alert('İçerik güncellenirken bir hata oluştu: ' + error.message);
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className={styles.loading}>Yükleniyor...</div>
  }

  if (!session?.user?.isAdmin) {
    return <div className={styles.error}>Bu sayfaya erişim yetkiniz yok.</div>
  }

  return (
    <div className={styles.container}>
      <h1>Admin Panel</h1>
      
      <div className={styles.adminMenu}>
        <h2>Yönetim Menüsü</h2>
        <button 
          className={styles.menuButton}
          onClick={() => router.push('/admin/etkinlikler')}>
          Etkinlikleri Yönet
        </button>
        <button 
          className={styles.menuButton}
          onClick={() => router.push('/admin/iletisim')}>
          İletişim Bilgilerini Düzenle
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Ana Sayfa İçerik Yönetimi</h2>
        <section className={styles.section}>
          <h2>Hero Bölümü</h2>
          <div className={styles.formGroup}>
            <label htmlFor="heroBaslik">Ana Başlık</label>
            <input
              type="text"
              id="heroBaslik"
              value={icerik.heroBaslik}
              onChange={(e) => setIcerik({ ...icerik, heroBaslik: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="heroAltBaslik">Alt Başlık</label>
            <input
              type="text"
              id="heroAltBaslik"
              value={icerik.heroAltBaslik}
              onChange={(e) => setIcerik({ ...icerik, heroAltBaslik: e.target.value })}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Hizmetler</h2>
          {icerik.servisler.map((servis, index) => (
            <div key={index} className={styles.serviceItem}>
              <div className={styles.formGroup}>
                <label>Başlık</label>
                <input
                  type="text"
                  value={servis.baslik}
                  onChange={(e) => {
                    const yeniServisler = [...icerik.servisler]
                    yeniServisler[index].baslik = e.target.value
                    setIcerik({ ...icerik, servisler: yeniServisler })
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Açıklama</label>
                <textarea
                  value={servis.aciklama}
                  onChange={(e) => {
                    const yeniServisler = [...icerik.servisler]
                    yeniServisler[index].aciklama = e.target.value
                    setIcerik({ ...icerik, servisler: yeniServisler })
                  }}
                />
              </div>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2>İstatistikler</h2>
          {icerik.istatistikler.map((istatistik, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.formGroup}>
                <label>Rakam</label>
                <input
                  type="text"
                  value={istatistik.rakam}
                  onChange={(e) => {
                    const yeniIstatistikler = [...icerik.istatistikler]
                    yeniIstatistikler[index].rakam = e.target.value
                    setIcerik({ ...icerik, istatistikler: yeniIstatistikler })
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Açıklama</label>
                <input
                  type="text"
                  value={istatistik.aciklama}
                  onChange={(e) => {
                    const yeniIstatistikler = [...icerik.istatistikler]
                    yeniIstatistikler[index].aciklama = e.target.value
                    setIcerik({ ...icerik, istatistikler: yeniIstatistikler })
                  }}
                />
              </div>
            </div>
          ))}
        </section>

        <button type="submit" className={styles.submitButton}>
          Değişiklikleri Kaydet
        </button>
      </form>
    </div>
  )
}
