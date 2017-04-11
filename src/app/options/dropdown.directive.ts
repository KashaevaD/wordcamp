import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  
  public targetElement: any;
  public isOpen: boolean;
  public current: Element;

  constructor(private el: ElementRef) {
    this.targetElement = this.el.nativeElement;
    this.isOpen = false;
  }

  private setToogle(event: Element) {
    if (event.tagName == 'BUTTON') {
      this.toggle();
    } else if (event.tagName == 'LI') {
       this.setValue(event);
       this.close();
    }
  }

  private onDocumentClick(event: Event) {
    if (!this.targetElement.contains(event.target)) this.close();
  }

  private setValue(value: Element): void {
    let btn: Element = this.targetElement.querySelector('.header-menu img')
    let img: Element = value.querySelector("img"); 
    btn.setAttribute("src", img.getAttribute("src"));
    btn.setAttribute("name", img.getAttribute("name"));
  }

  private toggle(): void {
    if (this.isOpen) this.close()
    else this.open();
  }

  private open(): void {
    this.getMenuUl().classList.remove('close');
    document.addEventListener('click', this.onDocumentClick.bind(this));
    this.isOpen = true;
  }

  private close(): void {
    this.getMenuUl().classList.add('close');
    document.removeEventListener('click', this.onDocumentClick.bind(this));
    this.isOpen = false;
  }
  private getMenuUl(): Element {
    return (this.targetElement as HTMLElement).querySelector("ul.menu");
  }

  @HostListener('click', ['$event.target']) onClick(e: EventTarget) {
      this.targetElement = this.el.nativeElement;
      if ((e as HTMLElement).closest("button")) {
        this.current = (e as HTMLElement).closest("button");
      } else if ((e as HTMLElement).closest("li")) {
        this.current = (e as HTMLElement).closest("li");
      }
      this.setToogle(this.current);          
   }

}
