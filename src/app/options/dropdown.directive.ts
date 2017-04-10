import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  
  public targetElement: any;
  public isOpen: boolean;
  public current;

  constructor(private el: ElementRef) {
    this.targetElement = this.el.nativeElement;
    this.isOpen = false;
  }

  private setToogle(event) {
    if (event.tagName == 'BUTTON') {
      this.toggle();
    } else if (event.tagName == 'LI') {

       this.setValue(event);
       this.close();
    }
  }

  private onDocumentClick(event) {
    if (!this.targetElement.contains(event.target)) this.close();
  }

  private setValue(value) {
    let btn = this.targetElement.querySelector('.header-menu img')
    let img = value.querySelector("img"); 
    btn.setAttribute("src", img.getAttribute("src"));
    btn.setAttribute("name", img.getAttribute("name"));
  }

  private toggle() {
    if (this.isOpen) this.close()
    else this.open();
  }

  private open() {
     this.getCurrentChandegElem().classList.remove('close');
    document.addEventListener('click', this.onDocumentClick.bind(this));
    this.isOpen = true;
  }

  private close() {
      this.getCurrentChandegElem().classList.add('close');
      document.removeEventListener('click', this.onDocumentClick.bind(this));
      this.isOpen = false;
  }

  private getCurrentChandegElem() {
    let elem;
     if (this.current.tagName === "BUTTON") {
       elem = this.current.nextElementSibling;
     }else {
       elem = this.current.parentElement;
     }
     return elem;
  }

  @HostListener('click', ['$event.target']) onClick(e) {
      this.targetElement = this.el.nativeElement;
      if (e.closest("button")) {
        this.current = e.closest("button");
      } else if (e.closest("li")) {
         this.current = e.closest("li");
      }
      this.setToogle( this.current);          
   }

}
