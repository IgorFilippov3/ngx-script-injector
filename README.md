# ngx-script-injector
*ngx-script-injector* is an Angular service for dynamically injecting javascript code on your page, during runtime

## Installation
Using npm
```
$ npm i --save ngx-script-injector
```
## Usage

1. Import `NgxScriptInjectorModule` into the module where you want to inject your code

2. Inject `NgxScriptInjectorService` into the component.

3. Create params object with `NgxScriptInjectorParams` and pass it to `inject` method
```ts
  const params: NgxScriptInjectorParams = {
    src: "https://www.google.com/recaptcha/api.js",
    globalVarName: "grecaptcha",
    globalVarNameMethods: ["execute", "render"], // optional, [] by default
    async: true, // optional, false by default
    defer: true, // optional, false by default
    requestTimeout: 5000, // // optional, 3000 by default
  };
```

4. Example
```ts

  declare var grecaptcha: ReCAPTCHA;

  @Component({
    ...
  })
  export class ExampleComponent implements OnInit {
    constructor(private scriptInjector: NgxScriptInjectorService) {}

    ngOnInit(): void {
      const params: NgxScriptInjectorParams = {
        src: "https://www.google.com/recaptcha/api.js",
        globalVarName: "grecaptcha",
      };

      this.scriptInjector.inject<ReCAPTCHA>(params)
         .subscribe({
          next: (result: NgxScriptInjectionSuccess<ReCAPTCHA>) => {
            const { status, lib } = result;

            if (status === NgxScriptInjectionStatus.LOADED) {
              ... call lib here
            }
            
            if (status === NgxScriptInjectionStatus.ALREADY_ADDED) {
              ... do whatever you want
            }
            
          },
          error: (errorInfo: NgxScriptInjectionError) => {
            const { status, error } = errorInfo;

            if (status === NgxScriptInjectionStatus.ERROR) {
                ... do whatever you want
            }

            if (status === NgxScriptInjectionStatus.REQUEST_TIMED_OUT) {
              ... script was not loaded
            }
        }
      });
    }
  }
```
