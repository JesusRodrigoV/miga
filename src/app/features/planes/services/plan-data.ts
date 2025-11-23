import { Injectable } from "@angular/core";
import { getSupabase } from "@core/services";
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class PlanData {
  private supabase: SupabaseClient | null = null;

  private async getClient() {
    if (!this.supabase) this.supabase = await getSupabase();
    return this.supabase;
  }

  async fetchAllSections(planId: string): Promise<Record<string, any>> {
    const client = await this.getClient();
    const tipos = [
      "idea",
      "objetivos",
      "costos",
      "mano-obra",
      "costos-indirectos",
      "pon-en-marcha",
    ];

    const secciones: Record<string, any> = {};

    await Promise.all(
      tipos.map(async (tipo) => {
        const { data } = await client
          .from("sections")
          .select("inputs_json")
          .eq("plan_id", planId)
          .eq("tipo", tipo)
          .single();

        if (data) {
          secciones[tipo] = data.inputs_json;
        }
      }),
    );

    return secciones;
  }
}
