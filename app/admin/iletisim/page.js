'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function IletisimAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [iletisimBilgileri, setIletisimBilgileri] = useState({
    firmaAdi: '',
    hakkimizda: '',
    adres: '',
    telefon: '',
    email: '',
    calismaSaatleri: '',
    sosyalMedya: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchIletisimBilgileri = async () => {
      try {
        const response = await fetch('/api/iletisim');
        const data = await response.json();
        if (data && !data.error) {
          setIletisimBilgileri(data);
        }
      } catch (error) {
        console.error('İletişim bilgileri yüklenemedi:', error);
        setError('İletişim bilgileri yüklenemedi');
      }
    };

    fetchIletisimBilgileri();
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/iletisim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(iletisimBilgileri),
      });

      if (response.ok) {
        setMessage('İletişim bilgileri başarıyla güncellendi!');
        window.scrollTo(0, 0);
      } else {
        const data = await response.json();
        setError(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      setError('Güncelleme sırasında bir hata oluştu');
    }
  };

  if (status === 'loading') {
    return <div className={styles.container}>Yükleniyor...</div>;
  }

  if (!session?.user?.isAdmin) {
    return <div className={styles.container}>Bu sayfaya erişim yetkiniz yok.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>İletişim Bilgileri Yönetimi</h1>
      
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="firmaAdi">Firma Adı</label>
          <input
            type="text"
            id="firmaAdi"
            value={iletisimBilgileri.firmaAdi}
            onChange={(e) => setIletisimBilgileri({
              ...iletisimBilgileri,
              firmaAdi: e.target.value
            })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="hakkimizda">Hakkımızda</label>
          <textarea
            id="hakkimizda"
            value={iletisimBilgileri.hakkimizda}
            onChange={(e) => setIletisimBilgileri({
              ...iletisimBilgileri,
              hakkimizda: e.target.value
            })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="adres">Adres</label>
          <textarea
            id="adres"
            value={iletisimBilgileri.adres}
            onChange={(e) => setIletisimBilgileri({
              ...iletisimBilgileri,
              adres: e.target.value
            })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="telefon">Telefon</label>
          <input
            type="tel"
            id="telefon"
            value={iletisimBilgileri.telefon}
            onChange={(e) => setIletisimBilgileri({
              ...iletisimBilgileri,
              telefon: e.target.value
            })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">E-posta</label>
          <input
            type="email"
            id="email"
            value={iletisimBilgileri.email}
            onChange={(e) => setIletisimBilgileri({
              ...iletisimBilgileri,
              email: e.target.value
            })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="calismaSaatleri">Çalışma Saatleri</label>
          <input
            type="text"
            id="calismaSaatleri"
            value={iletisimBilgileri.calismaSaatleri}
            onChange={(e) => setIletisimBilgileri({
              ...iletisimBilgileri,
              calismaSaatleri: e.target.value
            })}
            required
          />
        </div>

        <div className={styles.sosyalMedyaGrup}>
          <h3>Sosyal Medya Bağlantıları</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="facebook">Facebook</label>
            <input
              type="url"
              id="facebook"
              value={iletisimBilgileri.sosyalMedya?.facebook || ''}
              onChange={(e) => setIletisimBilgileri({
                ...iletisimBilgileri,
                sosyalMedya: {
                  ...iletisimBilgileri.sosyalMedya,
                  facebook: e.target.value
                }
              })}
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="instagram">Instagram</label>
            <input
              type="url"
              id="instagram"
              value={iletisimBilgileri.sosyalMedya?.instagram || ''}
              onChange={(e) => setIletisimBilgileri({
                ...iletisimBilgileri,
                sosyalMedya: {
                  ...iletisimBilgileri.sosyalMedya,
                  instagram: e.target.value
                }
              })}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="twitter">Twitter</label>
            <input
              type="url"
              id="twitter"
              value={iletisimBilgileri.sosyalMedya?.twitter || ''}
              onChange={(e) => setIletisimBilgileri({
                ...iletisimBilgileri,
                sosyalMedya: {
                  ...iletisimBilgileri.sosyalMedya,
                  twitter: e.target.value
                }
              })}
              placeholder="https://twitter.com/..."
            />
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Değişiklikleri Kaydet
        </button>
      </form>
    </div>
  );
}
