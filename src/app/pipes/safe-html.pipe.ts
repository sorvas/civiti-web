import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    // The Angular DomSanitizer will strip dangerous elements while preserving safe HTML
    return this.sanitizer.sanitize(SecurityContext.HTML, value) || '';
  }
}