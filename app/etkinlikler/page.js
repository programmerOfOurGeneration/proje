'use client'
import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Image from 'next/image'

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
      <h1>Etkinliklerimiz</h1>
      <div className={styles.eventGrid}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            {event.resimUrl && (
              <Image
                src={event.resimUrl}
                alt={event.baslik}
                width={300}
                height={200}
                className={styles.eventImage}
              />
            )}
            <h2>{event.baslik}</h2>
            <p>{event.aciklama}</p>
            <div className={styles.eventDetails}>
              <p>Tarih: {new Date(event.tarih).toLocaleDateString('tr-TR')}</p>
              {event.konum && <p>Konum: {event.konum}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
