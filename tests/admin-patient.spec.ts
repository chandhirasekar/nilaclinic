import { test, expect } from '@playwright/test';

test.describe('Admin Patient Management & API Tests', () => {
  const timestamp = Date.now();
  const testPatientName = `Automation Patient ${timestamp.toString().slice(-4)}`;
  const testPatientPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  test('API: Should register patient via POST /api/patients and retrieve it via GET', async ({ request }) => {
    // 1. Create a patient via API
    const postRes = await request.post('/api/patients', {
      data: {
        name: testPatientName,
        phone: testPatientPhone,
        storeId: 'NILA-TH',
        gender: 'Female',
        age: 27,
        email: `auto_${timestamp}@test.com`,
        address: 'Bazaar Street, Theni',
        notes: 'Playwright automation test record',
      },
    });

    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.success).toBe(true);
    expect(postData.data).toBeDefined();
    expect(postData.data.name).toBe(testPatientName);
    expect(postData.data.patientId).toMatch(/^CID-\d+$/);

    const generatedId = postData.data.patientId;

    // 2. Query /api/patients?storeCode=NILA-TH and confirm the new patient is in the list
    const getRes = await request.get('/api/patients?storeCode=NILA-TH');
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    expect(Array.isArray(getData.data)).toBe(true);

    const foundPatient = getData.data.find(
      (p: any) => p.name === testPatientName || p.phone === testPatientPhone || p.patientId === generatedId
    );
    expect(foundPatient).toBeDefined();
    expect(foundPatient.name).toBe(testPatientName);

    // 3. Search via query param
    const searchRes = await request.get(`/api/patients?storeCode=NILA-TH&search=${encodeURIComponent(testPatientName)}`);
    expect(searchRes.status()).toBe(200);
    const searchData = await searchRes.json();
    expect(searchData.success).toBe(true);
    expect(searchData.data.length).toBeGreaterThan(0);
    expect(searchData.data[0].name).toBe(testPatientName);
  });

  test('UI: Should open admin patients page, register a new patient, and show it in the list', async ({ page }) => {
    const uiPatientName = `UI Patient ${Date.now().toString().slice(-4)}`;
    const uiPatientPhone = `97${Math.floor(10000000 + Math.random() * 90000000)}`;

    await page.goto('/admin/patients');

    // Wait for the table to finish loading
    await expect(page.getByRole('heading', { name: 'Patient Entry & Live Clinic Queue' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    // Click "Register New Patient" button
    const registerBtn = page.getByRole('button', { name: /Register New Patient/i });
    await registerBtn.click();

    // Verify modal is open
    await expect(page.getByRole('heading', { name: /Patient Registration/i })).toBeVisible();

    // Fill form
    await page.locator('input[placeholder="e.g. Kavya Sundaram"]').fill(uiPatientName);
    await page.locator('input[placeholder="+91 98450 00000"]').fill(uiPatientPhone);
    await page.locator('input[placeholder="patient@gmail.com"]').fill(`ui_${Date.now()}@test.com`);
    await page.locator('input[placeholder="City, Area"]').fill('Theni Central');

    // Submit registration
    const submitBtn = page.getByRole('button', { name: /Save & Continue to Doctor/i });
    await submitBtn.click();

    // Modal closes or transitions to Doctor Assignment modal
    // Dismiss Doctor Assignment modal if open
    const doctorAssignHeading = page.getByRole('heading', { name: /Assign Doctor/i });
    try {
      await expect(doctorAssignHeading).toBeVisible({ timeout: 6000 });
      const cancelBtn = page.getByRole('button', { name: 'Cancel' }).last();
      await cancelBtn.click();
    } catch (e) {
      // Modal may have closed directly
    }

    // Verify the newly created patient appears in the table
    await expect(page.locator('table')).toContainText(uiPatientName);
    await expect(page.locator('table')).toContainText(uiPatientPhone);

    // Test real-time search input
    const searchInput = page.getByPlaceholder('Search by Mobile, Name, or Patient ID...');
    await searchInput.fill(uiPatientName);

    // Wait for debounce and filtered list
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toContainText(uiPatientName);
  });
});
