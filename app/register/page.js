'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import styles from './page.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Oturum durumunu kontrol et
  useEffect(() => {
    if (session) {
      if (session.user.isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/sohbet');
      }
    }
  }, [session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Kayıt başarılı, giriş yap
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result.error) {
          setError('Giriş yapılırken bir hata oluştu');
        }
        // Yönlendirmeyi useEffect ile session kontrolü yapacak
      } else {
        setError(data.error || 'Kayıt olurken bir hata oluştu');
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Yükleme durumunda loading göster
  if (status === 'loading' || isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.leftSide}>
          <Image 
            src="/stage.svg" 
            alt="StageDesign Logo" 
            width={100} 
            height={100} 
            className={styles.logo}
          />
          <h2>StageDesign</h2>
          <p>Üyelik Oluştur</p>
        </div>
        
        <div className={styles.rightSide}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h1>Kayıt Ol</h1>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label htmlFor="name">Ad Soyad</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Adınız ve soyadınız"
                minLength={2}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">E-posta</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="E-posta adresiniz"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Şifre</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Şifreniz"
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>

            <div className={styles.loginLink}>
              Zaten hesabınız var mı? <Link href="/login">Giriş Yapın</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
