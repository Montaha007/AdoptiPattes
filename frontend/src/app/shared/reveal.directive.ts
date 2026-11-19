import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, Renderer2 } from "@angular/core";

@Directive({ selector: "[appReveal]" })
export class RevealDirective implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  constructor(private readonly element: ElementRef<HTMLElement>, private readonly renderer: Renderer2, private readonly zone: NgZone) {}
  ngAfterViewInit(): void {
    this.renderer.addClass(this.element.nativeElement, "reveal-ready");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { this.renderer.addClass(this.element.nativeElement, "is-revealed"); return; }
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        this.renderer.addClass(this.element.nativeElement, "is-revealed");
        this.observer?.disconnect();
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
      this.observer.observe(this.element.nativeElement);
    });
  }
  ngOnDestroy(): void { this.observer?.disconnect(); }
}
