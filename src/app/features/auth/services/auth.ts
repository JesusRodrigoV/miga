import { Injectable } from "@angular/core";
import { getSupabase } from "@core/services";
import {
  AuthResponse,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class Auth {
  async getSession() {
    const supabase = await getSupabase();
    return supabase.auth.getSession();
  }

  async getProfile(userId: string) {
    const supabase = await getSupabase();
    return supabase
      .from("profiles")
      .select("nombre, apellido")
      .eq("id", userId)
      .single();
  }

  async signIn(
    credentials: SignInWithPasswordCredentials,
  ): Promise<AuthResponse> {
    const supabase = await getSupabase();
    const response = await supabase.auth.signInWithPassword(credentials);
    if (response.error) {
      throw response.error;
    }
    return response;
  }

  async signUp(
    credentials: SignUpWithPasswordCredentials,
  ): Promise<AuthResponse> {
    const supabase = await getSupabase();
    const response = await supabase.auth.signUp(credentials);
    if (response.error) {
      throw response.error;
    }
    return response;
  }

  async insertProfile(id: string, nombre: string, apellido: string) {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from("profiles")
      .insert([{ id, nombre, apellido }]);
    if (error) {
      throw error;
    }
  }

  async signOut() {
    const supabase = await getSupabase();
    return supabase.auth.signOut();
  }
}
