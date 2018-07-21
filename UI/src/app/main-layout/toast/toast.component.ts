import { Component, ViewEncapsulation } from '@angular/core';
import { ToasterConfig } from 'angular2-toaster';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['../../../../node_modules/angular2-toaster/toaster.min.css'],
  encapsulation: ViewEncapsulation.None
})
export class ToastComponent {
  toasterConfig : ToasterConfig = new ToasterConfig({ tapToDismiss: true, timeout: 5000 });

}
