import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC } from 'react';
import { useSelector } from '../../services/store';

export const ProfileOrders: FC = () => {
  /** TODO: взять переменную из стора */
  const { orders } = useSelector((state) => state.feed);

  return <ProfileOrdersUI orders={orders || []} />;
};
