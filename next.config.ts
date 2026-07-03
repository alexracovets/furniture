import path from 'node:path';

import type { NextConfig } from 'next';

/** Single ESM entry — prevents CJS + ESM duplicates that trigger window.__THREE__ warning. */
const threeModulePath = './node_modules/three/build/three.module.js';
const threeExamplesPath = './node_modules/three/examples/jsm';
const threeWebpackAlias = path.join(process.cwd(), 'node_modules/three/build/three.module.js');
const threeExamplesWebpackAlias = path.join(process.cwd(), 'node_modules/three/examples/jsm');

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'three-stdlib'],
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei', 'three-stdlib'],
  },
  turbopack: {
    resolveAlias: {
      three: threeModulePath,
      'three/examples/jsm': threeExamplesPath,
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        three: threeWebpackAlias,
        'three/examples/jsm': threeExamplesWebpackAlias,
      };

      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            three: {
              test: /[\\/]node_modules[\\/]three[\\/]/,
              name: 'three',
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
