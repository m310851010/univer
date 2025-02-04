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

import { awaitTime, Disposable, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/mockdata';
import { DisposeUniverCommand } from '../../commands/commands/unit.command';
import { getDefaultDocData } from './data/default-doc';
import { getDefaultWorkbookData } from './data/default-sheet';

const AWAIT_LOADING_TIMEOUT = 5000;
const AWAIT_DISPOSING_TIMEOUT = 5000;

// NOTE: this interface is copied to `e2e/e2e.d.ts`. When you modify this interface, make sure
// the duplication is updated as well.
export interface IE2EControllerAPI {
    loadAndRelease(id: number, loadTimeout?: number, disposeTimeout?: number): Promise<void>;
    loadDefaultSheet(loadTimeout?: number): Promise<void>;
    loadDemoSheet(): Promise<void>;
    loadDefaultDoc(loadTimeout?: number,): Promise<void>;
    disposeUniver(): Promise<void>;
    disposeCurrSheetUnit(disposeTimeout?: number): Promise<void>;
}

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        E2EControllerAPI: IE2EControllerAPI;
    }
}

/**
 * This controller expose a API on `Window` for the E2E tests.
 */
export class E2EController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initPlugin();
    }

    override dispose(): void {
        // @ts-ignore
        window.E2EControllerAPI = undefined;
    }

    private _initPlugin(): void {
        window.E2EControllerAPI = {
            loadAndRelease: (id, loadTimeout, disposeTimeout) => this._loadAndRelease(id, loadTimeout, disposeTimeout),
            loadDefaultSheet: (loadTimeout) => this._loadDefaultSheet(loadTimeout),
            loadDemoSheet: () => this._loadDemoSheet(),
            disposeCurrSheetUnit: (disposeTimeout?: number) => this._diposeDefaultSheetUnit(disposeTimeout),
            loadDefaultDoc: (loadTimeout) => this._loadDefaultDoc(loadTimeout),
            disposeUniver: () => this._disposeUniver(),
        };
    }

    private async _loadAndRelease(releaseId: number, loadingTimeout: number = AWAIT_LOADING_TIMEOUT, disposingTimeout: number = AWAIT_DISPOSING_TIMEOUT): Promise<void> {
        const unitId = `e2e${releaseId}`;
        const snapshot = getDefaultWorkbookData();
        snapshot.id = unitId;

        this._univerInstanceService.createUnit(UniverInstanceType.UNIVER_SHEET, snapshot);
        await awaitTime(loadingTimeout);

        this._univerInstanceService.disposeUnit(unitId);
        await awaitTime(disposingTimeout);
    }

    private async _loadDefaultSheet(loadingTimeout: number = AWAIT_LOADING_TIMEOUT): Promise<void> {
        this._univerInstanceService.createUnit(UniverInstanceType.UNIVER_SHEET, getDefaultWorkbookData());
        await awaitTime(loadingTimeout);
    }

    private async _loadDemoSheet(): Promise<void> {
        this._univerInstanceService.createUnit(UniverInstanceType.UNIVER_SHEET, DEFAULT_WORKBOOK_DATA_DEMO);
        await awaitTime(AWAIT_LOADING_TIMEOUT);
    }

    private async _loadDefaultDoc(loadingTimeout: number = AWAIT_LOADING_TIMEOUT): Promise<void> {
        this._univerInstanceService.createUnit(UniverInstanceType.UNIVER_DOC, getDefaultDocData());
        await awaitTime(loadingTimeout);
    }

    private async _disposeUniver(): Promise<void> {
        await this._commandService.executeCommand(DisposeUniverCommand.id);
    }

    private async _diposeDefaultSheetUnit(disposingTimeout: number = AWAIT_DISPOSING_TIMEOUT): Promise<void> {
        const unit = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET);
        const unitId = unit?.getUnitId();
        await this._univerInstanceService.disposeUnit(unitId || '');
        await awaitTime(disposingTimeout);
    }
}
