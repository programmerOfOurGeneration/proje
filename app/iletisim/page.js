'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function IletisimPage() {
  const [iletisimBilgileri, setIletisimBilgileri] = useState({
    firmaAdi: 'StageDesign',
    hakkimizda: 'Yükleniyor...',
    adres: 'Yükleniyor...',
    telefon: 'Yükleniyor...',
    email: 'Yükleniyor...',
    calismaSaatleri: 'Yükleniyor...',
    sosyalMedya: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  useEffect(() => {
    const fetchIletisimBilgileri = async () => {
      try {
        const response = await fetch('/api/iletisim');
        const data = await response.json();
        if (data && !data.error) {
          setIletisimBilgileri(data);
        }
      } catch (error) {
        console.error('İletişim bilgileri yüklenemedi:', error);
      }
    };

    fetchIletisimBilgileri();
  }, []);

  return (
    <div className={styles.container}>
      <section className={styles.hakkimizda}>
        <h1>{iletisimBilgileri.firmaAdi}</h1>
        <p>{iletisimBilgileri.hakkimizda}</p>
      </section>

      <section className={styles.iletisimBilgileri}>
        <div className={styles.bilgiKart}>
          <h3>Adres</h3>
          <p>{iletisimBilgileri.adres}</p>
        </div>

        <div className={styles.bilgiKart}>
          <h3>İletişim</h3>
          <p>Tel: {iletisimBilgileri.telefon}</p>
          <p>E-posta: {iletisimBilgileri.email}</p>
        </div>

        <div className={styles.bilgiKart}>
          <h3>Çalışma Saatleri</h3>
          <p>{iletisimBilgileri.calismaSaatleri}</p>
        </div>
      </section>

      <section className={styles.sosyalMedya}>
        <h3>Bizi Sosyal Medyada Takip Edin</h3>
        <div className={styles.sosyalIkonlar}>
          {iletisimBilgileri.sosyalMedya?.facebook && (
            <a href={iletisimBilgileri.sosyalMedya.facebook} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          )}
          {iletisimBilgileri.sosyalMedya?.instagram && (
            <a href={iletisimBilgileri.sosyalMedya.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
          {iletisimBilgileri.sosyalMedya?.twitter && (
            <a href={iletisimBilgileri.sosyalMedya.twitter} target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
