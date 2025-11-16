import { inject, Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";

@Injectable()
export class CustomTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) || this.title.getTitle();
    if (pageTitle) {
      this.title.setTitle(`${pageTitle} - Miga`);
    } else {
      this.title.setTitle("Miga");
    }
  }
}
