'use client'; // state 사용을 위해 클라이언트 컴포넌트로 변경

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useRouter } from 'next/navigation'; // [추가] router 임포트


// 선호 룩 옵션
const lookOptions = ['미니멀', '캐주얼', '아메카지', '클래식', '스트릿'];

// ▼ [추가] 색상 옵션 데이터 (이름과 실제 색상 코드)
const colorOptions = [
    { label: '블랙', hex: '#000000' },
    { label: '화이트', hex: '#FFFFFF' },
    { label: '그레이', hex: '#808080' },
    { label: '네이비', hex: '#000080' },
    { label: '베이지', hex: '#F5F5DC' },
    { label: '브라운', hex: '#8B4513' },
    { label: '카키', hex: '#556B2F' },
    { label: '핑크', hex: '#FFD1DC' },
    { label: '레드', hex: '#FF0000' },
];

// ▼ [추가] 핏 옵션 데이터
const fitOptions = ['오버핏', '레귤러핏', '슬림핏'];

export default function SignupPage() {
    const router = useRouter(); // [추가]
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    // ▼ [추가] 비밀번호 에러 메시지 State
    const [passwordError, setPasswordError] = useState('');

    const [name, setName] = useState('');

    const [age, setAge] = useState('');
    const [gender, setGender] = useState('M'); // 기본값 'M' (남성)

    // ▼ [추가] 키, 몸무게 State
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    // ▼ [추가] 선호 룩 State
    const [preferredLooks, setPreferredLooks] = useState<string[]>([]);
    const [otherLook, setOtherLook] = useState('');
    const [dontKnowLook, setDontKnowLook] = useState(false);
    const [isOtherLookChecked, setIsOtherLookChecked] = useState(false);

    // --- [추가/수정] 선호 색상 State ---
    const [preferredColors, setPreferredColors] = useState<string[]>([]);
    const [otherColor, setOtherColor] = useState(''); // 색상 직접 입력
    const [dontKnowColor, setDontKnowColor] = useState(false); // 색상 모르겠음
    const [isOtherColorChecked, setIsOtherColorChecked] = useState(false);

    // ▼ [추가] 핏 State
    const [preferredFits, setPreferredFits] = useState<string[]>([]);
    const [dontKnowFit, setDontKnowFit] = useState(false);

    // [추가] API 에러 메시지 State
    const [apiError, setApiError] = useState('');

    // ▼ [추가] 비밀번호 일치 여부 실시간 검사
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

        // ▼ [수정] 제출 전, 비밀번호가 일치하는지 한번 더 확인
        if (password !== passwordConfirm) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
            return; // 일치하지 않으면 제출 중단
        }

        // ▼ [수정] '기타' 및 '직접 입력' 값 처리 로직
        let finalOtherLooks: string[] = [];
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

        let finalOtherColors: string[] = [];
        if (isOtherColorChecked) {
            if (otherColor) finalOtherColors.push(otherColor);
            else finalOtherColors.push('기타');
        }
        const finalColors = dontKnowColor ? ['모르겠음'] : [...preferredColors, ...finalOtherColors];

        const finalFits = dontKnowFit ? ['모르겠음'] : preferredFits;

        // ▼▼▼ [중요] 백엔드 명세에 정확히 맞춘 데이터 구조 ▼▼▼
        const signupData = {
            email: email,          // "testuser1"
            password: password,          // "1234"
            gender: gender,              // "M"
            age: Number(age),            // 24 (숫자 변환)
            height_cm: Number(height),   // 178 (이름 변경: height -> height_cm)
            weight_kg: Number(weight)    // 68 (이름 변경: weight -> weight_kg)
        };

        // ▼▼▼ [2단계 데이터] 온보딩용 (선호 정보) ▼▼▼
        // (백엔드가 원하는 필드명에 맞춰야 함. 보통 looks, colors, fits 일 확률 높음)
        const onboardingData = {
            styles: finalLooks,
            preferred_colors: finalColors,
            preferred_fits: finalFits
        };


        try {
            // [API 호출] 백엔드의 회원가입 엔드포인트로 POST 요청
            const signupRes = await fetch('https://fit-me-up.p-e.kr/account/join/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),
            });

            if (!signupRes.ok) {
                const errorData = await signupRes.json();
                setApiError(`회원가입 실패: ${JSON.stringify(errorData)}`);
                return; // 여기서 중단
            }

            // 회원가입 성공 -> 토큰 추출
            const signupResponseData = await signupRes.json();
            const accessToken = signupResponseData.token?.access_token || signupResponseData.access_token;

            if (!accessToken) {
                alert('회원가입은 됐지만 토큰이 없어 온보딩 정보를 저장할 수 없습니다.');
                router.push('/login');
                return;
            }

            // 로컬 스토리지에 토큰 저장
            localStorage.setItem('accessToken', accessToken);

            // 🚀 [2차 호출] 온보딩 API (선호 정보 등록)
            // 이 요청은 "로그인 된 상태"로 보내야 하므로 헤더에 토큰을 넣습니다.
            const onboardingRes = await fetch('https://fit-me-up.p-e.kr/onboarding/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}` // 중요: 토큰 첨부!
                },
                body: JSON.stringify(onboardingData),
            });

            if (onboardingRes.ok) {
                alert('회원가입 및 취향 분석 완료!');
                router.push('/upload'); // 모든 과정 성공 시 이동
            } else {
                // 회원가입은 됐는데 온보딩만 실패한 경우
                console.error('온보딩 실패:', await onboardingRes.json());
                alert('회원가입은 성공했으나, 취향 정보 저장에 실패했습니다. 마이페이지에서 다시 설정해주세요.');
                router.push('/upload'); // 일단 이동은 시켜줌
            }

        } catch (err) {
            console.error(err);
            setApiError('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    // ▼ [추가] 일반 룩 체크박스 핸들러
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

    // ▼ [추가] '기타' 체크박스 핸들러
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

    // ▼ [추가] '모르겠음' 체크박스 핸들러
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

    // --- [추가/수정] 색상 핸들러 ---

    // 1. 일반 색상 선택
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setDontKnowColor(false); // 일반 색상 선택 시 '모르겠음' 해제
        if (checked) {
            setPreferredColors(prev => [...prev, value]);
        } else {
            setPreferredColors(prev => prev.filter(color => color !== value));
        }
    };

    // 2. 색상 '기타' 체크박스
    const handleOtherColorCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setIsOtherColorChecked(checked);
        if (checked) {
            setDontKnowColor(false);
        } else {
            setOtherColor(''); // 체크 해제 시 텍스트 초기화
        }
    };

    // 3. 색상 '직접 입력' 텍스트
    const handleOtherColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        setOtherColor(newText);
        if (newText) {
            setIsOtherColorChecked(true); // 입력 시 '기타' 자동 체크
            setDontKnowColor(false);
        }
    };

    // 4. 색상 '모르겠음' 체크박스
    const handleDontKnowColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setDontKnowColor(checked);
        if (checked) {
            setPreferredColors([]); // 일반 색상 초기화
            setIsOtherColorChecked(false); // 기타 체크 해제
            setOtherColor(''); // 입력 텍스트 초기화
        }
    };

    // ▼ [추가] 핏 핸들러

    // 1. 일반 핏 선택
    const handleFitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setDontKnowFit(false); // 일반 핏 선택 시 '모르겠음' 해제
        if (checked) {
            setPreferredFits(prev => [...prev, value]);
        } else {
            setPreferredFits(prev => prev.filter(fit => fit !== value));
        }
    };

    // 2. 핏 '모르겠음' 체크박스
    const handleDontKnowFitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setDontKnowFit(checked);
        if (checked) {
            setPreferredFits([]); // 일반 핏 초기화
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

                    {/* ▼ [추가] 비밀번호 불일치 에러 메시지 ▼ */}
                    {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}

                    {/* [추가] API 에러 메시지 표시 */}
                    {apiError && <p className={styles.errorMessage}>{apiError}</p>}

                    <input
                        type="text"
                        placeholder="이름"
                        className={styles.inputField}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    {/* ▼▼▼ [추가] 나이 및 성별 입력 ▼▼▼ */}
                    <div className={styles.inputGroup}>
                        <input
                            type="number"
                            placeholder="나이"
                            className={`${styles.inputField} ${styles.inputFieldHalf}`}
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                        />
                        {/* 성별 선택 (셀렉트 박스) */}
                        <select
                            className={`${styles.inputField} ${styles.inputFieldHalf}`}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="M">남성</option>
                            <option value="F">여성</option>
                        </select>
                    </div>

                    {/* ▼ [추가] 키 / 몸무게 입력란 ▼ */}
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

                    {/* ▼ [추가] 선호 룩 선택 ▼ */}
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
                            {/* ▼ [수정] '기타' 체크박스 (1열) ▼ */}
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

                            {/* ▼ [수정] '직접 입력' 필드 (2열) ▼ */}
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

                    {/* ▼▼▼ [수정] 선호하는 색상 섹션 ▼▼▼ */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>선호하는 색상 (중복 선택 가능)</h2>
                        <div className={styles.checkboxGrid}>
                            {colorOptions.map((color) => (
                                <label key={color.label} className={styles.checkboxWrapper}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkboxInput}
                                        value={color.label}
                                        checked={preferredColors.includes(color.label)}
                                        onChange={handleColorChange}
                                    />
                                    <span className={styles.colorCircle} style={{ backgroundColor: color.hex }}></span>
                                    <span>{color.label}</span>
                                </label>
                            ))}

                            {/* 색상 '기타' 체크박스 */}
                            <label className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    className={styles.checkboxInput}
                                    value="기타"
                                    checked={isOtherColorChecked}
                                    onChange={handleOtherColorCheckboxChange}
                                />
                                <span>기타</span>
                            </label>

                            {/* 색상 '직접 입력' 필드 */}
                            <div className={styles.otherInputWrapper}>
                                <input
                                    type="text"
                                    placeholder="직접 입력"
                                    className={styles.otherInput}
                                    value={otherColor}
                                    onChange={handleOtherColorInputChange}
                                />
                            </div>

                            {/* 색상 '모르겠음' 체크박스 */}
                            <label className={`${styles.checkboxWrapper} ${styles.fullWidth}`}>
                                <input
                                    type="checkbox"
                                    className={styles.checkboxInput}
                                    checked={dontKnowColor}
                                    onChange={handleDontKnowColorChange}
                                />
                                <span>모르겠음 (없음)</span>
                            </label>
                        </div>
                    </div>

                    {/* ▼▼▼ [추가] 3. 선호하는 핏 섹션 ▼▼▼ */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>선호하는 핏 (중복 선택 가능)</h2>
                        <div className={styles.checkboxGrid}>
                            {fitOptions.map((fit) => (
                                <label key={fit} className={styles.checkboxWrapper}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkboxInput}
                                        value={fit}
                                        checked={preferredFits.includes(fit)}
                                        onChange={handleFitChange}
                                    />
                                    <span>{fit}</span>
                                </label>
                            ))}

                            {/* 핏 '모르겠음' 체크박스 */}
                            <label className={`${styles.checkboxWrapper} ${styles.fullWidth}`}>
                                <input
                                    type="checkbox"
                                    className={styles.checkboxInput}
                                    checked={dontKnowFit}
                                    onChange={handleDontKnowFitChange}
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
