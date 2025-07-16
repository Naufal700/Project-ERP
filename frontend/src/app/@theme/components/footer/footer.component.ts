import { Component } from "@angular/core";

@Component({
  selector: "ngx-footer",
  styleUrls: ["./footer.component.scss"],
  template: `
    <footer class="footer">
      <div class="footer-left">
        <span class="footer-text">
          &copy; {{ currentYear }} <strong>SIAKUN-ERP</strong> — Made with by
          <strong>Muhamad Naufal Istikhori</strong>
        </span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}
