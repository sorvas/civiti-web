import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'levelTitle',
  standalone: true,
  pure: true
})
export class LevelTitlePipe implements PipeTransform {
  private static readonly TITLES = [
    'Începător civic',
    'Cetățean activ',
    'Activist local',
    'Lider comunitar',
    'Campion civic',
    'Erou al comunității',
    'Legendă civică'
  ];

  transform(level: number | null | undefined): string {
    if (!level) return 'Începător civic';
    return LevelTitlePipe.TITLES[Math.min(level - 1, LevelTitlePipe.TITLES.length - 1)];
  }
}

@Pipe({
  name: 'badgeColor',
  standalone: true,
  pure: true
})
export class BadgeColorPipe implements PipeTransform {
  private static readonly COLORS: Record<string, string> = {
    'common': '#8c8c8c',
    'uncommon': '#52c41a',
    'rare': '#1890ff',
    'epic': '#722ed1',
    'legendary': '#faad14'
  };

  transform(rarity: string | null | undefined): string {
    if (!rarity) return '#8c8c8c';
    return BadgeColorPipe.COLORS[rarity.toLowerCase()] || '#8c8c8c';
  }
}
