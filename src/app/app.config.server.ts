import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    // SSR providers will be added here when needed
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
