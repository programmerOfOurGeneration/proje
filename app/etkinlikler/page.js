'use client'
import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Image from 'next/image'
import Link from 'next/link'

export default function EventsPage() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/etkinlikler')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Etkinlikler yüklenemedi:', error)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className={styles.container}>
      <h1>Etkinliklerimiz</h1>      <div className={styles.eventGrid}>
        {events.map((event) => (
          <Link href={`/blog/${event.id}`} key={event.id} className={styles.eventCard}>
            <div className={styles.imageContainer}>
              {event.resimUrl ? (
                <Image
                  src={event.resimUrl}
                  alt={event.baslik}
                  width={300}
                  height={200}
                  className={styles.eventImage}
                />
              ) : (
                <div className={styles.noImage}>Resim Yok</div>
              )}
            </div>
            <div className={styles.cardContent}>
              <h2>{event.baslik}</h2>
              <p className={styles.description}>{event.aciklama}</p>
              <div className={styles.eventDetails}>
                <time dateTime={event.tarih}>
                  {new Date(event.tarih).toLocaleDateString('tr-TR')}
                </time>
                {event.konum && (
                  <div className={styles.location}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {event.konum}
                  </div>
                )}
              </div>
              <span className={styles.readMore}>
                Devamını Oku →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
