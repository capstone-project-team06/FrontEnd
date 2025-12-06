import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 빌드 중에 ESLint 오류를 무시함
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 중에 TypeScript 타입 오류를 무시함 (선택 사항)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
