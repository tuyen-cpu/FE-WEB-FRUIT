import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PreloadAllModules, RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from './environments/environment';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app-routing';
import { AppInterceptor } from './app/services/app.interceptor';
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
} from '@abacritt/angularx-social-login';
import { AuthGuard } from './app/guards/auth.guard';

if (environment.production) {
  enableProdMode();
}

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));
bootstrapApplication(AppComponent, {
  providers: [
    //  {provide: BACKEND_URL, useValue: 'https://photoapp.looknongmodules.com/api'},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppInterceptor,
      multi: true,
    },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '1049260761267-rfk990he95so6nilv8t1a35k3ggr1aft.apps.googleusercontent.com'
            ),
          },
        ],
        onError: (err) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
    importProvidersFrom(
      BrowserAnimationsModule,
      HttpClientModule,
      RouterModule.forRoot(APP_ROUTES, {
        preloadingStrategy: PreloadAllModules,
        scrollPositionRestoration: 'top',
      })
    ),
    AuthGuard,
  ],
});
