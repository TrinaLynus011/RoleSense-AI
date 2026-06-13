import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({ selector: '[appAnimateOnScroll]', standalone: true })
export class AnimateOnScrollDirective {
  animation = input<string>('fadeInUp');

  constructor(private el: ElementRef) {
    this.el.nativeElement.style.opacity = '0';
    this.el.nativeElement.style.transform = 'translateY(20px)';
    this.el.nativeElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      this.el.nativeElement.style.opacity = '1';
      this.el.nativeElement.style.transform = 'translateY(0)';
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.onScroll(), 100);
  }
}
