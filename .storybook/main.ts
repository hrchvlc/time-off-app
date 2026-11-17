import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  addons: [],
  framework: {
    name: '@storybook/angular-vite',
    options: {
      // Component styles in this project are SCSS (see angular.json schematics).
      inlineStylesExtension: 'scss',
    },
  },
};

export default config;
