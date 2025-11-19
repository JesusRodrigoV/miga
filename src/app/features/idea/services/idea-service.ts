import { Injectable } from "@angular/core";
import { getSupabase } from "@core/services";
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class IdeaService {
  private supabase: SupabaseClient | null = null;

  private async getClient(): Promise<SupabaseClient> {
    if (this.supabase) {
      return this.supabase;
    }

    this.supabase = await getSupabase();
    return this.supabase;
  }

  async getOrCreatePlanId(planIdFromRoute: string | null): Promise<string> {
    if (planIdFromRoute) {
      return planIdFromRoute;
    }
    const supabase = await this.getClient();
    const { data, error } = await supabase.rpc("create_or_get_plan");
    if (error) {
      console.error("Error al obtener/crear el plan", error);
      throw new Error("Error al obtener/crear el plan");
    }
    return data;
  }

  async loadSection(planId: string): Promise<any | null> {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from("sections")
      .select("inputs_json")
      .eq("plan_id", planId)
      .eq("tipo", "idea")
      .single();

    return data?.inputs_json || null;
  }

  async saveSection(planId: string, formData: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase.from("sections").upsert(
      {
        plan_id: planId,
        tipo: "idea",
        inputs_json: formData,
        outputs_json: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plan_id,tipo" },
    );

    if (error) {
      console.error("Error al guardar la sección 'idea'", error);
      throw error;
    }
  }
}
