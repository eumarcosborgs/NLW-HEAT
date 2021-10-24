import { VscGithubInverted } from 'react-icons/vsc';

import { useAuth } from '../../hooks/auth';

import styles from './styles.module.scss';

export const LoginBox: React.FC = () => {
  const { signInUrl } = useAuth();

  return (
    <div className={styles.loginBoxWrapper}>
      <strong>Entre e compartilhe sua menssagem</strong>
      <a href={signInUrl} className={styles.signInWithGithub}>
        <VscGithubInverted  size={24}/>
        Entrar com Github
      </a>
    </div>
  )
}
