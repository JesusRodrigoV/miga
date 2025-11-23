import { Injectable } from "@angular/core";
import { getSupabase } from "@core/services";

@Injectable({
  providedIn: "root",
})
export class PonEnMarchaService {
  async getOrCreatePlanId(planIdRoute: string | null): Promise<string> {
    if (planIdRoute) return planIdRoute;
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc("create_or_get_plan");
    if (error) throw error;
    return data;
  }

  async loadSection(planId: string) {
    const supabase = await getSupabase();
    return supabase
      .from("sections")
      .select("inputs_json")
      .eq("plan_id", planId)
      .eq("tipo", "pon-en-marcha")
      .single();
  }

  async save(planId: string, formValue: any) {
    const supabase = await getSupabase();
    const { error: secError } = await supabase.from("sections").upsert(
      {
        plan_id: planId,
        tipo: "pon-en-marcha",
        inputs_json: formValue,
        outputs_json: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plan_id,tipo" },
    );

    if (secError) throw secError;

    const { error: planError } = await supabase
      .from("plans")
      .update({ ultima_seccion: "pon-en-marcha", estado: "final" })
      .eq("id", planId);

    if (planError) throw planError;
  }
}
