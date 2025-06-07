'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';

export default function BlogPost() {
  const params = useParams();
  const [etkinlik, setEtkinlik] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchEtkinlik = async () => {
      try {
        const response = await fetch(`/api/etkinlikler/${params.id}`);
        if (!response.ok) {
          throw new Error('Etkinlik bulunamadı');
        }
        const data = await response.json();
        setEtkinlik(data);
      } catch (error) {
        console.error('Etkinlik yüklenemedi:', error);
      }
    };

    if (params.id) {
      fetchEtkinlik();
    }
  }, [params.id]);

  if (!etkinlik) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>Yükleniyor...</div>
      </div>
    );
  }
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/etkinlikler">← Etkinliklere Dön</Link>
      </div>

      <article className={styles.blogPost}>
        <header className={styles.header}>
          <div className={styles.meta}>
            <time dateTime={etkinlik.tarih}>{formatDate(etkinlik.tarih)}</time>
            {etkinlik.konum && (
              <span className={styles.location}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {etkinlik.konum}
              </span>
            )}
          </div>
          <h1 className={styles.title}>{etkinlik.baslik}</h1>
        </header>

        {etkinlik.resimUrl && (
          <div className={styles.featuredImage}>
            <Image
              src={etkinlik.resimUrl}
              alt={etkinlik.baslik}
              width={1200}
              height={600}
              className={styles.mainImage}
              priority
            />
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.summary}>
            {etkinlik.aciklama}
          </div>

          <div 
            className={styles.description} 
            dangerouslySetInnerHTML={{ __html: etkinlik.icerik }}
          />
        </div>

        {etkinlik.resimler && etkinlik.resimler.length > 0 && (
          <section className={styles.gallery}>
            <h2>Etkinlik Fotoğrafları</h2>
            <div className={styles.imageGrid}>
              {etkinlik.resimler.map((resim, index) => (
                <div
                  key={index}
                  className={styles.imageItem}
                  onClick={() => setSelectedImage(resim)}
                >
                  <Image
                    src={resim.url}
                    alt={resim.aciklama || `${etkinlik.baslik} - Fotoğraf ${index + 1}`}
                    width={400}
                    height={300}
                    className={styles.galleryImage}
                  />
                  {resim.aciklama && (
                    <div className={styles.imageCaption}>{resim.aciklama}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {etkinlik.videolar && etkinlik.videolar.length > 0 && (
          <section className={styles.videoSection}>
            <h2>Etkinlik Videoları</h2>
            <div className={styles.videoGrid}>
              {etkinlik.videolar.map((video, index) => (
                <div key={index} className={styles.videoItem}>
                  <video controls className={styles.video}>
                    <source src={video.url} type="video/mp4" />
                    Tarayıcınız video oynatmayı desteklemiyor.
                  </video>
                  {video.aciklama && (
                    <div className={styles.videoCaption}>{video.aciklama}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      {selectedImage && (
        <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <button className={styles.closeButton} onClick={() => setSelectedImage(null)}>
            ✕
          </button>
          <Image
            src={selectedImage.url}
            alt={selectedImage.aciklama || 'Etkinlik fotoğrafı'}
            width={1200}
            height={800}
            className={styles.lightboxImage}
          />
          {selectedImage.aciklama && (
            <div className={styles.lightboxCaption}>
              {selectedImage.aciklama}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
