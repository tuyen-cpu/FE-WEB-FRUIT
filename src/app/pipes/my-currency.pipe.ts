import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myCurrency',
  standalone: true,
})
export class MyCurrency implements PipeTransform {
  transform(value: any, type: string): unknown {
    // if (!args) return value;
    if (type.toLocaleUpperCase() === 'VND') {
      value =
        parseFloat(value)
          .toFixed(0)
          .replace(/(\d)(?=(\d{3})+\b)/g, '$1.') + 'đ';
    }

    return value;
  }
}
