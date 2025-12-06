// 'use client';

// import { useState, useEffect } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import styles from './page.module.css';

// // TypeScript 인터페이스 정의 (백엔드 응답 구조에 맞춤)
// interface RecommendedItem {
//     id: number;
//     name: string;
//     image_url: string;
//     shop_link: string;
// }

// interface OutfitItem {
//     part: string;
//     celebrity_style: {
//         fit: string;
//         color: string;
//         style: string;
//         category: string;
//     };
//     recommended_clothes: RecommendedItem[];
// }

// interface Celebrity {
//     id: number;
//     name: string;
//     image_url: string;
// }

// interface RecommendationResponse {
//     user_id: number;
//     reference_outfit: {
//         items: OutfitItem[];
//         description: string;
//     };
//     matched_celebrity: Celebrity;
// }

// export default function ResultsPage() {
//     const searchParams = useSearchParams();
//     const router = useRouter();

//     // 이전에 upload 페이지에서 넘겨준 분석 결과 (체형, 퍼스널컬러 등)
//     // upload 페이지에서 'handleAnalysis' 성공 시 이 데이터를 query string으로 넘겨줬다고 가정
//     const dataString = searchParams.get('data');
//     const analysisResult = dataString ? JSON.parse(dataString) : {};

//     // 백엔드에서 받아올 추천 데이터 상태
//     const [recommendationData, setRecommendationData] = useState<RecommendationResponse | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchRecommendation = async () => {
//             const token = localStorage.getItem('accessToken');
//             if (!token) {
//                 alert('로그인이 필요합니다.');
//                 router.push('/login');
//                 return;
//             }

//             try {
//                 // 백엔드 추천 API 호출
//                 const res = await fetch('http://127.0.0.1:8000/recommendation/', {
//                     method: 'GET',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (res.ok) {
//                     const data: RecommendationResponse = await res.json();
//                     console.log('추천 데이터 수신 성공:', data);
//                     setRecommendationData(data);
//                 } else {
//                     console.error('추천 데이터 로드 실패');
//                     setError('추천 스타일을 불러오지 못했습니다.');
//                 }
//             } catch (err) {
//                 console.error('네트워크 에러:', err);
//                 setError('서버와 연결할 수 없습니다.');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchRecommendation();
//     }, [router]);

//     if (isLoading) {
//         return (
//             <main className={styles.mainContainer}>
//                 <div className={styles.loadingBox}>
//                     <h2>AI가 회원님에게 딱 맞는 스타일을 찾고 있어요...</h2>
//                     {/* 로딩 스피너 등을 넣으면 좋습니다 */}
//                 </div>
//             </main>
//         );
//     }

//     if (error || !recommendationData) {
//         return (
//             <main className={styles.mainContainer}>
//                 <div className={styles.errorBox}>
//                     <h2>오류 발생</h2>
//                     <p>{error || '데이터를 불러올 수 없습니다.'}</p>
//                     <button onClick={() => router.back()} className={styles.backButton}>뒤로 가기</button>
//                 </div>
//             </main>
//         );
//     }

//     // 데이터 구조 분해 할당
//     const { matched_celebrity, reference_outfit } = recommendationData;

//     // 추천 아이템 리스트 추출 (상의, 하의 등 모든 파트의 추천 아이템을 하나의 배열로 합침)
//     const allRecommendedItems = reference_outfit.items.flatMap(item => item.recommended_clothes);

//     return (
//         <main className={styles.mainContainer}>
//             <div className={styles.contentWrapper}>
//                 <h1 className={styles.pageTitle}>AI 스타일 분석 결과</h1>

//                 {/* 1. 분석 결과 요약 (이전 페이지에서 넘겨받은 데이터 활용) */}
//                 <div className={styles.summaryBox}>
//                     <p>
//                         {'회원님은 '}
//                         <strong>{analysisResult.faceShape || '분석된 얼굴형'}</strong>
//                         {'과 '}
//                         <strong>{analysisResult.bodyShape || '분석된 체형'}</strong>
//                         {'을 가지셨으며, '}
//                         <strong>{analysisResult.personalColor || '퍼스널 컬러'}</strong>
//                         {'에 가장 잘 어울리는 스타일을 추천해 드려요.'}
//                     </p>
//                 </div>

