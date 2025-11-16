import { Injectable } from "@angular/core";
import { supabase } from "@core/services";
import {
  AuthResponse,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";

@Injectable({
  providedIn: "root",
})
export class Auth {
  getSession() {
    return supabase.auth.getSession();
  }
  getProfile(userId: string) {
    return supabase
      .from("profiles")
      .select("nombre, apellido")
      .eq("id", userId)
      .single();
  }
  async signIn(
    credentials: SignInWithPasswordCredentials,
  ): Promise<AuthResponse> {
    const response = await supabase.auth.signInWithPassword(credentials);
    if (response.error) {
      throw response.error;
    }
    return response;
  }

  async signUp(
    credentials: SignUpWithPasswordCredentials,
  ): Promise<AuthResponse> {
    const response = await supabase.auth.signUp(credentials);
    if (response.error) {
      throw response.error;
    }
    return response;
  }

  async insertProfile(id: string, nombre: string, apellido: string) {
    const { error } = await supabase
      .from("profiles")
      .insert([{ id, nombre, apellido }]);
    if (error) {
      throw error;
    }
  }

  signOut() {
    return supabase.auth.signOut();
  }
}
