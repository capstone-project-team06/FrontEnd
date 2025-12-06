'use client'; // 클라이언트 기능(state, effect) 사용

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // 경로 변경 감지를 위해 추가
import styles from './Header.module.css';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const pathname = usePathname(); // 현재 페이지 경로를 감지
    const router = useRouter();

    // ▼ 페이지가 바뀔 때마다 로그인 상태 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        // 토큰이 있으면 true, 없으면 false
        setIsLoggedIn(!!token);
    }, [pathname]); // pathname이 변할 때마다 이 코드가 실행됨

    // ▼ 로그아웃 핸들러
    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();

        // 1. 토큰 삭제
        localStorage.removeItem('accessToken');

        // 2. 상태 업데이트
        setIsLoggedIn(false);

        // 3. 메시지 및 홈으로 이동
        alert('로그아웃 되었습니다.');
        router.push('/');
    };

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <Link href="/">Fit-me Up</Link>
            </div>
            <nav className={styles.navLinks}>
                {isLoggedIn ? (
                    <>
                        <Link href="/mypage">마이페이지</Link>
                        {/* 로그아웃 버튼에 핸들러 연결 */}
                        <a href="#" onClick={handleLogout}>로그아웃</a>
                    </>
                ) : (
                    <>
                        <Link href="/login">로그인</Link>
                        <Link href="/signup">회원가입</Link>
                    </>
                )}
            </nav>
        </header>
    );
}