//                 {/* 2. 매칭된 연예인 정보 & 스타일 설명 */}
//                 <div className={styles.celebritySection}>
//                     <div className={styles.celebImageWrapper}>
//                         {/* 연예인 이미지 (없으면 기본 이미지 처리 필요) */}
//                         <img
//                             src={matched_celebrity.image_url || '/placeholder-celeb.jpg'}
//                             alt={matched_celebrity.name}
//                             className={styles.celebImage}
//                         />
//                     </div>
//                     <div className={styles.celebInfo}>
//                         <h2>비슷한 스타일의 셀럽: <span>{matched_celebrity.name}</span></h2>
//                         <p className={styles.outfitDescription}>
//                             "{reference_outfit.description}"
//                         </p>
//                         <div className={styles.styleTags}>
//                             {/* 스타일 태그 보여주기 (예시: 상의/하의 스타일 정보 활용) */}
//                             {reference_outfit.items.map((item, index) => (
//                                 <span key={index} className={styles.tag}>
//                                     #{item.celebrity_style.color} {item.celebrity_style.category}
//                                 </span>
//                             ))}
//                         </div>
//                     </div>
//                 </div>

//                 {/* 3. 추천 아이템 그리드 */}
//                 <h2 className={styles.gridTitle}>추천 아이템</h2>
//                 <div className={styles.resultsGrid}>
//                     {allRecommendedItems.map((item) => (
//                         <div key={item.id} className={styles.card}>
//                             {/* 쇼핑몰 링크로 이동하도록 a 태그로 감쌈 */}
//                             <a href={item.shop_link} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
//                                 <div className={styles.imageContainer}>
//                                     <img src={item.image_url} alt={item.name} className={styles.cardImage} />
//                                 </div>
//                                 <div className={styles.cardContent}>
//                                     <h3 className={styles.cardTitle}>{item.name}</h3>
//                                     {/* 상세 설명이 API에 없으므로 간단히 이름만 표시하거나, 
//                                         상위 items 정보를 활용해 'Minimal White Shirt' 같이 조합 가능 */}
//                                     <span className={styles.shopNow}>구매하러 가기 &rarr;</span>
//                                 </div>
//                             </a>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </main>
//     );
// }






// 'use client';

// import { useState, useEffect } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import styles from './page.module.css';

// // --- 인터페이스 정의 ---
// interface RecommendedItem {
//     id: number;
//     name: string;
//     image_url: string;
//     shop_link: string;
// }

// interface OutfitItem {
//     part: string;
//     celebrity_style: {
//         fit: string;
//         color: string;
//         style: string;
//         category: string;
//     };
//     recommended_clothes: RecommendedItem[];
// }

// interface Celebrity {
//     id: number;
//     name: string;
//     image_url: string;
// }

// interface RecommendationResponse {
//     user_id: number;
//     reference_outfit: {
//         items: OutfitItem[];
//         description: string;
//     };
//     matched_celebrity: Celebrity;
// }

// // ▼▼▼ [디자인 확인용 더미 데이터] ▼▼▼
// const DUMMY_RESPONSE: RecommendationResponse = {
//     user_id: 1,
//     matched_celebrity: {
//         id: 11,
//         name: "정해인",
//         // 실제 존재하는 이미지 URL 또는 public 폴더의 이미지 경로를 넣으세요
//         image_url: "https://image.msscdn.net/images/goods_img/20210826/2089220/2089220_17173864760680_big.jpg"
//     },
//     reference_outfit: {
//         description: "화이트 셔츠와 블랙 슬랙스로 연출한 깔끔한 미니멀 룩입니다.",
//         items: [
//             {
//                 part: "top",
//                 celebrity_style: { fit: "regular", color: "white", style: "minimal", category: "shirt" },
//                 recommended_clothes: [
//                     {
//                         id: 10,
//                         name: "화이트 오버핏 옥스포드 셔츠",
//                         // 이전에 public 폴더에 넣은 이미지나 외부 링크 사용
//                         image_url: "https://image.msscdn.net/images/goods_img/20220228/2388326/2388326_1_500.jpg",
//                         shop_link: "https://www.musinsa.com"
//                     }
//                 ]
//             },
//             {
//                 part: "bottom",
//                 celebrity_style: { fit: "slim", color: "black", style: "minimal", category: "pants" },
//                 recommended_clothes: [
//                     {
//                         id: 21,
//                         name: "세미 와이드 히든 밴딩 슬랙스",
//                         image_url: "https://image.msscdn.net/images/goods_img/20220817/2717088/2717088_16938928092778_500.jpg",
//                         shop_link: "https://www.musinsa.com"
//                     },
//                     {
//                         id: 22,
//                         name: "원턱 와이드 치노 팬츠",
//                         image_url: "https://image.msscdn.net/images/goods_img/20210222/1811342/1811342_1_500.jpg",
//                         shop_link: "https://www.musinsa.com"
//                     }
//                 ]
//             }
//         ]
//     }
// };

