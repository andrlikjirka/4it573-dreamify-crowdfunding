import {test, expect} from '@playwright/test';
import mongoose from "mongoose";
import path from 'path';
import { fileURLToPath } from 'url';
import {User} from "../src/model/user.model.js";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let conn = null;
const APP_URL = 'http://localhost:3001';

test.beforeAll(async () => {
  conn = await mongoose.connect('mongodb://127.0.0.1:27017', {
    user: 'and',
    pass: 'and',
    dbName: 'dreamify-db-test'
  });
  const user = new User({
    name: 'Admin Adminovič',
    email: 'admin@email.cz',
    role: 'admin',
    paypal_address: 'jirka@personal.example.com',
    hash: await bcrypt.hash('admin', 10)
  });
  await user.save();
});

test.beforeEach(async ({page}) => {
  await page.goto(APP_URL);
});

test('homepage has title', async ({ page }) => {
  await expect(page.getByRole('heading', {name: "dreamify"})).toBeVisible();
});

test('registration', async ({page}) => {
  await page.getByRole('link', {name: 'Registrace'}).click();
  await page.getByLabel('Jméno a Příjmení').fill('Test Testovič')
  await page.getByLabel('E-mail').fill('test@email.cz')
  await page.getByLabel('Adresa PayPal (email)').fill('test@personal.example.com')
  await page.getByLabel('Heslo').fill('test')
  await page.getByLabel('Potvrzení hesla').fill('test')
  await page.getByRole('button', {name: 'Registrovat se'}).click()
  await expect(page).toHaveURL('http://localhost:3001/');
  await expect(page.locator('.alert-success')).toHaveText('Registrace a první přihlášení proběhly úspěšně.')
});

test('login and logout', async ({page}) => {
  // login
  await page.getByRole('link', {name: 'Přihlásit'}).click();
  await page.getByLabel('E-mail').fill('test@email.cz')
  await page.getByLabel('Heslo').fill('test')
  await page.getByRole('button', {name: 'Přihlásit se'}).click()
  await expect(page).toHaveURL(APP_URL);
  // logout
  await page.locator('button.dropdown-toggle', { name: 'Test Testovič' }).click();
  await page.getByRole('link', {name: 'Odhlásit'}).click();
  await expect(page).toHaveURL(APP_URL);
  await expect(page.locator('.alert-success')).toHaveText('Odhlášení proběhlo úspěšně.')
});

test.describe('new dream', () => {
  test.beforeEach('login as user', async ({page}) => {
    await page.goto(APP_URL);
    await page.getByRole('link', {name: 'Přihlásit'}).click();
    await page.getByLabel('E-mail').fill('test@email.cz')
    await page.getByLabel('Heslo').fill('test')
    await page.getByRole('button', {name: 'Přihlásit se'}).click()
  });

  test('new dream', async ({page}) => {
    await page.getByRole('link', {name: 'Splň si svůj sen'}).click();
    await page.getByLabel('Co je tvým snem?').fill('Testovací sen');
    await page.locator('#dream-category').selectOption({label: 'Podnikání'});
    await page.getByLabel('Krátce shrň svůj sen').fill('Krátký popis testovacího snu');
    await page.frameLocator('iframe[title="Rich Text Area"]').getByLabel('Rich Text Area. Press ALT-0').fill('Dlouhý popis testovacího snu');
    await page.locator('#dream-goal').fill('10');
    await page.getByLabel('Kdy si chceš splnit svůj sen?').fill('2024-10-02');
    console.log(__dirname)
    await page.getByLabel('Obrázek tvého snu').setInputFiles(path.join(__dirname, 'test-dream.jpeg'));
    await page.getByRole('button', {name: 'Splň si svůj sen'}).click()
    await expect(page.getByRole('heading', {name: "Moje sny"})).toBeVisible();
    await expect(page.locator('.alert-success')).toHaveText('Přidání Vašeho nového snu proběhlo úspěšně.')
  });
});

test.describe('new dream approval process', () => {
  test.beforeEach('login as admin', async ({page}) => {
    await page.goto(APP_URL);
    await page.getByRole('link', {name: 'Přihlásit'}).click();
    await page.getByLabel('E-mail').fill('admin@email.cz')
    await page.getByLabel('Heslo').fill('admin')
    await page.getByRole('button', {name: 'Přihlásit se'}).click()
  });

  test.beforeEach('admin dashboard', async ({page}) => {
    await page.locator('button.dropdown-toggle', { name: 'Admin Testovič' }).click();
    await page.getByRole('link', {name: 'Administrace aplikace'}).click();
    await expect(page).toHaveURL(APP_URL + '/admin');
    await expect(page.getByRole('heading', {name: 'Administrace aplikace'})).toBeVisible();
  });

  test.describe('dreams administration', () => {
    test.beforeEach('admin dreams', async ({page}) => {
      await page.getByRole('link', {name: 'Administrace snů'}).click();
      await expect(page.getByRole('heading', {name: 'Administrace snů'})).toBeVisible();
    });

    test('new dream waiting', async ({page}) => {
      await page.getByRole('link', {name: 'Testovací sen'}).click();
      await expect(page.locator('#status')).toHaveText('Čeká na schválení');
      await expect(page.locator('#status')).toHaveClass(/bg-warning/);
    });

    test('dream cancel', async ({page}) => {
      await page.getByRole('link', {name: 'Testovací sen'}).click();
      await page.getByRole('button', {name: 'Zamítnout sen'}).click()
      await expect(page.locator('.alert-success')).toHaveText('Úprava snu proběhla úspěšně.')
      await expect(page.locator('#status')).toHaveText('Zamítnutý');
      await expect(page.locator('#status')).toHaveClass(/bg-danger/);
    });

    test('dream approved', async ({page}) => {
      await page.getByRole('link', {name: 'Testovací sen'}).click();
      await page.getByRole('button', {name: 'Schválit sen'}).click()
      await expect(page.locator('.alert-success')).toHaveText('Úprava snu proběhla úspěšně.')
      await expect(page.locator('#status')).toHaveText('Schválený');
      await expect(page.locator('#status')).toHaveClass(/bg-success/);
    });
  });
});

