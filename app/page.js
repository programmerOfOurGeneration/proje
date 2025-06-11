'use client'
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [icerik, setIcerik] = useState({
    heroBaslik: "Hayallerinizi Sahneliyoruz",
    heroAltBaslik: "Profesyonel sahne tasarımı ve teknik prodüksiyon hizmetleri",
    servisler: [
      {
        baslik: "Sahne Tasarımı",
        aciklama: "Konser, tiyatro ve özel etkinlikler için yaratıcı sahne tasarımları",
        ikonUrl: "/stage.svg"
      },
      {
        baslik: "Işık Sistemleri",
        aciklama: "Modern ışık teknolojileri ile profesyonel aydınlatma çözümleri",
        ikonUrl: "/light.svg"
      },
      {
        baslik: "Ses Sistemleri",
        aciklama: "Yüksek kaliteli ses sistemleri ve akustik tasarım",
        ikonUrl: "/sound.svg"
      }
    ],
    istatistikler: [
      {
        rakam: "500+",
        aciklama: "Tamamlanan Proje"
      },
      {
        rakam: "50+",
        aciklama: "Uzman Ekip"
      },
      {
        rakam: "15+",
        aciklama: "Yıllık Deneyim"
      }
    ]
  });

  useEffect(() => {
    const getIcerik = async () => {
      try {
        const response = await fetch('/api/admin/icerik');
        const data = await response.json();
        if (data && !data.error) {
          setIcerik(data);
        }
      } catch (error) {
        console.error('İçerik yüklenemedi:', error);
      }
    };

    getIcerik();
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            Onpases
          </Link>
          <div className={styles.navLinks}>
            <Link href="/">Ana Sayfa</Link>
            <Link href="/etkinlikler">Projelerimiz</Link>
            <Link href="/iletisim">İletişim</Link>
            {status === 'loading' ? (
              <div className={styles.loadingDot}></div>
            ) : session?.user ? (
              <>
                {session.user.isAdmin && (
                  <Link href="/admin" className={styles.adminLink}>
                    Admin Panel
                  </Link>
                )}
                <Link href="/sohbet" className={styles.accountLink}>
                  Sohbet
                </Link>
                <button onClick={handleSignOut} className={styles.signOutButton}>
                  Çıkış Yap
                </button>
              </>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/login" className={styles.loginLink}>
                  Giriş Yap
                </Link>
                <Link href="/register" className={styles.registerLink}>
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>{icerik.heroBaslik}</h1>
            <p>{icerik.heroAltBaslik}</p>
            <Link href="/etkinlikler" className={styles.cta}>
              Projelerimizi İnceleyin
            </Link>
          </div>
          <div className={styles.heroOverlay}></div>
        </section>

        <section className={styles.services}>
          <h2>Hizmetlerimiz</h2>
          <div className={styles.serviceGrid}>
            {icerik.servisler.map((servis, index) => (
              <div key={index} className={styles.serviceCard}>
                <Image
                  src={servis.ikonUrl}
                  alt={servis.baslik}
                  width={64}
                  height={64}
                />
                <h3>{servis.baslik}</h3>
                <p>{servis.aciklama}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.stats}>
          {icerik.istatistikler.map((istatistik, index) => (
            <div key={index} className={styles.statCard}>
              <h3>{istatistik.rakam}</h3>
              <p>{istatistik.aciklama}</p>
            </div>
          ))}
        </section>          <section className={styles.contact}>
          <h2>Vizyonunuzu Gerçeğe Dönüştürelim</h2>
          <p>Projeniz için profesyonel çözümler sunalım</p>
          <Link href="/login" className={styles.ctaSecondary}>
            Bizimle İletişime Geçin
          </Link>
        </section>
      </main>
    </div>
  );
}