// export default function ResultsPage() {
//     const searchParams = useSearchParams();
//     const router = useRouter();

//     const dataString = searchParams.get('data');
//     const analysisResult = dataString ? JSON.parse(dataString) : {
//         faceShape: '계란형', bodyShape: '역삼각형', personalColor: '가을 웜톤'
//     };

//     const [recommendationData, setRecommendationData] = useState<RecommendationResponse | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         // ▼▼▼ API 호출 대신 더미 데이터를 바로 세팅 ▼▼▼

//         // 0.5초 뒤에 데이터가 로딩된 것처럼 연출
//         setTimeout(() => {
//             setRecommendationData(DUMMY_RESPONSE);
//             setIsLoading(false);
//         }, 500);

//         /* // --- 나중에 백엔드 연결할 때 아래 주석을 푸세요 ---
//         const fetchRecommendation = async () => {
//             const token = localStorage.getItem('accessToken');
//             if (!token) {
//                 alert('로그인이 필요합니다.');
//                 router.push('/login');
//                 return;
//             }
//             try {
//                 const res = await fetch('http://127.0.0.1:8000/recommendation/', {
//                     method: 'GET',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 });
//                 if (res.ok) {
//                     const data = await res.json();
//                     setRecommendationData(data);
//                 } else {
//                     setError('데이터 로드 실패');
//                 }
//             } catch (err) {
//                 setError('서버 연결 실패');
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchRecommendation();
//         */

//     }, [router]);

//     if (isLoading) {
//         return (
//             <main className={styles.mainContainer}>
//                 <div className={styles.loadingBox}>
//                     <h2>AI가 스타일을 분석 중입니다...</h2>
//                 </div>
//             </main>
//         );
//     }

//     if (error || !recommendationData) {
//         return (
//             <main className={styles.mainContainer}>
//                 <div className={styles.errorBox}>
//                     <h2>오류 발생</h2>
//                     <p>{error}</p>
//                 </div>
//             </main>
//         );
//     }

//     const { matched_celebrity, reference_outfit } = recommendationData;
//     // 추천 아이템 리스트 평탄화 (모든 옷을 하나의 리스트로)
//     const allRecommendedItems = reference_outfit.items.flatMap(item => item.recommended_clothes);

//     return (
//         <main className={styles.mainContainer}>
//             <div className={styles.contentWrapper}>
//                 <h1 className={styles.pageTitle}>AI 스타일 분석 결과</h1>

//                 {/* 1. 분석 요약 */}
//                 <div className={styles.summaryBox}>
//                     <p>
//                         {'회원님은 '}
//                         <strong>{analysisResult.faceShape || '분석된 얼굴형'}</strong>
//                         {'과 '}
//                         <strong>{analysisResult.bodyShape || '분석된 체형'}</strong>
//                         {'을 가지셨으며, '}
//                         <strong>{analysisResult.personalColor || '퍼스널 컬러'}</strong>
//                         {'에 가장 잘 어울리는 스타일을 추천해 드려요.'}
//                     </p>
//                 </div>

//                 {/* 2. 연예인 매칭 섹션 */}
//                 <div className={styles.celebritySection}>
//                     <div className={styles.celebImageWrapper}>
//                         <img
//                             src={matched_celebrity.image_url}
//                             alt={matched_celebrity.name}
//                             className={styles.celebImage}
//                         />
//                     </div>
//                     <div className={styles.celebInfo}>
//                         <h2>비슷한 스타일의 셀럽: <span>{matched_celebrity.name}</span></h2>
//                         <p className={styles.outfitDescription}>
//                             "{reference_outfit.description}"
//                         </p>
//                         <div className={styles.styleTags}>
//                             {reference_outfit.items.map((item, index) => (
//                                 <span key={index} className={styles.tag}>
//                                     #{item.celebrity_style.color} {item.celebrity_style.category}
//                                 </span>
//                             ))}
//                         </div>
//                     </div>
//                 </div>

