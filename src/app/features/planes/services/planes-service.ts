import { Injectable } from "@angular/core";
import { getSupabase } from "@core/services";
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class PlanesService {
  private supabase: SupabaseClient | null = null;

  private async getClient(): Promise<SupabaseClient> {
    if (this.supabase) return this.supabase;
    this.supabase = await getSupabase();
    return this.supabase;
  }

  async getPlanes(): Promise<any[]> {
    const supabase = await this.getClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async crearNuevoPlan(): Promise<any> {
    const supabase = await this.getClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase
      .from("plans")
      .insert({ user_id: user.id, estado: "borrador" })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePlan(planId: string): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase.from("plans").delete().eq("id", planId);

    if (error) throw error;
  }

  async getPlanProgress(planId: string): Promise<string | null> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from("plans")
      .select("ultima_seccion")
      .eq("id", planId)
      .single();

    if (error) throw error;
    return data?.ultima_seccion || null;
  }
}
