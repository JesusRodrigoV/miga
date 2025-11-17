import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "mg-footer",
  imports: [CommonModule],
  templateUrl: "./footer.html",
  styleUrl: "./footer.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class Footer {
  currentYear = new Date().getFullYear();

  logos = [
    { src: "/logo1.png", alt: "Partner 1" },
    { src: "/logo2.png", alt: "Partner 2" },
    { src: "/logo3.png", alt: "Partner 3" },
    { src: "/logo4.png", alt: "Partner 4" },
  ];

  links = {
    company: [
      { label: "Acerca de", url: "/acerca" },
      { label: "Contacto", url: "/contacto" },
    ],
    legal: [
      { label: "Términos de uso", url: "/terminos" },
      { label: "Privacidad", url: "/privacidad" },
    ],
    social: [
      { label: "TikTok", url: "https://tiktok.com" },
      { label: "Instagram", url: "https://instagram.com" },
    ],
  };
}
