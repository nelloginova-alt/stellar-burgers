import { test, expect } from '@playwright/test';

test.describe('интеграционные тесты конструктора', () => {

  test.beforeEach(async ({page}) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false,
    });

    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            email: 'test@yandex.ru',
            name: 'Пользователь'
          }
        })
      })
    });

    await page.goto('/');
  });

  test('открытие модального окна с полным описанием ингридиента, закрывание по клику на крестик', async ({page}) => {
    const ingredientName = 'Краторная булка N-200i';

    const ingredientCard = page.locator('a').filter({ hasText: ingredientName});
    await expect(ingredientCard).toBeVisible();
    await ingredientCard.click();

    const modal = page.locator('#modals');
    const modalHeader = modal.getByText(/детали ингридиента/i);
    await expect(modalHeader).toBeVisible();

    const modalIngredientTitle = page.getByRole('heading', { name: ingredientName });
    await expect(modalIngredientTitle).toBeVisible();

    const closeButton = page.getByTestId('close-modal-button');
    await closeButton.click();

    await expect(modalHeader).not.toBeVisible();
  });

  test('добавление начинки в конструктор', async ({page}) => {
    const ingredientName = 'Соус Spicy-X';

    const ingredientCard = page.locator('li').filter({ hasText: ingredientName});
    await expect(ingredientCard).toBeVisible();

    const addButton = ingredientCard.getByRole('button', { name: 'Добавить' });
    await addButton.click();

    const constructor = page.locator('.constructor-element').filter({ hasText: ingredientName });
    await expect(constructor).toBeVisible();
  });

  test('оформление заказа и мокирование авторизации и API', async ({page, context}) => {

    await context.addCookies([
      {
        name: 'accessToken',
        value: 'test-access-token',
        url: 'http://localhost:4000',
      }
    ]);
    
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            email: 'test@yandex.ru',
            name: 'Пользователь'
          }
        })
      })
    });

    await page.route('**/api/orders', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          name: 'Тестовый бургер',
          order: {
            number: 123456
          }
        })
      })
    });

    await page.goto('/');

    const bunCard = page.locator('li').filter({ hasText: 'Краторная булка N-200i' });
    await bunCard.getByRole('button', {name: 'Добавить'}).click();

    const fillingCard = page.locator('li').filter({ hasText: 'Соус Spicy-X' });
    await fillingCard.getByRole('button', {name: 'Добавить'}).click();

    const orderButton = page.getByRole('button', {name: 'Оформить заказ'});
    await expect(orderButton).toBeVisible();
    await orderButton.click();

    const modal = page.locator('#modals');
    const modalOrderNumber = modal.getByText('123456');
    await expect(modalOrderNumber).toBeVisible();

    const closeButton = modal.getByTestId('close-modal-button');
    await closeButton.click();
    await expect(modalOrderNumber).not.toBeVisible();

    const addedFilling = page.locator('.constructor-element').filter({ hasText: 'Соус Spicy-X' });
    await expect(addedFilling).not.toBeVisible();

    const addedBun = page.locator('.constructor-element').filter({ hasText: 'Краторная булка N-200i' });
    await expect(addedBun).not.toBeVisible();
  })
});

test.describe('тестирование модального окна ингредиента', () => {

  test.beforeEach(async ({page}) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false
    });

    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            email: 'test@yandex.ru',
            name: 'Пользователь'
          }
        })
      })
    });

    await page.goto('/');
  });

  test('открытие и закрытие по крестику модального окна', async ({page}) => {
    const ingredient = page.locator('a').filter({ hasText: 'Соус Spicy-X' });
    await ingredient.click();

    const modal = page.locator('#modals');
    const modalTitle = modal.getByText('Детали ингридиента');
    await expect(modalTitle).toBeVisible();

    const ingredientName = modal.getByText('Соус Spicy-X');
    await expect(ingredientName).toBeVisible();

    const closeButton = page.getByTestId('close-modal-button');
    await closeButton.click();
    await expect(modalTitle).not.toBeVisible();
  });

  test('закрытие модального окна по оверлею', async ({page}) => {
    await page.locator('a').filter({ hasText: 'Соус Spicy-X' }).click();
    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингридиента')).toBeVisible();

    const overlay = page.getByTestId('modal-overlay');
    await overlay.click({ position: {x: 10, y: 10}});
    await expect(page.getByText('Детали ингридиента')).not.toBeVisible();
  });

  test('закрытие модального окна нажатием на Escape', async ({page}) => {
    await page.locator('a').filter({ hasText: 'Соус Spicy-X' }).click();
    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингридиента')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByText('Детали ингридиента')).not.toBeVisible();
  })
});

test.describe('авторизация и защищенные маршруты', () => {

  test.beforeEach(async ({page}) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false,
    })
  });

  test('редирект неавторизованного пользователя на страницу логина', async ({page}) => {

    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Необходимо авторизоваться'
        })
      })
    });

    await page.goto('/profile');
    await expect(page).toHaveURL('/login');

    const loginButton = page.getByRole('button', {name: 'Войти'});
    await expect(loginButton).toBeVisible();
  });

  test('успешный вход пользователя', async ({page}) => {

    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Необходимо авторизоваться'
        })
      })
    });
    
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          user: {
            email: 'test@yandex.ru',
            name: 'Пользователь'
          }
        })
      })
    });

    await page.goto('/login');

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]')
    const loginButton = page.getByRole('button', {name: 'Войти'});

    await emailInput.fill('test@yandex.ru');
    await passwordInput.fill('password');

    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            email: 'test@yandex.ru',
            name: 'Пользователь'
          }
        })
      })
    });

    await loginButton.click();
    await expect(page).toHaveURL('/')
  })
});

test.describe('лента заказов', () => {
  test.beforeEach(async ({page}) => {
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false,
    });

    await page.route('**/api/auth/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'test@yandex.ru', name: 'Пользователь' }
        })
      });
    });

    await page.route('**/api/orders/all', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: [
            {
              _id: '233',
              ingredients: ['643d69a5c3f7b9001cfa093c', '643d69a5c3f7b9001cfa0941'],
              status: 'done',
              name: 'Order',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
              number: 123456
            }
          ],
          total: 1000,
          totalToday: 10
        })
      })
    });

    await page.route('**/api/orders/123456', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: [
            {
              _id: '233',
              ingredients: ['643d69a5c3f7b9001cfa093c', '643d69a5c3f7b9001cfa0941'],
              status: 'done',
              name: 'Order',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
              number: 123456
            }
          ]
        })
      })
    });

    await page.goto('/feed');
  });

  test('отображение списка заказов в ленте', async ({page}) => {
    const orderName = page.getByText('Order');
    await expect(orderName).toBeVisible();

    const orderNumber = page.getByText('#123456');
    await expect(orderNumber).toBeVisible();
  });

  test('открытие модального окна с деталями заказа', async ({page}) => {
    const orderCard = page.locator('a').filter({ hasText: 'Order' });
    await orderCard.click();

    await expect(page).toHaveURL(/.*\/feed\/123456/);
 
    const orderNumberElement = page.getByTestId('modal-order-number');
    await expect(orderNumberElement).toBeVisible();
    await expect(orderNumberElement).toContainText('123456');
  })
})

