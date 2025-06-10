'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import styles from './page.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result.error) {
        setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google');  // Yönlendirmeyi middleware ve session callback'ler halledecek
  };

  // Yükleme durumunda veya oturum açıkken loading göster
  if (status === 'loading') {
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
          <p>Kullanıcı Girişi</p>
        </div>
        
        <div className={styles.rightSide}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h1>Giriş Yap</h1>
            {error && <div className={styles.error}>{error}</div>}
            
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
              />
            </div>

            <button type="submit" className={styles.loginButton}>
              Giriş Yap
            </button>

            <div className={styles.divider}>
              <span>veya</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className={styles.googleButton}
            >
              <Image 
                src="/google.svg" 
                alt="Google" 
                width={20} 
                height={20} 
              />
              Google ile Giriş Yap
            </button>

            <div className={styles.registerLink}>
              Hesabınız yok mu? <Link href="/register">Kayıt Olun</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
