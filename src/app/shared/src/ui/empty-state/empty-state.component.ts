import { Component, input, InputSignal } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  styleUrl: './empty-state.component.scss',
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  public readonly title: InputSignal<string> = input.required<string>();
  public readonly message: InputSignal<string | undefined> = input<string | undefined>(undefined);
}
