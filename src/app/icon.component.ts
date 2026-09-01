import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type IconName = 'select' | 'pencil' | 'square' | 'circle' | 'line' | 'arrow' | 'shapes' | 'text' | 'eraser' | 'undo' | 'trash' | 'github';

@Component({
  selector: 'app-icon', standalone: true, imports: [CommonModule],
  template: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <ng-container [ngSwitch]="name">
      <ng-container *ngSwitchCase="'undo'"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></ng-container>
      <ng-container *ngSwitchCase="'pencil'"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></ng-container>
      <ng-container *ngSwitchCase="'eraser'"><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/><path d="m5.082 11.09 8.828 8.828"/></ng-container>
      <ng-container *ngSwitchCase="'trash'"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></ng-container>
      <path *ngSwitchCase="'github'" fill="currentColor" stroke="none" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.17c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.57-.29-5.27-1.28-5.27-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.47.11-3.06 0 0 .98-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.06.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.08.78 2.18v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>
      <path *ngSwitchCase="'select'" d="M5 3 9.5 20l3.5-5 5 3 1.5-2.5-5-3L20 9 5 3Z"/><rect *ngSwitchCase="'square'" x="4" y="4" width="16" height="16" rx="2"/><circle *ngSwitchCase="'circle'" cx="12" cy="12" r="8"/><path *ngSwitchCase="'line'" d="M5 19 19 5"/><path *ngSwitchCase="'arrow'" d="M5 19 19 5M9 5h10v10"/><g *ngSwitchCase="'shapes'"><rect x="3.5" y="3.5" width="10" height="10" rx="1.5"/><circle cx="16.5" cy="16.5" r="4.5"/></g><path *ngSwitchCase="'text'" d="M5 5h14M12 5v14M8 19h8"/>
    </ng-container>
  </svg>`,
  styles: [`:host{display:inline-flex;width:20px;height:20px}svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}`]
})
export class IconComponent { @Input({ required: true }) name!: IconName; }
