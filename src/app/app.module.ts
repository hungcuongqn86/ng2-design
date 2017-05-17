import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http} from '@angular/http';
import {AppService} from './app.service';
import {HttpClient} from './http-client';

import {AppComponent} from './app.component';
import {DesignComponent} from './design/design.component';
import {PricingComponent} from './pricing/pricing.component';
import {LaunchingComponent} from './launching/launching.component';

import {DesignService} from './design/design.service';

import {TranslateModule, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';

/* Routing Module */
import {routing, appRoutingProviders} from './app-routing.module';

export function createTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, '/assets/i18n', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        DesignComponent,
        PricingComponent,
        LaunchingComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [Http]
        }),
        routing
    ],
    providers: [
        appRoutingProviders,
        HttpClient,
        AppService,
        DesignService
    ],
    entryComponents: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}