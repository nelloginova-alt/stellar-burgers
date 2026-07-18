import { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TConstructorIngredient, TOrder } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useSelector, useDispatch, RootState } from '../../services/store';
import { createOrder } from '../../services/slices/orderSlice';
import { clearIngredient } from '../../services/slices/constructorSlice';

export const BurgerConstructor: FC = () => {
  /** TODO: взять переменные constructorItems, orderRequest и orderModalData из стора */
  const constructorState = useSelector(
    (state: RootState) => state.burgerConstructor
  );

  const constructorItems = {
    bun: constructorState?.bun || null,
    ingredients: constructorState?.ingredients || []
  };

  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [orderRequest, setOrderRequest] = useState(false);
  const [orderModalData, setOrderModalData] = useState<TOrder | null>(null);

  const onOrderClick = () => {
    if (!constructorItems.bun || orderRequest) return;
    console.log('user:', user);
    if (!user) {
      console.log('Редирект на /login');
      navigate('/login');
      return;
    }

    const ingredientsId = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id
    ];

    setOrderRequest(true);
    dispatch(createOrder(ingredientsId))
      .unwrap()
      .then((data) => {
        setOrderModalData(data);
        setOrderRequest(false);
        dispatch(clearIngredient());
      })
      .catch(() => {
        setOrderRequest(false);
      });
  };

  const closeOrderModal = () => {
    setOrderModalData(null);
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
