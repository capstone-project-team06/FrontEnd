'use client'; // useState, useRouter 등 클라이언트 훅 사용을 위해 선언

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // next/navigation에서 useRouter를 가져옴
import Link from 'next/link';
import styles from './page.module.css';

// 실제 API 호출을 시뮬레이션하는 함수
// 비밀번호가 '1234'이면 성공, 아니면 실패를 반환합니다.
// async function simulateApiLogin(email, password) {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             if (password === '1234') {
//                 resolve({ success: true });
//             } else {
//                 reject({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
//             }
//         }, 1000); // 1초 딜레이
//     });
// }


export default function LoginPage() {
    const router = useRouter(); // 페이지 이동을 위한 router 객체

    // 입력 필드의 상태를 관리하기 위한 state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 로그인 버튼 클릭 시 실행될 함수
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // form의 기본 제출 동작(새로고침) 방지
        setError(''); // 이전 에러 메시지 초기화
        setIsLoading(true); // 로딩 상태 시작

        try {
            // [API 호출] 백엔드의 로그인 엔드포인트로 POST 요청
            const res = await fetch('https://fit-me-up.p-e.kr/account/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password: password }),
            });

            if (res.ok) {
                // 로그인 성공
                const data = await res.json();

                // [중요] 서버로부터 받은 토큰을 브라우저에 저장합니다.
                // (실제 배포 시에는 보안을 위해 쿠키 사용을 권장합니다)
                // ▼▼▼ [체크 2] 토큰 이름 자동 찾기 (Django DRF는 보통 'key' 또는 'token' 사용)
                const accessToken = data.token?.access_token || data.access_token || data.token;

                if (accessToken) {
                    localStorage.setItem('accessToken', accessToken);
                    console.log("로그인 성공! 받은 토큰:", accessToken);
                    router.push('/upload');
                } else {
                    console.error("토큰을 찾을 수 없습니다. 응답 데이터:", data);
                    setError('로그인은 성공했으나 토큰을 받아오지 못했습니다.');
                }
            } else {
                // 로그인 실패
                const errorData = await res.json();
                console.log("로그인 실패:", errorData); // 콘솔로 에러 내용 확인
                // 에러 메시지가 배열로 오는 경우 처리 (Django 특성)
                const message = errorData.detail || errorData.non_field_errors?.[0] || '이메일 또는 비밀번호가 올바르지 않습니다.';
                setError(message);
            }
        } catch (err) {
            console.error("네트워크 에러:", err); // 콘솔로 에러 확인
            setError('서버와 통신 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.loginBox}>
                <h1 className={styles.title}>
                    <Link href="/">Fit-me Up</Link>
                </h1>
                {/* onSubmit 이벤트 핸들러 연결 */}
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="이메일"
                        className={styles.inputField}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required // 필수 입력 필드
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        className={styles.inputField}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required // 필수 입력 필드
                    />
                    {/* 에러 메시지가 있을 경우 표시 */}
                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button type="submit" className={styles.loginButton} disabled={isLoading}>
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
                <div className={styles.links}>
                    <Link href="/signup">회원가입</Link>
                    <span>|</span>
                    <Link href="/find-password">비밀번호 찾기</Link>
                </div>
            </div>
        </main>
    );
}