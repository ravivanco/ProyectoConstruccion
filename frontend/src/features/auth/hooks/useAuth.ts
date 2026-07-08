import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/authApi';
import type { User } from '../../../shared/types';

export function useAuth() {
  const queryClient = useQueryClient();

  // Obtener el perfil (Query)
  const profileQuery = useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: authAPI.getProfile,
    retry: 0,
  });

  // Mutación para login (Mock por ahora, pero devuelve token)
  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authAPI.login(credentials.email, credentials.password),
    onSuccess: (data) => {
      // Idealmente aquí se guarda el token en localStorage o cookies
      localStorage.setItem('token', data.token);
      // Invalida la query de 'me' para forzar a recargar el perfil
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  return {
    user: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
  };
}
