import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // 1) Find Next's existing file loader for SVGs
    const fileLoaderRule = config.module.rules.find(
      (rule: any) => 
        rule.test instanceof RegExp && rule.test.test(".svg")
    );

    // 2) Tell it to ignore .svg (so SVGR can handle them)
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // 3) Add SVGR for JS/TS imports
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;