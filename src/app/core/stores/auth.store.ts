import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { supabase } from "../supabase.client";
import {
  Session,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  User,
} from "@supabase/supabase-js";
import { Auth } from "@features/auth/services/auth";

type Profile = { nombre: string; apellido: string };

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
};

const initialState: AuthState = {
  session: null,
  profile: null,
  isLoading: false,
};

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withComputed(({ session, profile }) => ({
    isLoggedIn: computed(() => !!session),
    nombreCompleto: computed(() => {
      if (profile()) {
        return `${profile()?.nombre} ${profile()?.apellido}`;
      }
      return "";
    }),
  })),

  withMethods((store, authService = inject(Auth)) => ({
    async loadSession(): Promise<void> {
      patchState(store, { isLoading: true });
      const {
        data: { session },
      } = await authService.getSession();

      let profile: Profile | null = null;
      if (session?.user?.id) {
        const { data } = await authService.getProfile(session.user.id);
        profile = data as Profile;
      }

      patchState(store, { session, profile, isLoading: false });
    },

    async login(credentials: SignInWithPasswordCredentials): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        await authService.signIn(credentials);
        await this.loadSession();
      } catch (error) {
        patchState(store, { isLoading: false });
        throw error;
      }
    },

    async signup(
      credentials: SignUpWithPasswordCredentials,
      nombre: string,
      apellido: string,
    ): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const response = await authService.signUp(credentials);
        const userId = response.data.user?.id;

        if (!userId) {
          throw new Error("No se pudo crear el usuario");
        }

        await authService.insertProfile(userId, nombre, apellido);

        const {
          data: { session },
        } = await authService.getSession();

        patchState(store, {
          session,
          profile: { nombre, apellido },
          isLoading: false,
        });
      } catch (error) {
        patchState(store, { isLoading: false });
        throw error;
      }
    },

    async logout() {
      patchState(store, { isLoading: true });

      try {
        await authService.signOut();
      } catch (error) {
        console.error("Error en el signOut de Supabase:", error);
      } finally {
        patchState(store, initialState);
      }
    },
  })),
);
