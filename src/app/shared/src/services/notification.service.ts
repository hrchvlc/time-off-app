import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/toast-controller';
import { alertCircle, checkmarkCircle } from 'ionicons/icons';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toasts: ToastController = inject(ToastController);

  public success(message: string): Promise<void> {
    return this.show(message, 'primary', checkmarkCircle, 2500);
  }

  public error(message: string): Promise<void> {
    return this.show(message, 'danger', alertCircle, 4000);
  }

  private async show(message: string, color: string, icon: string, duration: number): Promise<void> {
    const toast = await this.toasts.create({
      message,
      color,
      icon,
      duration,
      position: 'top',
      swipeGesture: 'vertical',
    });
    await toast.present();
  }
}
