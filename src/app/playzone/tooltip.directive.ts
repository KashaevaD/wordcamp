import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {

  private _delay: number;
  private timerId;
  private $tooltip: HTMLElement;

  constructor(private el: ElementRef) {
    this._delay = 700;
  }

  @Input() textForOver: string;
  @Input() textForClick: string;

  @HostListener('mouseenter') onMouseEnter() {
    this.$tooltip = this.el.nativeElement.querySelector('.wc_tooltip');
    this.timerId = setTimeout(() => this.showTip(this.textForOver), this._delay);
  }

  @HostListener('mouseleave') onMouseLeave() {
    clearTimeout(this.timerId);
    this.el.nativeElement.classList.remove('wc_tooltip_open');
  }

  @HostListener('click') onClick() {
    clearTimeout(this.timerId);
    this.showTip(this.textForClick);
    this.timerId = setTimeout(() => this.el.nativeElement.classList.remove('wc_tooltip_open'), 500);
  }


  private showTip(text: string){
    this.$tooltip.innerHTML = text;
    this.el.nativeElement.classList.add('wc_tooltip_open')
  }

}
