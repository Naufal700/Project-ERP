import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <footer class="footer">
      <div class="footer-left">
        <span>
          © {{ currentYear }} <strong>SIAKUN-ERP</strong> — Made with by 
          <a href="https://akveo.page.link/8V2f" target="_blank">Muhamad Naufal Istikhori</a>
        </span>
      </div>
      <div class="footer-right">
        <a href="https://github.com" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>
        <a href="https://facebook.com" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="https://twitter.com" target="_blank" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
        <a href="https://linkedin.com" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}