//                 {/* 3. 추천 아이템 그리드 */}
//                 <h2 className={styles.gridTitle}>추천 아이템</h2>
//                 <div className={styles.resultsGrid}>
//                     {allRecommendedItems.map((item) => (
//                         <div key={item.id} className={styles.card}>
//                             <a href={item.shop_link} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
//                                 <div className={styles.imageContainer}>
//                                     <img src={item.image_url} alt={item.name} className={styles.cardImage} />
//                                 </div>
//                                 <div className={styles.cardContent}>
//                                     <h3 className={styles.cardTitle}>{item.name}</h3>
//                                     <span className={styles.shopNow}>구매하러 가기 &rarr;</span>
//                                 </div>
//                             </a>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </main>
//     );
// }









'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './page.module.css';

// --- [수정] 새로운 API 응답 구조에 맞춘 인터페이스 정의 ---
interface ItemDetail {
    name: string;
    image_url: string;
    shop_link: string;
    similarity: number; // 추천 유사도 필드 추가
}

interface RecommendationItem {
    category: string;
    items: ItemDetail[];
}

interface UserAnalysis {
    face_shape: string;
    body_shape: string;
    skin_tone: string;
}

interface MatchedCelebrity {
    id: number;
    name: string;
    gender: string;
    face_shape: string;
    body_shape: string;
    skin_tone: string;
    similarity: number;
}

interface RecommendationResponse {
    matched_celebrity: MatchedCelebrity;
    user_analysis: UserAnalysis;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recommendation_request: any; // 사용하지 않으므로 간단히 any 처리
    needs: string;
    summary: string;
    recommendations: RecommendationItem[];
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // 이제 분석 결과는 API에서 가져오므로, searchParams는 더 이상 주된 용도가 아닙니다.
    // 다만, API 호출이 실패했을 때를 대비하여 기본값은 유지합니다.
    const dataString = searchParams.get('data');
    const initialAnalysis = dataString ? JSON.parse(dataString) : {
        faceShape: '분석 중', bodyShape: '분석 중', personalColor: '분석 중'
    };

