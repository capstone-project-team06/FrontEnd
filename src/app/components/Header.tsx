'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // 페이지 이동 시마다 로그인 상태 확인
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
    }, [pathname]);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        alert('로그아웃 되었습니다.');
        router.push('/');
    };

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                {/* ▼▼▼ [수정됨] 로그인 여부에 따라 이동 경로 변경 ▼▼▼ */}
                <Link href={isLoggedIn ? '/upload' : '/'}>
                    Fit-me Up
                </Link>
            </div>

            <nav className={styles.navLinks}>
                {isLoggedIn ? (
                    <>
                        <Link href="/mypage">마이페이지</Link>
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