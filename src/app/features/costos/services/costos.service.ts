import { inject, Injectable } from "@angular/core";
import { getSupabase } from "@core/services";
import { StorageService } from "@core/services/storage-service";
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class CostosService {
  private supabase: SupabaseClient | null = null;
  private storage = inject(StorageService);

  private async getClient(): Promise<SupabaseClient> {
    if (this.supabase) {
      return this.supabase;
    }
    this.supabase = await getSupabase();
    return this.supabase;
  }

  async getOrCreatePlanId(planIdFromRoute: string | null): Promise<string> {
    console.log("[CostosService] getOrCreatePlanId - planIdFromRoute:", planIdFromRoute);

    if (planIdFromRoute) {
      this.storage.setItem("currentPlanId", planIdFromRoute);
      console.log("[CostosService] Using planId from route:", planIdFromRoute);
      return planIdFromRoute;
    }

    const storedPlanId = this.storage.getItem("currentPlanId");
    if (storedPlanId) {
      console.log("[CostosService] Using planId from storage:", storedPlanId);
      return storedPlanId;
    }

    console.log("[CostosService] Creating new plan...");
    const supabase = await this.getClient();
    const { data, error } = await supabase.rpc("create_or_get_plan");

    if (error) {
      console.error("[CostosService] Error creating plan:", error);
      throw new Error("Error al crear o obtener el plan");
    }

    console.log("[CostosService] New plan created:", data);
    this.storage.setItem("currentPlanId", data);
    return data;
  }

  async loadSection(planId: string, tipo: string): Promise<any | null> {
    console.log(`[CostosService] loadSection - planId: ${planId}, tipo: ${tipo}`);

    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .eq("plan_id", planId)
      .eq("tipo", tipo)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(`[CostosService] Error loading section ${tipo}:`, error);
      throw new Error(`Error al cargar la sección ${tipo}`);
    }

    console.log(`[CostosService] Section ${tipo} loaded:`, data);
    return data;
  }

  async saveSection(
    planId: string,
    tipo: string,
    inputsJson: any,
    outputsJson: any
  ): Promise<void> {
    console.log(`[CostosService] saveSection - planId: ${planId}, tipo: ${tipo}`);
    console.log("[CostosService] inputsJson:", inputsJson);
    console.log("[CostosService] outputsJson:", outputsJson);

    const supabase = await this.getClient();
    const { error } = await supabase.from("sections").upsert(
      {
        plan_id: planId,
        tipo: tipo,
        inputs_json: inputsJson,
        outputs_json: outputsJson,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plan_id,tipo" }
    );

    if (error) {
      console.error(`[CostosService] Error saving section ${tipo}:`, error);
      throw new Error(`Error al guardar la sección ${tipo}`);
    }

    console.log(`[CostosService] Section ${tipo} saved successfully`);
  }

  async updatePlanProgress(planId: string, ultimaSeccion: string): Promise<void> {
    console.log(`[CostosService] updatePlanProgress - planId: ${planId}, ultimaSeccion: ${ultimaSeccion}`);

    const supabase = await this.getClient();
    const { error } = await supabase
      .from("plans")
      .update({ ultima_seccion: ultimaSeccion })
      .eq("id", planId);

    if (error) {
      console.error("[CostosService] Error updating plan progress:", error);
      throw new Error("Error al actualizar el progreso del plan");
    }

    console.log("[CostosService] Plan progress updated successfully");
  }

  async loadAllSections(planId: string): Promise<{
    materiaprima: any | null;
    manoDeObra: any | null;
    costosIndirectos: any | null;
  }> {
    console.log(`[CostosService] loadAllSections - planId: ${planId}`);

    const [materiaprima, manoDeObra, costosIndirectos] = await Promise.all([
      this.loadSection(planId, "costos"),
      this.loadSection(planId, "mano-obra"),
      this.loadSection(planId, "costos-indirectos"),
    ]);

    console.log("[CostosService] All sections loaded:", {
      materiaprima,
      manoDeObra,
      costosIndirectos,
    });

    return { materiaprima, manoDeObra, costosIndirectos };
  }
}
