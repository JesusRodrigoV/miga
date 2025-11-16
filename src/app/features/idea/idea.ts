import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { supabase } from "@core/services";

@Component({
  selector: "app-idea",
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./idea.html",
  styleUrl: "./idea.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Idea {
  form: FormGroup;
  msg = "";
  planId: string | null = null;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  constructor() {
    this.form = this.fb.group({
      fortalezas: ["", Validators.required],
      oportunidades: ["", Validators.required],
      ideaNegocio: ["", Validators.required],
      nombreNegocio: ["", Validators.required],
      propuestaValor: ["", Validators.required],
      motivacion: ["", Validators.required],
    });
  }

  async ngOnInit() {
    // Obtener planId desde la URL si fue enviado como parámetro
    this.route.queryParams.subscribe(async (params) => {
      this.planId = params["planId"] || null;

      if (!this.planId) {
        const { data, error } = await supabase.rpc("create_or_get_plan");
        if (error) {
          this.msg = "Error al obtener plan: " + error.message;
          return;
        }
        this.planId = data;
      }

      this.loadSection();
    });
  }

  async loadSection() {
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .eq("plan_id", this.planId)
      .eq("tipo", "idea")
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
        tipo: "idea",
        inputs_json: this.form.value,
        outputs_json: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plan_id,tipo" },
    );

    this.msg = error ? "Error al guardar" : "✅ Guardado con éxito";
  }
}
