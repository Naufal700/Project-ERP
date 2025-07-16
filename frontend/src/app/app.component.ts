import { Component, OnInit } from "@angular/core";
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from "@angular/router";
import { AnalyticsService } from "./@core/utils/analytics.service";
import { SeoService } from "./@core/utils/seo.service";

@Component({
  selector: "ngx-app",
  template: `
    <div *ngIf="isLoading" class="overlay-spinner">
      <div class="spinner-logo">
        <div class="spinner-circle"></div>
      </div>
      <p class="loading-text">{{ loadingText }}</p>
    </div>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      .overlay-spinner {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(3px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease-in-out;
      }

      .spinner-logo {
        position: relative;
        width: 80px;
        height: 80px;
        margin-bottom: 16px;
      }

      .spinner-logo img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        z-index: 2;
        position: relative;
      }

      .spinner-circle {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 6px solid transparent;
        border-top-color: #3366ff;
        border-radius: 50%;
        animation: spin 1.2s linear infinite;
        z-index: 1;
      }

      .loading-text {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        animation: fadeText 0.5s ease-in;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes fadeText {
        from {
          opacity: 0;
          transform: translateY(5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  isLoading = false;
  loadingText = "Memuat Siakun-ERP...";
  private loadingMessages = [
    "Memuat Siakun-ERP...",
    "Menghubungkan ke server...",
    "Menyiapkan tampilan pengguna...",
    "Memuat modul-modul...",
    "Menyiapkan data...",
  ];
  private messageIndex = 0;
  private intervalId: any;

  constructor(
    private analytics: AnalyticsService,
    private seoService: SeoService,
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
        this.startLoadingTextCycle();
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.isLoading = false;
          this.stopLoadingTextCycle();
        }, 300); // delay supaya transisi smooth
      }
    });
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }

  private startLoadingTextCycle() {
    this.loadingText = this.loadingMessages[this.messageIndex];
    this.intervalId = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.loadingMessages.length;
      this.loadingText = this.loadingMessages[this.messageIndex];
    }, 2000);
  }

  private stopLoadingTextCycle() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.messageIndex = 0;
  }
}
