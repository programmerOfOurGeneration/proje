'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';

export default function EtkinliklerAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [etkinlik, setEtkinlik] = useState({
    baslik: '',
    aciklama: '',
    icerik: '',
    tarih: '',
    konum: '',
    resimUrl: '',
  });
  const [resimler, setResimler] = useState([]);
  const [videolar, setVideolar] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchEtkinlikler = async () => {
      try {
        const response = await fetch('/api/etkinlikler');
        const data = await response.json();
        setEtkinlikler(data);
      } catch (error) {
        console.error('Etkinlikler yüklenemedi:', error);
        setError('Etkinlikler yüklenemedi');
      }
    };

    fetchEtkinlikler();
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      Object.keys(etkinlik).forEach(key => {
        formData.append(key, etkinlik[key]);
      });

      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `/api/etkinlikler/${editId}` : '/api/etkinlikler';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...etkinlik,
          resimler,
          videolar
        }),
      });

      if (response.ok) {
        setMessage(editMode ? 'Etkinlik güncellendi!' : 'Etkinlik oluşturuldu!');
        setEtkinlik({
          baslik: '',
          aciklama: '',
          icerik: '',
          tarih: '',
          konum: '',
          resimUrl: '',
        });
        setResimler([]);
        setVideolar([]);
        setEditMode(false);
        setEditId(null);
        
        // Etkinlikleri yenile
        const updatedResponse = await fetch('/api/etkinlikler');
        const updatedData = await updatedResponse.json();
        setEtkinlikler(updatedData);
      } else {
        const data = await response.json();
        setError(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
      setError('İşlem sırasında bir hata oluştu');
    }
  };

  const handleEdit = (etkinlik) => {
    setEtkinlik({
      baslik: etkinlik.baslik,
      aciklama: etkinlik.aciklama,
      icerik: etkinlik.icerik,
      tarih: new Date(etkinlik.tarih).toISOString().split('T')[0],
      konum: etkinlik.konum || '',
      resimUrl: etkinlik.resimUrl || '',
    });
    setResimler(etkinlik.resimler || []);
    setVideolar(etkinlik.videolar || []);
    setEditMode(true);
    setEditId(etkinlik.id);
    window.scrollTo(0, 0);
  };
  const handleDelete = async (id) => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setMessage('');
      setError('');
      
      const response = await fetch(`/api/etkinlikler/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Etkinlik başarıyla silindi!');
        // Etkinlikleri yenile
        const updatedResponse = await fetch('/api/etkinlikler');
        const updatedData = await updatedResponse.json();
        setEtkinlikler(updatedData);
      } else {
        setError(data.error || 'Etkinlik silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      setError('Etkinlik silinirken bir hata oluştu');
    }
  };

  const addResim = () => {
    setResimler([...resimler, { url: '', aciklama: '' }]);
  };

  const addVideo = () => {
    setVideolar([...videolar, { url: '', aciklama: '' }]);
  };

  const removeResim = (index) => {
    setResimler(resimler.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideolar(videolar.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (file, type) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Dosya yükleme hatası');
      }

      const data = await response.json();
      
      if (type === 'image') {
        setResimler([...resimler, {
          url: data.url,
          aciklama: ''
        }]);
      } else if (type === 'video') {
        setVideolar([...videolar, {
          url: data.url,
          aciklama: ''
        }]);
      }

      return data.url;
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setError('Dosya yüklenmesi sırasında bir hata oluştu');
      return null;
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      await handleFileUpload(file, 'image');
    }
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      await handleFileUpload(file, 'video');
    }
  };

  const removeMedia = (index, type) => {
    if (type === 'image') {
      setResimler(resimler.filter((_, i) => i !== index));
    } else if (type === 'video') {
      setVideolar(videolar.filter((_, i) => i !== index));
    }
  };

  const updateMediaDescription = (index, description, type) => {
    if (type === 'image') {
      const updatedResimler = [...resimler];
      updatedResimler[index].aciklama = description;
      setResimler(updatedResimler);
    } else if (type === 'video') {
      const updatedVideolar = [...videolar];
      updatedVideolar[index].aciklama = description;
      setVideolar(updatedVideolar);
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
      <h1 className={styles.title}>
        {editMode ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Ekle'}
      </h1>
      
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="baslik">Başlık</label>
          <input
            type="text"
            id="baslik"
            value={etkinlik.baslik}
            onChange={(e) => setEtkinlik({ ...etkinlik, baslik: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="aciklama">Kısa Açıklama</label>
          <textarea
            id="aciklama"
            value={etkinlik.aciklama}
            onChange={(e) => setEtkinlik({ ...etkinlik, aciklama: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="icerik">Detaylı İçerik</label>
          <textarea
            id="icerik"
            value={etkinlik.icerik}
            onChange={(e) => setEtkinlik({ ...etkinlik, icerik: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tarih">Tarih</label>
          <input
            type="date"
            id="tarih"
            value={etkinlik.tarih}
            onChange={(e) => setEtkinlik({ ...etkinlik, tarih: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="konum">Konum</label>
          <input
            type="text"
            id="konum"
            value={etkinlik.konum}
            onChange={(e) => setEtkinlik({ ...etkinlik, konum: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="resimUrl">Ana Resim URL</label>
          <input
            type="url"
            id="resimUrl"
            value={etkinlik.resimUrl}
            onChange={(e) => setEtkinlik({ ...etkinlik, resimUrl: e.target.value })}
          />
        </div>

        <div className={styles.mediaSection}>
          <h3>Medya Yönetimi</h3>
          
          <div className={styles.imageUpload}>
            <label>
              Resimler:
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
            </label>
            
            <div className={styles.mediaPreview}>
              {resimler.map((resim, index) => (
                <div key={index} className={styles.mediaItem}>
                  <Image
                    src={resim.url}
                    alt={resim.aciklama || `Resim ${index + 1}`}
                    width={100}
                    height={100}
                    objectFit="cover"
                  />
                  <input
                    type="text"
                    value={resim.aciklama || ''}
                    onChange={(e) => updateMediaDescription(index, e.target.value, 'image')}
                    placeholder="Resim açıklaması"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(index, 'image')}
                    className={styles.removeButton}
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.videoUpload}>
            <label>
              Videolar:
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className={styles.fileInput}
              />
            </label>
            
            <div className={styles.mediaPreview}>
              {videolar.map((video, index) => (
                <div key={index} className={styles.mediaItem}>
                  <video width="200" controls>
                    <source src={video.url} type="video/mp4" />
                    Tarayıcınız video elementini desteklemiyor.
                  </video>
                  <input
                    type="text"
                    value={video.aciklama || ''}
                    onChange={(e) => updateMediaDescription(index, e.target.value, 'video')}
                    placeholder="Video açıklaması"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(index, 'video')}
                    className={styles.removeButton}
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <button type="submit" className={styles.submitButton}>
          {editMode ? 'Etkinliği Güncelle' : 'Etkinliği Oluştur'}
        </button>
      </form>      <div className={styles.eventList}>
        <h2>Mevcut Etkinlikler</h2>
        {etkinlikler.length === 0 ? (
          <p className={styles.noEvents}>Henüz etkinlik bulunmamaktadır.</p>
        ) : (
          <div className={styles.events}>
            {etkinlikler.map((item) => (
              <div key={item.id} className={styles.eventItem}>
                <div className={styles.eventImageContainer}>
                  {item.resimUrl ? (
                    <Image
                      src={item.resimUrl}
                      alt={item.baslik}
                      width={200}
                      height={120}
                      className={styles.eventImage}
                    />
                  ) : (
                    <div className={styles.noImage}>Resim Yok</div>
                  )}
                </div>
                <div className={styles.eventInfo}>
                  <h3>{item.baslik}</h3>
                  <p className={styles.description}>{item.aciklama}</p>
                  <p className={styles.date}>
                    <strong>Tarih:</strong>{' '}
                    {new Date(item.tarih).toLocaleDateString('tr-TR')}
                  </p>
                  {item.konum && (
                    <p className={styles.location}>
                      <strong>Konum:</strong> {item.konum}
                    </p>
                  )}
                </div>
                <div className={styles.eventActions}>
                  <button
                    onClick={() => handleEdit(item)}
                    className={styles.editButton}
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className={styles.deleteButton}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
