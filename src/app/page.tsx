import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        <h1>Fit-me Up</h1>

        <div className={styles.taglines}>
          <p>데이터로 찾는 가장 나다운 스타일링</p>
          <p>사진 한 장으로 시작되는 나만의 스타일 찾기</p>
        </div>

        <div className={styles.authLinks}>
          <Link href="/login">로그인</Link>
          <Link href="/signup">회원가입</Link>
        </div>
      </div>
    </main>
  );
}