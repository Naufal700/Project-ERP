import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "sum",
})
export class SumPipe implements PipeTransform {
  transform(items: any[], field: string): number {
    if (!items || items.length === 0) return 0;

    const fields = field.split(".");
    return items.reduce((total, item) => {
      let value = item;
      for (const key of fields) {
        value = value?.[key];
        if (value === undefined || value === null) return total;
      }
      return total + (parseFloat(value) || 0);
    }, 0);
  }
}
