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
      await authService.signIn(credentials);
      await this.loadSession();
    },

    async signup(
      credentials: SignUpWithPasswordCredentials,
      nombre: string,
      apellido: string,
    ): Promise<void> {
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
      });
    },

    async logout() {
      await authService.signOut();
      patchState(store, initialState);
    },
  })),
);
