import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EMPTY, Observable } from 'rxjs';

import { NgxScriptInjectorParams } from './ngx-script-injector-params.model';
import { NgxScriptInjectionStatus } from './ngx-script-injection-status.enum';
import { NgxScriptInjectionResult, NgxScriptInjectionSuccess, NgxScriptInjectionError } from './ngx-script-injection-result.model';


@Injectable()
export class NgxScriptInjectorService {

  private renderer: Renderer2;

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  public inject<T>(params: NgxScriptInjectorParams): Observable<NgxScriptInjectionSuccess<T> | NgxScriptInjectionError> {
    if (isPlatformBrowser(this.platformId)) {
      const { src, globalVarName, globalVarNameMethods, async, defer, requestTimeout } = params;
      const result = new NgxScriptInjectionResult<T>();

      return new Observable(observer => {
        const head: HTMLHeadElement | null = document.querySelector("head");

        if (head === null) {
          observer.error(result.error(NgxScriptInjectionStatus.ERROR, "Unable to find <head> element on page"));
          observer.complete();
        }

        const scripts: HTMLScriptElement[] = Array.from(head.querySelectorAll("script"));
        const isScriptToInjectAlreadyAppended: boolean = scripts.some(script => script.src === src);

        if (!isScriptToInjectAlreadyAppended) {
          const INTERVAL: number = 100;
          const REQUEST_TIMEOUT: number = requestTimeout && requestTimeout > 0 ? requestTimeout : 3000;
          
          const script: HTMLScriptElement = this.renderer.createElement("script");
          script.src = src;
          script.async = Boolean(async);
          script.defer = Boolean(defer);
          this.renderer.appendChild(head, script);

          let timeoutTimer: number = 0;

          const onloadTimer = setInterval(() => {
            let loaded: boolean = false;
            timeoutTimer += INTERVAL;

            if (typeof (<any>window)[globalVarName] !== "undefined") {

              if (globalVarNameMethods && globalVarNameMethods.length) {

                const isAllMethodsLoaded: boolean = globalVarNameMethods.every((method: string) => {
                  return typeof (<any>window)[globalVarName][method] !== "undefined";
                });

                if (isAllMethodsLoaded) {
                  loaded = true;
                }
              } else {
                loaded = true;
              }
            }

            if (loaded) {
              clearInterval(onloadTimer);
              observer.next(
                result.success(
                  NgxScriptInjectionStatus.LOADED,
                  (<any>window)[globalVarName] as T
                )
              );
              observer.complete();
            }

            if (timeoutTimer >= REQUEST_TIMEOUT) {
              clearInterval(onloadTimer);
              this.renderer.removeChild(head, script);
              observer.error(
                result.error(NgxScriptInjectionStatus.REQUEST_TIMED_OUT, "Unable to fetch data")
              );
              observer.complete();
            }
          }, INTERVAL);
        } else {
          observer.next(
            result.success(
              NgxScriptInjectionStatus.ALREADY_ADDED,
              (<any>window)[globalVarName] as T
            )
          );
          observer.complete();
        }
      });
    } else {
      return EMPTY;
    }
  }
}
