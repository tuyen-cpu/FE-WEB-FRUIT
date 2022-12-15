import { AbstractControl, ValidatorFn } from '@angular/forms';

export class Validation {
  static match(controlName: string, checkControlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const checkControl = controls.get(checkControlName);

      if (checkControl?.errors && !checkControl.errors['matching']) {
        return null;
      }

      if (control?.value !== checkControl?.value) {
        controls.get(checkControlName)?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }
}
// export function phoneNumberValidator(
//   control: AbstractControl
// ): { [key: string]: any } | null {
//   // const valid = /^\d+$/.test(control.value);
//   const valid = /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(control.value);
//   return valid
//     ? null
//     : { invalidNumber: { valid: false, value: control.value } };
// }

export function nameValidator(control: AbstractControl): { [key: string]: any } | null {
  const valid = new RegExp("^([a-zA-Z]{2,}\\s[a-zA-Z]{1,}'?-?[a-zA-Z]{2,}\\s?([a-zA-Z]{1,})?)").test(control.value);
  return valid ? null : { invalidNumber: { valid: false, value: control.value } };
}
