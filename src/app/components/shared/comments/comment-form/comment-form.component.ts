import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule
  ],
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.scss'
})
export class CommentFormComponent implements OnInit, OnChanges {
  @Input() initialContent = '';
  @Input() placeholder = 'Scrie un comentariu...';
  @Input() submitLabel = 'Trimite';
  @Input() isReply = false;
  @Input() isEdit = false;
  @Input() submitting = false;
  @Input() resetKey = 0;

  @Output() submitted = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  content = '';
  readonly maxLength = 2000;
  private previousResetKey = 0;

  ngOnInit(): void {
    this.content = this.initialContent;
    this.previousResetKey = this.resetKey;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetKey'] && !changes['resetKey'].firstChange) {
      if (this.resetKey !== this.previousResetKey) {
        this.content = this.initialContent;
        this.previousResetKey = this.resetKey;
      }
    }
  }

  get remainingChars(): number {
    return this.maxLength - this.content.length;
  }

  get isValid(): boolean {
    return this.content.trim().length > 0 && this.content.length <= this.maxLength;
  }

  onSubmit(): void {
    if (this.isValid && !this.submitting) {
      this.submitted.emit(this.content.trim());
    }
  }

  onCancel(): void {
    this.content = this.initialContent;
    this.cancelled.emit();
  }
}
