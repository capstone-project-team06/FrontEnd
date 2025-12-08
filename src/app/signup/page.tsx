'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';


// 선호 룩 옵션
const lookOptions = ['미니멀', '캐주얼', '아메카지', '클래식', '스트릿'];

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    // 비밀번호 에러 메시지 State
    const [passwordError, setPasswordError] = useState('');

    const [name, setName] = useState('');

    const [age, setAge] = useState('');
    const [gender, setGender] = useState('M'); // 기본값 'M' (남성)

    // 키, 몸무게 State
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    // 선호 룩 State
    const [preferredLooks, setPreferredLooks] = useState<string[]>([]);
    const [otherLook, setOtherLook] = useState('');
    const [dontKnowLook, setDontKnowLook] = useState(false);
    const [isOtherLookChecked, setIsOtherLookChecked] = useState(false);

    // API 에러 메시지 State
    const [apiError, setApiError] = useState('');

    // 비밀번호 일치 여부 실시간 검사
    useEffect(() => {
        // '비밀번호 확인'란이 비어있지 않고, 두 비밀번호가 다를 경우
        if (passwordConfirm && password !== passwordConfirm) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
            setPasswordError(''); // 일치하거나 비어있으면 에러 없음
        }
    }, [password, passwordConfirm]); // password 또는 passwordConfirm이 변경될 때마다 실행

    // 폼 제출 핸들러 (현재는 콘솔에 출력)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(''); // 이전 에러 초기화

        // 제출 전, 비밀번호가 일치하는지 한번 더 확인
        if (password !== passwordConfirm) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
            return; // 일치하지 않으면 제출 중단
        }

        // '기타' 및 '직접 입력' 값 처리 로직
        const finalOtherLooks: string[] = [];
        if (isOtherLookChecked) {
            if (otherLook) {
                finalOtherLooks.push(otherLook); // '직접 입력' 값이 있으면 그 값 사용
            } else {
                finalOtherLooks.push('기타'); // '기타'만 체크하고 '직접 입력' 안 한 경우
            }
        }
        const finalLooks = dontKnowLook
            ? ['모르겠음']
            : [...preferredLooks, ...finalOtherLooks];

        const styleMapping: { [key: string]: string } = {
            '미니멀': 'minimal',
            '캐주얼': 'casual',
            '아메카지': 'amekaji',
            '클래식': 'classic',
            '스트릿': 'street',
            '기타': 'etc' // 혹은 API에 맞게 설정
        };

        // 선택된 한글 룩을 영어로 바꿈
        const englishStyles = finalLooks.map(look => styleMapping[look] || look)

        const signupData = {
            email: email,
            name: name,
            password: password,
            gender: gender,
            age: Number(age),
            height_cm: Number(height),
            weight_kg: Number(weight),
            styles: englishStyles
        };

        try {
            console.log("보내는 데이터:", signupData);
            // [API 호출] 백엔드의 회원가입 엔드포인트로 POST 요청
            const signupRes = await fetch('https://fit-me-up.p-e.kr/account/join/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),
            });

            console.log("응답 상태 코드:", signupRes.status);

            if (!signupRes.ok) {
                const errorData = await signupRes.json();
                setApiError(`회원가입 실패: ${JSON.stringify(errorData)}`);
                return; // 여기서 중단
            }

            // 회원가입 성공 -> 토큰 추출
            const signupResponseData = await signupRes.json();
            const accessToken = signupResponseData.token?.access_token || signupResponseData.access_token;

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                alert('회원가입이 완료되었습니다!');
                router.push('/upload'); // 바로 이동
            } else {
                // 가입은 됐는데 토큰이 안 넘어온 경우 (로그인 페이지로 유도)
                alert('회원가입 완료. 로그인 해주세요.');
                router.push('/login');
            }

        } catch (err) {
            console.error(err);
            setApiError('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    // 일반 룩 체크박스 핸들러
    const handleLookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;

        // 다른 룩을 선택하면 '모르겠음' 해제
        setDontKnowLook(false);

        if (checked) {
            setPreferredLooks(prev => [...prev, value]);
        } else {
            setPreferredLooks(prev => prev.filter(look => look !== value));
        }
    };

    // '기타' 체크박스 핸들러
    const handleOtherLookCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setIsOtherLookChecked(checked);

        if (checked) {
            setDontKnowLook(false); // '기타' 선택 시 '모르겠음' 해제
        } else {
            setOtherLook(''); // '기타' 해제 시 '직접 입력' 텍스트도 지움
        }
    };

    // '직접 입력' 텍스트 핸들러
    const handleOtherLookInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        setOtherLook(newText);

        if (newText) {
            setIsOtherLookChecked(true); // '직접 입력'에 무언가 입력하면 '기타' 자동 체크
            setDontKnowLook(false); // '모르겠음' 해제
        }
    };

    // '모르겠음' 체크박스 핸들러
    const handleDontKnowLookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setDontKnowLook(checked);
        if (checked) {
            // '모르겠음'을 선택하면 다른 모든 룩 선택 해제
            setPreferredLooks([]);
            setIsOtherLookChecked(false); // '기타' 체크 해제
            setOtherLook('');
        }
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.signupBox}>
                <h1 className={styles.title}>
                    <Link href="/">Fit-me Up</Link>
                </h1>
                <form className={styles.signupForm} onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="이메일"
                        className={styles.inputField}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        className={styles.inputField}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호 확인"
                        className={styles.inputField}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                    />

                    {/* 비밀번호 불일치 에러 메시지 ▼ */}
                    {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}

                    {/* API 에러 메시지 표시 */}
                    {apiError && <p className={styles.errorMessage}>{apiError}</p>}

                    <input
                        type="text"
                        placeholder="이름"
                        className={styles.inputField}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    {/* 나이 및 성별 입력 */}
                    <div className={styles.inputGroup}>
                        <input
                            type="number"
                            placeholder="나이"
                            className={`${styles.inputField} ${styles.inputFieldHalf}`}
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                        />
                        {/* 성별 선택 */}
                        <select
                            className={`${styles.inputField} ${styles.inputFieldHalf}`}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="M">남성</option>
                            <option value="F">여성</option>
                        </select>
                    </div>

                    {/* 키 / 몸무게 입력란 */}
                    <div className={styles.inputGroup}>
                        <input
                            type="number"
                            placeholder="키 (cm)"
                            className={`${styles.inputField} ${styles.inputFieldHalf}`}
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="몸무게 (kg)"
                            className={`${styles.inputField} ${styles.inputFieldHalf}`}
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                    </div>

                    {/* 선호 룩 선택 */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>선호하는 룩 (중복 선택 가능)</h2>
                        <div className={styles.checkboxGrid}>
                            {lookOptions.map((look) => (
                                <label key={look} className={styles.checkboxWrapper}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkboxInput}
                                        value={look}
                                        checked={preferredLooks.includes(look)}
                                        onChange={handleLookChange}
                                    />
                                    <span>{look}</span>
                                </label>
                            ))}
                            {/* '기타' 체크박스 (1열) */}
                            <label className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    className={styles.checkboxInput}
                                    value="기타"
                                    checked={isOtherLookChecked}
                                    onChange={handleOtherLookCheckboxChange}
                                />
                                <span>기타</span>
                            </label>

                            {/* '직접 입력' 필드 (2열) */}
                            <div className={styles.otherInputWrapper}>
                                <input
                                    type="text"
                                    placeholder="직접 입력"
                                    className={styles.otherInput}
                                    value={otherLook}
                                    onChange={handleOtherLookInputChange}
                                />
                            </div>

                            {/* '모르겠음' 항목 */}
                            <label className={`${styles.checkboxWrapper} ${styles.fullWidth}`}>
                                <input
                                    type="checkbox"
                                    className={styles.checkboxInput}
                                    checked={dontKnowLook}
                                    onChange={handleDontKnowLookChange}
                                />
                                <span>모르겠음 (없음)</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className={styles.signupButton}>
                        회원가입
                    </button>
                </form>
                <div className={styles.links}>
                    <span>이미 계정이 있으신가요?</span>
                    <Link href="/login">로그인</Link>
                </div>
            </div>
        </main>
    );
}
