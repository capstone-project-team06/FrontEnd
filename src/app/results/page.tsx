'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './page.module.css';

// --- 새로운 API 응답 구조에 맞춘 인터페이스 정의 ---
interface ItemDetail {
    name: string;
    image_url: string;
    shop_link: string;
    similarity: number; // 추천 유사도 필드
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

    // API의 분석 결과를 사용
    const analysisResult = {
        faceShape: user_analysis.face_shape || initialAnalysis.faceShape,
        bodyShape: user_analysis.body_shape || initialAnalysis.bodyShape,
        personalColor: user_analysis.skin_tone || initialAnalysis.personalColor,
    };

    // API에서 받은 영어 key를 보기 좋은 한글로 변환하는 간단한 맵
    const displayMap = {
        'round': '둥근형', 'inverted_triangle': '역삼각형', 'light_warm': '밝은 웜톤',
        'top': '상의', 'bottom': '하의', 'short_sleeve': '반팔', 'tshirt': '티셔츠',
        'outer': '아우터'
        // 필요한 다른 값들도 여기에 추가
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
                    {/* API 응답에 matched_celebrity의 image_url 나중에 추가 */}
                    <div className={styles.celebInfo}>
                        <h2 className={styles.celebTitle}>비슷한 스타일의 셀럽: <span>{matched_celebrity.name}</span></h2>
                        {/* <p className={styles.outfitSummary}>
                            {'추천 코디 요약:'} "{summary}"
                        </p> */}

                        {/* <div className={styles.styleTags}>
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
                        </div> */}

                    </div>
                    <div className={styles.celebImageWrapper}>
                        {/* API 응답에 연예인 이미지 URL이 없으므로, 나중에 추가 */}
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
                                    <p className={styles.similarityText}>유사도: {(item.similarity * 100).toFixed(1)}%</p>
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