import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

interface IUser {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

interface IAuthState {
  token: string;
  user: IUser;
}

interface IAuthContextData {
  user: IUser | null;
  signInUrl: string;
  signOut(): void;
  token: string | null;
}

const AuthContext = createContext({} as IAuthContextData);

const AuthProvider: React.FC = ({children}) => {
  const [data, setData] = useState<IAuthState>(() => {
    const token = localStorage.getItem('@doWhile:token');
    const user = localStorage.getItem('@doWhile:user');

    if (token && user) {
      return { token, user: JSON.parse(user) };
    }

    return {} as IAuthState;
  });


  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=b487625b245a68553a8a`;

  const signIn =  useCallback(async (githubCode: string) => {
    const response = await api.post<IAuthState>('authenticate', {
      code: githubCode,
    });

    const {token, user} = response.data;

    localStorage.setItem('@doWhile:token', token);
    localStorage.setItem('@doWhile:user', JSON.stringify(user));

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setData({token, user})

  },[api])

  const signOut = useCallback(() => {
    localStorage.removeItem('@doWhile:token');
    localStorage.removeItem('@doWhile:user');

    setData({} as IAuthState);
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes('?code=');

    if (data.token) {
      api.defaults.headers.common.authorization = `Bearer ${data.token}`;
    }

    if(hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split('?code=');

      window.history.pushState({}, '', urlWithoutCode);

      signIn(githubCode);
    }
  },[data])

  return (
    <AuthContext.Provider value={{ signInUrl, user: data.user, signOut, token: data.token}}>
      {children}
    </AuthContext.Provider>
  )
}


function useAuth(): IAuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export {AuthProvider, useAuth};
