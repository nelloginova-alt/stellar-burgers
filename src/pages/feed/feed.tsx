import { useDispatch, useSelector } from '../../services/store';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { getFeeds } from '../../services/slices/feedSlice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const { orders, isFeedLoading, error } = useSelector((state) => state.feed);
  /** TODO: взять переменную из стора */
  // const orders: TOrder[] = [];

  useEffect(() => {
    dispatch(getFeeds());
  }, [dispatch]);

  if (isFeedLoading) return <Preloader />;
  if (error) return <div>error</div>;

  return <FeedUI orders={orders} handleGetFeeds={() => dispatch(getFeeds())} />;
};
