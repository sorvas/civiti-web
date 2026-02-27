import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryColor',
  standalone: true,
  pure: true
})
export class CategoryColorPipe implements PipeTransform {
  private static readonly COLORS: Record<string, string> = {
    'infrastructure': 'orange',
    'environment': 'green',
    'publicservices': 'blue',
    'safety': 'red',
    'other': 'default'
  };

  transform(categoryId: string | null | undefined): string {
    if (!categoryId) return 'default';
    return CategoryColorPipe.COLORS[categoryId] || 'default';
  }
}
