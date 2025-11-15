import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { supabase } from "@core/supabase.client";

@Component({
  selector: "app-objetivo",
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./objetivo.html",
  styleUrl: "./objetivo.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Objetivo implements OnInit {
  form: FormGroup;
  msg = "";
  planId: string | null = null;
  saved = false;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      que: ["", Validators.required],
      aQuien: ["", Validators.required],
      cuando: ["", Validators.required],
      como: ["", Validators.required],
      donde: ["", Validators.required],
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.planId = params["planId"] || null;

      if (!this.planId) {
        const { data, error } = await supabase.rpc("create_or_get_plan");
        if (error) {
          this.msg = "Error al obtener el plan";
          return;
        }
        this.planId = data;
      }

      this.loadSection();
    });
  }

  async loadSection() {
    const { data } = await supabase
      .from("sections")
      .select("*")
      .eq("plan_id", this.planId)
      .eq("tipo", "objetivo")
      .single();

    if (data && data.inputs_json) {
      this.form.patchValue(data.inputs_json);
    }
  }

  async onSubmit() {
    if (!this.planId || this.form.invalid) return;

    const { error } = await supabase.from("sections").upsert(
      {
        plan_id: this.planId,
        tipo: "objetivos",
        inputs_json: this.form.value,
        outputs_json: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plan_id,tipo" },
    );

    if (error) {
      this.msg = `❌ ${error.message}`;
      this.saved = false;
    } else {
      this.msg = "✅ Objetivos guardados";
      this.saved = true;
      this.router.navigate(["/costos/materia-prima"], {
        queryParams: { planId: this.planId },
      });
    }
  }
}