test.describe('dreams', () => {
  test.beforeEach('login as user', async ({page}) => {
    await page.goto(APP_URL);
    await page.getByRole('link', {name: 'Přihlásit'}).click();
    await page.getByLabel('E-mail').fill('test@email.cz')
    await page.getByLabel('Heslo').fill('test')
    await page.getByRole('button', {name: 'Přihlásit se'}).click()
  });

  test.beforeEach('goto', async ({page}) => {
    await page.getByRole('link', {name: 'Prozkoumej sny'}).click();
  })

  test('dream list', async ({page}) => {
    await expect(page.getByRole('heading', {name: 'Prozkoumej sny'})).toBeVisible();
    await expect(page.locator('#dreams')).toBeVisible();
  });

  test('dream detail', async ({page}) => {
    await page.getByRole('link', {name: 'Testovací sen'}).click();
    await expect(page.getByRole('heading', {name: 'Testovací sen'})).toBeVisible();
    await expect(page.getByRole('link', {name: 'Přispět'})).toBeVisible();
  });

  test('dream contribution', async ({page}) => {
    await page.getByRole('link', {name: 'Testovací sen'}).click();
    await page.getByRole('link', {name: 'Přispět'}).click();
    await expect(page.getByRole('heading', {name: 'Přispět na projekt: Testovací sen'})).toBeVisible();
    await expect(page.getByRole('heading', {name: 'Zadejte výši přispěvku'})).toBeVisible();
    await page.locator('#contribution').fill('1');
    await page.getByRole('button', {name: 'Přispět'}).click();
    await expect(page).toHaveURL(/sandbox.paypal.com/);
    await expect(page.getByRole('heading', {name: 'Pay with Paypal'})).toBeVisible();
    await page.locator('#email').fill('pepa@personal.example.com'); // pro testovací účely zadán jiný paypal než přihlášeného uživatele, který je autorem testovacího snu (nelze přispívat sám sobě)
    await page.locator('#btnNext').click();
    await page.locator('#password').fill('vZ5H>"X{');
    await page.locator('#btnLogin').click();
    await page.locator('#payment-submit-btn').click();
    await expect(page.locator('.alert-success')).toHaveText('Děkujeme za Váš příspěvek na realizaci daného snu.')
    await expect(page.locator('#pledged')).toHaveText('1');
    await expect(page.locator('#contributors_count')).toHaveText('1');
  });
});

test.describe('my dreams', () => {
  test.beforeEach('login as user', async ({page}) => {
    await page.goto(APP_URL);
    await page.getByRole('link', {name: 'Přihlásit'}).click();
    await page.getByLabel('E-mail').fill('test@email.cz')
    await page.getByLabel('Heslo').fill('test')
    await page.getByRole('button', {name: 'Přihlásit se'}).click()
  });

  test.beforeEach('goto', async ({page}) => {
    await page.locator('button.dropdown-toggle', {name: 'Test Testovič'}).click();
    await page.getByRole('link', {name: 'Moje sny'}).click();
  });

  test('my dreams list', async ({page}) => {
    await expect(page.getByRole('heading', {name: 'Moje sny'})).toBeVisible();
  });

  test('hide dream', async ({page}) => {
    await page.locator('#show-btn').click();
    await expect(page.locator('.alert-success')).toHaveText('Úprava Vašeho snu proběhla úspěšně.')
    await expect(page.locator('#show-btn svg')).toHaveClass(/bi-eye-slash/)
  });

  test('show dream', async ({page}) => {
    await page.locator('#show-btn').click();
    await expect(page.locator('.alert-success')).toHaveText('Úprava Vašeho snu proběhla úspěšně.')
    await expect(page.locator('#show-btn svg')).toHaveClass(/bi-eye/)
  });

  test('delete dream', async ({page}) => {
    await page.locator('#delete-btn').click();
    await expect(page.locator('.alert-success')).toHaveText('Zvolený sen byl úspěšně odebrán.')
  });
});

test.describe('my profile', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(APP_URL);
    await page.getByRole('link', {name: 'Přihlásit'}).click();
    await page.getByLabel('E-mail').fill('test@email.cz')
    await page.getByLabel('Heslo').fill('test')
    await page.getByRole('button', {name: 'Přihlásit se'}).click()
  });

  test.beforeEach('goto', async ({page}) => {
    await page.locator('button.dropdown-toggle', { name: 'Test Testovič' }).click();
    await page.getByRole('link', {name: 'Můj profil'}).click();
  });

  test('user profile edit', async ({page}) => {
    await expect(page.getByRole('heading', {name: "Můj profil"})).toBeVisible();

    await page.getByLabel('Jméno').fill('Test UpravenýTestovič');
    await page.getByRole('button', {name: 'Uložit změny'}).click()
    await expect(page.locator('.alert-success')).toHaveText('Úprava profilu proběhla úspěšně.')
    await expect(page.getByLabel('Jméno')).toHaveValue('Test UpravenýTestovič');
  });
});

test.afterAll(async () => {
  await conn.connection.db.dropDatabase()
});
