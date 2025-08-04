import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "sum",
})
export class SumPipe implements PipeTransform {
  transform(items: any[], field: string): string {
    if (!items || items.length === 0) return "-";

    const fields = field.split(".");
    const total = items.reduce((total, item) => {
      let value = item;
      for (const key of fields) {
        value = value?.[key];
        if (value === undefined || value === null) return total;
      }
      return total + (parseFloat(value) || 0);
    }, 0);

    if (total === 0) {
      return "-";
    } else if (Number.isInteger(total)) {
      return total.toString();
    } else {
      return total.toFixed(2);
    }
  }
}
