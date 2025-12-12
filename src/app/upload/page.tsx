'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface UploadBoxProps {
    title: string;
    file: File | null;
    setFile: (file: File | null) => void;
    onGuideClick: () => void; // ★ 추가된 부분
}

// ... (UploadBox 컴포넌트는 이전과 동일)
function UploadBox({ title, file, setFile, onGuideClick }: UploadBoxProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleBoxClick = () => {
        inputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className={styles.uploadBox}>
            <h2 className={styles.boxTitle}>{title}</h2>
            <div
                className={styles.dropZone}
                onClick={handleBoxClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input type="file" accept="image/*" ref={inputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                {file ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" className={styles.previewImage} />
                ) : (
                    <div className={styles.prompt}>
                        <p>이곳을 클릭하거나<br />사진을 드래그 앤 드롭하세요</p>
                        <span
                            className={styles.guidelineLink}
                            onClick={(e) => {
                                e.stopPropagation(); // 중요: 부모의 click 이벤트(파일선택) 막기
                                onGuideClick();      // 가이드라인 팝업 열기
                            }}
                        >
                            사진 가이드라인 보기
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// 옷 종류 데이터 구조
const clothingData = {
    '상의': ['반팔티', '맨투맨', '니트', '셔츠', '후드티', '민소매'],
    '하의': ['스웨트 팬츠', '데님 팬츠', '슬랙스', '카고 팬츠'],
    '아우터': ['가디건', '자켓', '패딩', '코트', '바람막이', '블레이저']
};
const mainCategories = Object.keys(clothingData);



// 한글 -> 영어 변환 맵
const categoryMap: { [key: string]: string } = {
    // 메인 카테고리
    '상의': 'top',
    '하의': 'bottom',
    '아우터': 'outer',

    // 서브 카테고리 (상의)
    '반팔티': 'tshirt',
    '맨투맨': 'sweatshirt',
    '니트': 'knit',
    '셔츠': 'shirt',
    '후드티': 'hoodie',
    '민소매': 'sleeveless',

    // 서브 카테고리 (하의)
    '스웨트 팬츠': 'sweatpants',
    '데님 팬츠': 'jeans',
    '슬랙스': 'slacks',
    '카고 팬츠': 'cargo pants',

    // 서브 카테고리 (아우터)
    '가디건': 'cardigan',
    '자켓': 'jacket',
    '패딩': 'parka',
    '코트': 'coat',
    '바람막이': 'windbreaker',
    '블레이저': 'blazer',
};

function GuidelineModal({ type, onClose }: { type: 'face' | 'body'; onClose: () => void }) {
    const isFace = type === 'face';

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.modalTitle}>
                    {isFace ? '얼굴 사진 가이드라인' : '전신 사진 가이드라인'}
                </h3>
                <ul className={styles.modalList}>
                    {isFace ? (
                        <>
                            <li>마스크나 선글라스를 벗고 <strong>정면</strong>을 응시해주세요.</li>
                            <li><strong>조명이 밝은 곳</strong>에서 촬영된 선명한 사진이 좋습니다.</li>
                            <li>얼굴이 너무 작게 나오거나 흔들린 사진은 피해주세요.</li>
                            <li>본인의 피부톤과 얼굴형이 잘 드러나는 사진을 권장합니다.</li>
                        </>
                    ) : (
                        <>
                            <li>머리부터 발끝까지 나오는 <strong>전신 사진</strong>을 올려주세요.</li>
                            <li>몸의 실루엣이 드러나는 옷(달라붙는 옷)을 입으면 분석이 더 정확합니다.</li>
                            <li>두꺼운 패딩이나 코트는 체형 분석을 방해할 수 있습니다.</li>
                            <li>바른 자세로 서서 정면을 보고 촬영해주세요.</li>
                        </>
                    )}
                </ul>
                <button className={styles.closeButton} onClick={onClose}>확인했습니다</button>
            </div>
        </div>
    );
}



export default function UploadPage() {
    const router = useRouter();
    const [faceFile, setFaceFile] = useState<File | null>(null);
    const [bodyFile, setBodyFile] = useState<File | null>(null);

    const [activeGuide, setActiveGuide] = useState<'face' | 'body' | null>(null);

    // State 변경: 선택 항목을 객체로 관리
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: string | null }>({});
    const [situationPrompt, setSituationPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // 버튼 활성화 조건: 최소 1개의 서브 카테고리가 선택되었는지 확인
    // const isSelectionMade = Object.values(selectedItems).some(subCat => subCat !== null);
    const isButtonDisabled = !faceFile || !bodyFile || isLoading;

    // 메인 카테고리 토글(On/Off) 핸들러
    const handleMainCategoryToggle = (category: string) => {
        setSelectedItems(prev => {
            const newItems = { ...prev };
            if (newItems.hasOwnProperty(category)) {
                // 이미 선택된(활성화된) 상태면, 항목 자체를 삭제 (토글 Off)
                delete newItems[category];
            } else {
                // 비활성화 상태면, 항목을 추가하고 서브 카테고리는 null로 설정 (토글 On)
                newItems[category] = null;
            }
            return newItems;
        });
    };

    // 서브 카테고리 선택 핸들러
    const handleSubCategorySelect = (mainCat: string, subCat: string) => {
        setSelectedItems(prev => ({
            ...prev,
            // 해당 메인 카테고리의 값으로 서브 카테고리를 할당
            // 이미 선택된 서브 카테고리를 다시 누르면 null로 변경 (선택 해제)
            [mainCat]: prev[mainCat] === subCat ? null : subCat
        }));
    };

    const handleAnalysis = async () => {
        if (isButtonDisabled) return;
        setIsLoading(true);
        setApiError('');

        // 브라우저에 저장된 토큰 가져오기
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setApiError('로그인이 필요합니다. 다시 로그인해주세요.');
            setIsLoading(false);
            router.push('/login'); // 로그인 페이지로 쫓아내기
            return;
        }

        try {
            // 사진 업로드 및 분석 요청
            const formData = new FormData();
            formData.append('face_image', faceFile!);
            formData.append('body_image', bodyFile!);

            const imageRes = await fetch('https://fit-me-up.p-e.kr/account/images/analyze-upload/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!imageRes.ok) {
                const err = await imageRes.json();
                throw new Error(err.detail || '사진 분석 요청 실패');
            }

            const imageResponseData = await imageRes.json();
            const analysisData = imageResponseData.analysis; // 분석 결과 (체형, 퍼스널컬러 등)


            // 온보딩(선호도/상황) 정보 저장 요청
            // selectedItems 상태를 백엔드 요구 포맷(Array)으로 변환
            // 한글 선택값을 영어 코드로 변환
            const mainCatsArray = Object.keys(selectedItems).map(korName => {
                return categoryMap[korName] || korName; // 맵에 없으면 그냥 한글 보냄
            });

            const subCatsArray = Object.values(selectedItems)
                .filter(val => val !== null)
                .map(korName => {
                    return categoryMap[korName!] || korName;
                });

            // 메인 카테고리가 있을 때만 API 호출 (없으면 건너뜀)

            const preferenceBody = {
                main_categories: mainCatsArray,
                sub_categories: subCatsArray,
                situation: situationPrompt
            };

            console.log("온보딩 전송 데이터:", preferenceBody);

            const prefRes = await fetch('https://fit-me-up.p-e.kr/recommendation/requests/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferenceBody),
            });

            if (!prefRes.ok) {
                // 선택을 했는데 에러가 난 경우는 로그만 찍고 넘어감 (사용자를 막지 않음)
                const err = await prefRes.json();
                console.error('온보딩 저장 실패 (무시하고 진행):', err);
            } else {
                console.log('온보딩 정보 저장 완료');
            }



            // 결과 페이지로 데이터 전달 및 이동
            // 프론트에서 보여줄용 문자열 생성
            const selectionString = Object.entries(selectedItems)
                .filter(([_, subCat]) => subCat !== null)
                .map(([mainCat, subCat]) => `${mainCat}: ${subCat}`)
                .join(', ');

            const resultToPass = {
                faceShape: analysisData.face_shape,
                bodyShape: analysisData.body_shape,
                personalColor: analysisData.skin_tone,
                clothingType: selectionString,
                situation: situationPrompt
            };

            const queryString = new URLSearchParams({ data: JSON.stringify(resultToPass) }).toString();
            router.push(`/results?${queryString}`);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            setApiError(err.message || '서버 통신 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.contentWrapper}>
                <h1 className={styles.pageTitle}>스타일 분석하기</h1>
                <p className={styles.pageSubtitle}>
                    가이드라인에 맞게 사진을 올려주세요.<br />
                    원하시는 옷 카테고리나 상황(장소)이 있다면 선택 및 입력해주세요.
                </p>

                <div className={styles.uploadArea}>
                    <UploadBox title="얼굴 사진" file={faceFile} setFile={setFaceFile} onGuideClick={() => setActiveGuide('face')} />
                    <UploadBox title="전신 사진" file={bodyFile} setFile={setBodyFile} onGuideClick={() => setActiveGuide('body')} />
                </div>

                <div className={styles.selectionArea}>
                    <h2 className={styles.selectionTitle}>1. 메인 카테고리</h2>
                    <p className={styles.selectionSubtitle}>분석을 원하는 카테고리를 모두 선택하세요.</p>
                    {/* mainTypeButtons 클래스 적용 */}
                    <div className={styles.mainTypeButtons}>
                        {mainCategories.map((type) => (
                            <button
                                key={type}
                                // 선택 확인 로직 변경
                                className={`${styles.typeButton} ${selectedItems.hasOwnProperty(type) ? styles.selected : ''}`}
                                onClick={() => handleMainCategoryToggle(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 활성화된 메인 카테고리별로 서브 카테고리 목록을 별도 렌더링 */}
                {Object.keys(selectedItems).map((mainCat) => (
                    <div key={mainCat} className={styles.selectionArea}>
                        <h2 className={styles.selectionTitle_Sub}>{mainCat} 세부 선택</h2>
                        <div className={styles.typeButtons}>
                            {clothingData[mainCat].map((subCat) => (
                                <button
                                    key={subCat}
                                    className={`${styles.typeButton} ${selectedItems[mainCat] === subCat ? styles.selected : ''}`}
                                    onClick={() => handleSubCategorySelect(mainCat, subCat)}
                                >
                                    {subCat}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* 상황 프롬프트 입력란 */}
                <div className={styles.selectionArea}>
                    <h2 className={styles.selectionTitle_Optional}>2. 상황 및 장소</h2>
                    <p className={styles.selectionSubtitle}>추천받고 싶은 특정 상황이나 장소를 입력하세요.</p>
                    <input
                        type="text"
                        className={styles.promptInput}
                        placeholder="예: 소개팅, 데이트, 면접, 휴양지 등"
                        value={situationPrompt}
                        onChange={(e) => setSituationPrompt(e.target.value)}
                    />
                </div>

                {/* API 에러 메시지 표시 (버튼 위) */}
                {apiError && <p className={styles.errorMessage}>{apiError}</p>}

                <div className={styles.privacyNotice}>
                    🔒 업로드된 사진은 AI 스타일 분석 목적으로만 사용되며, 분석 완료 후 즉시 파기됩니다.
                </div>

                <button
                    className={styles.submitButton}
                    disabled={isButtonDisabled}
                    onClick={handleAnalysis}
                >
                    {isLoading ? '분석 중...' : '분석 시작하기'}
                </button>
            </div>

            {activeGuide && (
                <GuidelineModal
                    type={activeGuide}
                    onClose={() => setActiveGuide(null)}
                />
            )}
        </main>
    );
}