// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  security: {
    checkOrigin: false
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: [
          '**/sovereign-ai-workbench/**',
          '**/workspaces/**',
          '**/models/**',
          '**/dist/**',
          '**/LUMI_Desktop/**',
          '**/demo/**',
          '**/per_design/**',
          '**/llama_server/**',
          '**/*.log',
          /[\\/]sovereign-ai-workbench[\\/]/,
          /[\\/]workspaces[\\/]/,
          /[\\/]models[\\/]/,
          /[\\/]dist[\\/]/,
          /[\\/]LUMI_Desktop[\\/]/,
          /[\\/]demo[\\/]/,
          /[\\/]per_design[\\/]/,
          /[\\/]llama_server[\\/]/,
          /\.log$/
        ]
      }
    }
  }
});