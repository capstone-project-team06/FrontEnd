'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const lookMap: { [key: string]: string } = {
    'minimal': '미니멀', 'casual': '캐주얼', 'amekaj': '아메카지', 'classic': '클래식', 'street': '스트릿'
};

const lookMapReverse: { [key: string]: string } = {
    '미니멀': 'minimal', '캐주얼': 'casual', '아메카지': 'amekaj', '클래식': 'classic', '스트릿': 'street'
};

// --- 옵션 데이터 (회원가입과 동일) ---
const lookOptions = ['미니멀', '캐주얼', '아메카지', '클래식', '스트릿'];

export default function MyPage() {
    const router = useRouter();

    // 프로필 정보 State
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    // 선호 룩 State
    const [preferredLooks, setPreferredLooks] = useState<string[]>([]);
    const [otherLook, setOtherLook] = useState('');
    const [isOtherLookChecked, setIsOtherLookChecked] = useState(false);
    const [dontKnowLook, setDontKnowLook] = useState(false);

    // 비밀번호 변경 State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            // 토큰 확인
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('로그인이 필요합니다.');
                router.push('/login');
                return;
            }

            try {
                // API 호출 (GET)
                const res = await fetch('https://fit-me-up.p-e.kr/account/info/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("내 정보 불러오기 성공:", data);

                    // 데이터 매핑 (Backend -> Frontend)
                    setEmail(data.email || '');
                    setName(data.name || '');
                    setHeight(data.height_cm ? String(data.height_cm) : '');
                    setWeight(data.weight_kg ? String(data.weight_kg) : '');

                    const backendStyles = data.styles || [];
                    const convertedStyles = backendStyles.map((s: string) => lookMap[s] || s);

                    if (convertedStyles.includes('모르겠음')) {
                        setDontKnowLook(true);
                    } else {
                        // 체크박스에 있는 것과 없는 것(기타) 분리
                        const standardLooks = convertedStyles.filter((l: string) => lookOptions.includes(l));
                        const customLooks = convertedStyles.filter((l: string) => !lookOptions.includes(l));

                        setPreferredLooks(standardLooks);
                        if (customLooks.length > 0) {
                            setIsOtherLookChecked(true);
                            setOtherLook(customLooks.join(', '));
                        }
                    }
                } else {
                    console.error("정보 불러오기 실패");
                    // 토큰 만료 등의 이유로 실패 시 로그인 페이지로 이동시킬 수도 있음
                }
            } catch (error) {
                console.error("네트워크 에러:", error);
            }
        };

        fetchUserInfo();
    }, []); // 빈 배열 [] : 페이지 로드 시 1회 실행

    // --- 비밀번호 확인 Effect ---
    useEffect(() => {
        if (newPasswordConfirm && newPassword !== newPasswordConfirm) {
            setPasswordError('새 비밀번호가 일치하지 않습니다.');
        } else {
            setPasswordError('');
        }
    }, [newPassword, newPasswordConfirm]);


    // 룩 핸들러
    const handleLookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setDontKnowLook(false);
        if (checked) setPreferredLooks(prev => [...prev, value]);
        else setPreferredLooks(prev => prev.filter(item => item !== value));
    };
    const handleOtherLookCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsOtherLookChecked(e.target.checked);
        if (e.target.checked) setDontKnowLook(false); else setOtherLook('');
    };
    const handleOtherLookInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtherLook(e.target.value);
        if (e.target.value) { setIsOtherLookChecked(true); setDontKnowLook(false); }
    };
    const handleDontKnowLook = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDontKnowLook(e.target.checked);
        if (e.target.checked) { setPreferredLooks([]); setIsOtherLookChecked(false); setOtherLook(''); }
    };

    // 프로필 저장 핸들러
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        // 룩 데이터 합치기 (기존 선택 + 기타 입력)
        let finalLooks = [...preferredLooks];
        // '모르겠음'이 아닐 때만 기타 값 추가
        if (!dontKnowLook && isOtherLookChecked && otherLook) {
            finalLooks.push(otherLook);
        } else if (dontKnowLook) {
            finalLooks = ['모르겠음'];
        }
        // 한글 -> 영어 변환 (매핑 안 되면 그대로 보냄)
        const finalLooksEn = finalLooks.map(l => lookMapReverse[l] || l);

        // 전송할 JSON 데이터 만들기
        const updateData = {
            height_cm: Number(height) || null,
            weight_kg: Number(weight) || null,
            styles: finalLooksEn,
        };

        try {
            // API 호출
            const res = await fetch('https://fit-me-up.p-e.kr/account/info/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (res.ok) {
                const data = await res.json();
                console.log("수정 완료:", data);
                alert('회원 정보가 성공적으로 수정되었습니다!');
                // (선택) 페이지 새로고침 등을 할 수도 있음
                // window.location.reload(); 
            } else {
                const errorData = await res.json();
                console.error("수정 실패:", errorData);
                alert('정보 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error("네트워크 에러:", error);
            alert('서버와 연결할 수 없습니다.');
        }
    };

    // 비밀번호 변경 핸들러
    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordError) return alert('새 비밀번호가 일치하지 않습니다.');
        console.log('비밀번호 변경 요청');
        alert('비밀번호가 변경되었습니다.');
        setCurrentPassword(''); setNewPassword(''); setNewPasswordConfirm('');
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.mypageBox}>
                <h1 className={styles.title}>마이페이지</h1>

                {/* 프로필 정보 수정 */}
                <form onSubmit={handleProfileUpdate} className={styles.formGroup}>
                    <div className={styles.sectionHeader}>
                        <h2>내 정보 수정</h2>
                    </div>

                    <input type="email" value={email} readOnly className={styles.inputFieldReadOnly} />
                    <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} className={styles.inputField} />

                    <div className={styles.inputGroup}>
                        <input type="number" placeholder="키 (cm)" value={height} onChange={(e) => setHeight(e.target.value)} className={`${styles.inputField} ${styles.inputFieldHalf}`} />
                        <input type="number" placeholder="몸무게 (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} className={`${styles.inputField} ${styles.inputFieldHalf}`} />
                    </div>

                    {/* 룩 수정 */}
                    <div className={styles.subSection}>
                        <h3>선호하는 룩</h3>
                        <div className={styles.checkboxGrid}>
                            {lookOptions.map(look => (
                                <label key={look} className={styles.checkboxWrapper}>
                                    <input type="checkbox" className={styles.checkboxInput} value={look} checked={preferredLooks.includes(look)} onChange={handleLookChange} />
                                    <span>{look}</span>
                                </label>
                            ))}
                            <label className={styles.checkboxWrapper}>
                                <input type="checkbox" className={styles.checkboxInput} checked={isOtherLookChecked} onChange={handleOtherLookCheck} />
                                <span>기타</span>
                            </label>
                            <div className={styles.otherInputWrapper}>
                                <input type="text" placeholder="직접 입력" className={styles.otherInput} value={otherLook} onChange={handleOtherLookInput} />
                            </div>
                            <label className={`${styles.checkboxWrapper} ${styles.fullWidth}`}>
                                <input type="checkbox" className={styles.checkboxInput} checked={dontKnowLook} onChange={handleDontKnowLook} />
                                <span>모르겠음 (없음)</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className={styles.saveButton}>정보 수정 저장</button>
                </form>

                {/* 비밀번호 변경 */}
                <form onSubmit={handlePasswordUpdate} className={`${styles.formGroup} ${styles.passwordGroup}`}>
                    <div className={styles.sectionHeader}>
                        <h2>비밀번호 변경</h2>
                    </div>
                    <input type="password" placeholder="현재 비밀번호" className={styles.inputField} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    <input type="password" placeholder="새 비밀번호" className={styles.inputField} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <input type="password" placeholder="새 비밀번호 확인" className={styles.inputField} value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} />
                    {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}

                    <button type="submit" className={styles.passwordButton}>비밀번호 변경</button>
                </form>

            </div>
        </main>
    );
}