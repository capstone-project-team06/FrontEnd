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
    image_url: string;
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
                    <h2>스타일을 분석 중입니다...</h2>
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
    // const allRecommendedItems = recommendations.flatMap(rec => rec.items);



    // API의 분석 결과를 사용
    const analysisResult = {
        faceShape: user_analysis.face_shape || initialAnalysis.faceShape,
        bodyShape: user_analysis.body_shape || initialAnalysis.bodyShape,
        personalColor: user_analysis.skin_tone || initialAnalysis.personalColor,
    };

    // API에서 받은 영어 key를 한글로 변환하는 맵
    const displayMap: { [key: string]: string } = {
        // --- 체형 (Body Shape) ---
        'inverted_triangle': '역삼각형',
        'triangle': '삼각형',
        'hourglass': '모래시계형',
        'rectangle': '직사각형',
        'balanced': '균형 잡힌',

        // --- 얼굴형 (Face Shape) ---
        'oval': '계란형',
        'round': '둥근형',
        'square': '각진형(사각형)',
        'heart': '하트형',
        'oblong': '긴',

        // --- 피부톤 조합 (Skin Depth + Undertone) ---
        // Light (밝은)
        'light_warm': '밝은 웜톤',
        'light_cool': '밝은 쿨톤',
        'light_neutral': '밝은 뉴트럴톤',
        'light_unknown': '밝은 톤',

        // Medium (중간)
        'medium_warm': '중간 웜톤',
        'medium_cool': '중간 쿨톤',
        'medium_neutral': '중간 뉴트럴톤',
        'medium_unknown': '중간 톤',

        // Deep (어두운)
        'deep_warm': '어두운 웜톤',
        'deep_cool': '어두운 쿨톤',
        'deep_neutral': '어두운 뉴트럴톤',
        'deep_unknown': '어두운 톤',

        'unknown_warm': '웜톤',
        'unknown_cool': '쿨톤',
        'unknown_neutral': '뉴트럴톤',
        'unknown_unknown': '알 수 없음',

        // --- 공통/기타 ---
        'unknown': '알 수 없음',
        'top': '상의',
        'bottom': '하의',
        'outer': '아우터'
    };

    const getDisplayValue = (key: string) => displayMap[key] || key;


    return (
        <main className={styles.mainContainer}>
            <div className={styles.contentWrapper}>
                <h1 className={styles.pageTitle}>스타일 분석 결과</h1>

                {/* 1. 분석 요약 */}
                <div className={styles.summaryBox}>
                    <p>
                        {'회원님은 '}
                        <strong>{getDisplayValue(analysisResult.faceShape)}</strong>
                        {' 얼굴과 '}
                        <strong>{getDisplayValue(analysisResult.bodyShape)}</strong>
                        {' 체형을 가지셨으며, '}
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
                        {matched_celebrity.image_url ? (
                            <img
                                src={matched_celebrity.image_url}
                                alt={matched_celebrity.name}
                                className={styles.celebImage}
                                onError={(e) => {
                                    // 이미지 로드 실패 시 대체 이미지 혹은 텍스트 표시
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    // 부모 요소에 '이미지 없음' 텍스트를 보여주려면 추가 로직 필요하지만, 일단 숨김 처리
                                }}
                            />
                        ) : (
                            <div className={styles.noImagePlaceholder}>
                                {matched_celebrity.name}
                            </div>
                        )}
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
                {/* <h2 className={styles.gridTitle}>추천 아이템</h2> */}

                {recommendations.map((group, groupIndex) => {
                    // 해당 카테고리에 아이템이 없으면 렌더링하지 않음
                    if (group.items.length === 0) return null;

                    return (
                        <div key={group.category + groupIndex} className={styles.categoryGroup}>
                            {/* 카테고리 제목 (예: 상의 추천) */}
                            <h2 className={styles.gridTitle}>
                                {getDisplayValue(group.category)} 추천
                            </h2>

                            {/* 해당 카테고리의 아이템 그리드 */}
                            <div className={styles.resultsGrid}>
                                {group.items.map((item, idx) => (
                                    <div key={`${item.name}-${idx}`} className={styles.card}>
                                        <a href={item.shop_link} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
                                            <div className={styles.imageContainer}>
                                                <img src={item.image_url} alt={item.name} className={styles.cardImage} />
                                            </div>
                                            <div className={styles.cardContent}>
                                                <h3 className={styles.cardTitle}>{item.name}</h3>
                                                <p className={styles.similarityText}>
                                                    {/* 유사도: {item.similarity > 1 ? item.similarity : (item.similarity * 100).toFixed(1)}% */}
                                                </p>
                                                <span className={styles.shopNow}>구매하러 가기 &rarr;</span>
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* 전체 추천 아이템이 하나도 없을 경우 */}
                {recommendations.every(r => r.items.length === 0) && (
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