    const [recommendationData, setRecommendationData] = useState<RecommendationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecommendation = async () => {
            const token = localStorage.getItem('accessToken');
            const API_URL = 'https://fit-me-up.p-e.kr/recommendation/final/';

            if (!token) {
                alert('로그인이 필요합니다.');
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(API_URL, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (res.ok) {
                    const data: RecommendationResponse = await res.json();
                    setRecommendationData(data);
                } else {
                    const err = await res.json();
                    setError(`데이터 로드 실패: ${err.detail || res.statusText}`);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError('서버 연결 실패');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecommendation();
    }, [router]);


    if (isLoading) {
        return (
            <main className={styles.mainContainer}>
                <div className={styles.loadingBox}>
                    <h2>AI가 스타일을 분석 중입니다...</h2>
                    <p>잠시만 기다려주세요.</p>
                </div>
            </main>
        );
    }

    if (error || !recommendationData) {
        return (
            <main className={styles.mainContainer}>
                <div className={styles.errorBox}>
                    <h2>오류 발생</h2>
                    <p>{error || '추천 데이터를 가져오지 못했습니다.'}</p>
                    <button className={styles.retryButton} onClick={() => router.push('/upload')}>다시 분석하기</button>
                </div>
            </main>
        );
    }

    const { matched_celebrity, user_analysis, summary, recommendations, needs } = recommendationData;

    // 추천 아이템 리스트 평탄화 (모든 카테고리의 아이템을 하나의 리스트로)
    const allRecommendedItems = recommendations.flatMap(rec => rec.items);

    // [수정] API의 분석 결과를 사용합니다.
    const analysisResult = {
        faceShape: user_analysis.face_shape || initialAnalysis.faceShape,
        bodyShape: user_analysis.body_shape || initialAnalysis.bodyShape,
        personalColor: user_analysis.skin_tone || initialAnalysis.personalColor,
    };

    // API에서 받은 영어 key를 보기 좋은 한글로 변환하는 간단한 맵 (선택사항)
    const displayMap = {
        'round': '둥근형', 'inverted_triangle': '역삼각형', 'light_warm': '밝은 웜톤',
        'top': '상의', 'bottom': '하의', 'short_sleeve': '반팔', 'tshirt': '티셔츠',
        'outer': '아우터'
        // 필요한 다른 값들도 여기에 추가하세요
    };

    const getDisplayValue = (key: string) => displayMap[key] || key;


    return (
        <main className={styles.mainContainer}>
            <div className={styles.contentWrapper}>
                <h1 className={styles.pageTitle}>AI 스타일 분석 결과</h1>

                {/* 1. 분석 요약 */}
                <div className={styles.summaryBox}>
                    <p>
                        {'회원님은 '}
                        <strong>{getDisplayValue(analysisResult.faceShape)}</strong>
                        {'과 '}
                        <strong>{getDisplayValue(analysisResult.bodyShape)}</strong>
                        {'을 가지셨으며, '}
                        <strong>{getDisplayValue(analysisResult.personalColor)}</strong>
                        {'에 가장 잘 어울리는 스타일을 추천해 드려요.'}
                    </p>
                    {/* <p className={styles.needsText}>
                        **고려된 요청:** {needs}
                    </p> */}
                </div>

                {/* 2. 연예인 매칭 섹션 */}
                <div className={styles.celebritySection}>
                    {/* API 응답에 matched_celebrity의 image_url이 없으므로, 더미 URL을 사용하거나 나중에 추가해야 합니다. 
                       현재 API 응답에는 image_url 필드가 없습니다.
                       일단 matched_celebrity.name만 보여줍니다.
                    */}
                    <div className={styles.celebInfo}>
                        <h2 className={styles.celebTitle}>비슷한 스타일의 셀럽: <span>{matched_celebrity.name}</span></h2>
                        <p className={styles.outfitSummary}>
                            {'추천 코디 요약:'} "{summary}"
                        </p>


                        <div className={styles.styleTags}>
                            {/* API 응답에 celebrity_style.color/category가 없으므로, summary와 needs를 기반으로 출력합니다. */}
                            {recommendationData.recommendation_request.main_categories.map((cat, index) => (
                                <span key={index} className={styles.tag}>
                                    # {getDisplayValue(cat)}
                                </span>
                            ))}
                            <span className={styles.tag}>
                                # {matched_celebrity.gender}
                            </span>
                            <span className={styles.tag}>
                                # {getDisplayValue(matched_celebrity.face_shape)}
                            </span>
                        </div>

                    </div>
                    <div className={styles.celebImageWrapper}>
                        {/* API 응답에 연예인 이미지 URL이 없으므로, 나중에 추가해야 합니다. */}
                        <div className={styles.noImagePlaceholder}>
                            {matched_celebrity.name} 이미지 (API에 없음)
                        </div>
                    </div>
                </div>

                {/* <div className={styles.needsSection}>
                    <h2 className={styles.sectionTitle}>추천을 위한 상세 분석</h2>
                    <div className={styles.detailBox}>
                        <p><strong>얼굴형:</strong> {getDisplayValue(user_analysis.face_shape)} (참고 셀럽: {matched_celebrity.face_shape === user_analysis.face_shape ? '일치' : matched_celebrity.face_shape})</p>
                        <p><strong>체형:</strong> {getDisplayValue(user_analysis.body_shape)} (참고 셀럽: {matched_celebrity.body_shape === user_analysis.body_shape ? '일치' : matched_celebrity.body_shape})</p>
                        <p><strong>퍼스널 컬러:</strong> {getDisplayValue(user_analysis.skin_tone)} (참고 셀럽: {matched_celebrity.skin_tone === user_analysis.skin_tone ? '일치' : matched_celebrity.skin_tone})</p>
                    </div>
                </div> */}

                {/* 3. 추천 아이템 그리드 */}
                <h2 className={styles.gridTitle}>추천 아이템</h2>

                <div className={styles.resultsGrid}>
                    {allRecommendedItems.map((item) => (
                        <div key={item.name + item.shop_link} className={styles.card}>
                            <a href={item.shop_link} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
                                <div className={styles.imageContainer}>
                                    <img src={item.image_url} alt={item.name} className={styles.cardImage} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{item.name}</h3>
                                    <p className={styles.similarityText}>유사도: **{(item.similarity * 100).toFixed(1)}%**</p>
                                    <span className={styles.shopNow}>구매하러 가기 &rarr;</span>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>

                {allRecommendedItems.length === 0 && (
                    <p className={styles.noResults}>현재 조건에 맞는 추천 아이템이 없습니다.</p>
                )}

            </div>
        </main>
    );
}

export default function ResultsPage() {
    return (
        <main className={styles.mainContainer}>
            <Suspense fallback={<div className={styles.loadingBox}><h2>로딩 중...</h2></div>}>
                <ResultsContent />
            </Suspense>
        </main>
    );
}