import { provideIonicAngular } from '@ionic/angular';
import { applicationConfig, type Preview } from '@storybook/angular-vite';

const preview: Preview = {
  decorators: [
    applicationConfig({
      // Same Ionic setup as src/app/app.config.ts.
      providers: [provideIonicAngular({ useSetInputAPI: true })],
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
