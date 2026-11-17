import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { AllowanceSummary } from '../../models';

@Component({
  selector: 'app-allowance-summary',
  styleUrl: './allowance-summary.component.scss',
  templateUrl: './allowance-summary.component.html',
})
export class AllowanceSummaryComponent {
  protected readonly usedPercent: Signal<number> = computed(() => {
    const { used, allowance } = this.summary();
    return this.toPercent(Math.min(used, allowance), allowance);
  });

  protected readonly pendingPercent: Signal<number> = computed(() => {
    const { used, pending, allowance } = this.summary();
    return this.toPercent(Math.min(pending, Math.max(allowance - used, 0)), allowance);
  });

  public readonly summary: InputSignal<AllowanceSummary> = input.required<AllowanceSummary>();

  private toPercent(days: number, allowance: number): number {
    return allowance > 0 ? (days / allowance) * 100 : 0;
  }
}
