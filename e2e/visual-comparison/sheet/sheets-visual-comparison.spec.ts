/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect, test } from '@playwright/test';
import { generateSnapshotName } from '../const';

test('diff default sheet content', async ({ page }) => {
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot(generateSnapshotName('default-sheet'), { maxDiffPixels: 5 });
});

test('diff demo sheet content', async ({ page }) => {
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet());
    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot(generateSnapshotName('demo-sheet'), { maxDiffPixels: 5 });
});
