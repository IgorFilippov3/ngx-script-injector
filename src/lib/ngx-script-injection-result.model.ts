import { NgxScriptInjectionStatus } from "./ngx-script-injection-status.enum";

export class NgxScriptInjectionResult<T> {

  success(status: NgxScriptInjectionStatus, lib: T): NgxScriptInjectionSuccess<T> {
    return { status, lib };
  }

  error(status:  NgxScriptInjectionStatus, error: string): NgxScriptInjectionError {
    return { status, error };
  }
}

export interface NgxScriptInjectionSuccess<T> {
  status: NgxScriptInjectionStatus;
  lib: T;
}

export interface NgxScriptInjectionError {
  status: NgxScriptInjectionStatus;
  error: string;
}