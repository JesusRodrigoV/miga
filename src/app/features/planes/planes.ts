import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { supabase } from "@core/services";

@Component({
  selector: "app-planes",
  imports: [DatePipe],
  templateUrl: "./planes.html",
  styleUrl: "./planes.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Planes {
  private router = inject(Router);

  planes: any[] = [];

  async ngOnInit() {
    const { data, error } = await supabase.from("plans").select("*");
    this.planes = data || [];
  }

  async crearNuevoPlan() {
    const user = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("plans")
      .insert({ user_id: user.data.user?.id, estado: "borrador" })
      .select()
      .single();

    if (data) {
      this.planes.push(data);
      // Redirigir automáticamente a la Parte 1
      this.router.navigate(["/idea"], { queryParams: { planId: data.id } });
    }
  }

  abrir(planId: string) {
    this.router.navigate(["/idea"], { queryParams: { planId } });
  }
}
