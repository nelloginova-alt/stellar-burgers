import { FC, useMemo, useEffect } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useSelector, useDispatch } from '../../services/store';
import { useParams } from 'react-router-dom';
import { getOrderByNumber } from '../../services/slices/orderSlice';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  /** TODO: взять переменные orderData и ingredients из стора */
  const dispatch = useDispatch();

  const { order: singleOrder } = useSelector((state) => state.order);
  const { ingredients } = useSelector((state) => state.ingredients);
  const feedOrders = useSelector((state) => state.feed.orders || []);

  const orderData = useMemo(() => {
    const inFeed = feedOrders.find((num) => num.number === Number(number));
    if (inFeed) return inFeed;
    if (singleOrder?.number === Number(number)) {
      return singleOrder;
    }

    return null;
  }, [number, feedOrders, singleOrder]);

  useEffect(() => {
    if (!orderData) {
      dispatch(getOrderByNumber(Number(number)));
    }
  }, [orderData, dispatch, number]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
