import { Injectable } from "@angular/core";
import { getSupabase } from "@core/services";
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class ObjetivoService {
  private supabase: SupabaseClient | null = null;

  private async getClient(): Promise<SupabaseClient> {
    if (this.supabase) {
      return this.supabase;
    }

    this.supabase = await getSupabase();
    return this.supabase;
  }
  /**
   * Obtiene el planId de la ruta o crea/obtiene uno nuevo si no existe.
   */
  async getOrCreatePlanId(planIdFromRoute: string | null): Promise<string> {
    if (planIdFromRoute) {
      return planIdFromRoute;
    }
    const supabase = await this.getClient();
    const { data, error } = await supabase.rpc("create_or_get_plan");
    if (error) {
      console.error("Error al obtener el plan", error);
      throw new Error("Error al obtener el plan");
    }
    return data;
  }

  /**
   * Carga los datos de la sección "objetivo" de un plan específico.
   */
  async loadSection(planId: string): Promise<any | null> {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from("sections")
      .select("inputs_json")
      .eq("plan_id", planId)
      .eq("tipo", "objetivo")
      .single();

    return data?.inputs_json || null;
  }

  /**
   * Guarda (actualiza o inserta) los datos del formulario
   * en la sección "objetivo".
   */
  async saveSection(planId: string, formData: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase.from("sections").upsert(
      {
        plan_id: planId,
        tipo: "objetivos",
        inputs_json: formData,
        outputs_json: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plan_id,tipo" },
    );

    if (error) {
      console.error("Error al guardar", error);
      throw error;
    }
  }
}
