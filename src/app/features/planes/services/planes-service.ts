import { Injectable } from "@angular/core";
import { getSupabase } from "@core/services";
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class PlanesService {
  private supabase: SupabaseClient | null = null;

  private async getClient(): Promise<SupabaseClient> {
    if (this.supabase) {
      return this.supabase;
    }

    this.supabase = await getSupabase();
    return this.supabase;
  }
  /**
   * Obtiene todos los planes de la base de datos.
   */
  async getPlanes(): Promise<any> {
    const supabase = await this.getClient();
    const { data, error } = await supabase.from("plans").select("*");

    if (error) {
      console.error("Error al obtener planes:", error);
      throw error;
    }
    return data || [];
  }

  /**
   * Crea un nuevo plan borrador para el usuario autenticado.
   * Devuelve el plan recién creado.
   */
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

    if (error) {
      console.error("Error al crear el plan:", error);
      throw error;
    }

    return data;
  }
}
