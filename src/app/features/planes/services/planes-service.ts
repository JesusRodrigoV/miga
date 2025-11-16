import { Injectable } from "@angular/core";
import { supabase } from "@core/services";

@Injectable({
  providedIn: "root",
})
export class PlanesService {
  /**
   * Obtiene todos los planes de la base de datos.
   */
  async getPlanes(): Promise<any> {
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
