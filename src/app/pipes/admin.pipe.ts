import { Pipe, PipeTransform } from '@angular/core';

type AdminActionType = 'approve' | 'reject' | 'request_changes';

@Pipe({
  name: 'actionLabel',
  standalone: true,
  pure: true
})
export class ActionLabelPipe implements PipeTransform {
  private static readonly LABELS: Record<string, string> = {
    approve: 'A aprobat',
    reject: 'A respins',
    request_changes: 'A solicitat modificări'
  };

  transform(action: AdminActionType | string): string {
    return ActionLabelPipe.LABELS[action] || action;
  }
}

@Pipe({
  name: 'actionColor',
  standalone: true,
  pure: true
})
export class ActionColorPipe implements PipeTransform {
  private static readonly COLORS: Record<string, string> = {
    approve: 'green',
    reject: 'red',
    request_changes: 'orange'
  };

  transform(action: AdminActionType | string): string {
    return ActionColorPipe.COLORS[action] || 'default';
  }
}

@Pipe({
  name: 'timelineColor',
  standalone: true,
  pure: true
})
export class TimelineColorPipe implements PipeTransform {
  private static readonly COLORS: Record<string, string> = {
    approve: 'green',
    reject: 'red',
    request_changes: 'orange'
  };

  transform(action: AdminActionType | string): string {
    return TimelineColorPipe.COLORS[action] || 'gray';
  }
}

@Pipe({
  name: 'targetLabel',
  standalone: true,
  pure: true
})
export class TargetLabelPipe implements PipeTransform {
  transform(entry: { issueTitle?: string; issueId: string }): string {
    return entry.issueTitle || `Problemă #${entry.issueId.slice(0, 8)}`;
  }
}
