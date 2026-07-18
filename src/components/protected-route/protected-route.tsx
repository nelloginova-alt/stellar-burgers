import { FC, ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from '../../services/store';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactElement;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const { user, isUserLoading } = useSelector((state) => state.user);
  console.log('ProtectedRoute user:', user);
  if (isUserLoading) {
    return null;
  }
  if (onlyUnAuth && user) {
    return <Navigate to='/' />;
  }
  if (!onlyUnAuth && user) {
    return <Navigate to='/login' />;
  }
  return children;
};
