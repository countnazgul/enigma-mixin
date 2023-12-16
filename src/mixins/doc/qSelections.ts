import { string, boolean } from "banditypes";

import { IGenericBaseLayout } from "../../index.doc";
import {
  validateSelectInField,
  validateSelectInFieldBySearch,
} from "./validations/selections";

export interface IGenericBaseLayoutExt extends IGenericBaseLayout {
  qListObject: {
    qDataPages: EngineAPI.INxDataPage[];
    qSize: EngineAPI.ISize;
    qStateName: string;
    qDimensionInfo: {
      qError?: EngineAPI.INxValidationError;
    };
  };
}

async function iGetSelectionsNative(
  qDoc: EngineAPI.IApp
): Promise<EngineAPI.IGenericSelectionListLayout> {
  const lbDef: EngineAPI.IGenericSelectionListProperties = {
    qInfo: {
      qId: "",
      qType: "CurrentSelection",
    },
    qSelectionObjectDef: {},
  };

  const sessionObj = await qDoc.createSessionObject(lbDef);

  const selections = await sessionObj.getLayout();

  await qDoc.destroySessionObject(sessionObj.id);

  return selections;
}

export async function mSelectionsAll(): Promise<EngineAPI.ISelectionListObject> {
  const _this: EngineAPI.IApp = this;
  const selections = await iGetSelectionsNative(_this);

  return selections.qSelectionObject;
}

export async function mSelectionsFields(): Promise<string[]> {
  const _this: EngineAPI.IApp = this;

  const selections = await iGetSelectionsNative(_this);

  const fieldsSelected = selections.qSelectionObject.qSelections.map(function (
    s
  ) {
    return s.qField;
  });

  return fieldsSelected;
}

export async function mSelectionsSimple(): Promise<
  { field: string; values: string[] }[]
> {
  const _this: EngineAPI.IApp = this;
  const selections = await iGetSelectionsNative(_this);

  return selections.qSelectionObject.qSelections.map(function (s) {
    const values = s.qSelectedFieldSelectionInfo.map(function (f) {
      return f.qName;
    });

    return { field: s.qField, values };
  });
}

export async function mSelectionsSimpleGrouped(): Promise<
  { field: string; value: string }[]
> {
  const _this: EngineAPI.IApp = this;
  const selections = await iGetSelectionsNative(_this);

  return selections.qSelectionObject.qSelections
    .map(function (s) {
      return s.qSelectedFieldSelectionInfo.map(function (f) {
        return { field: s.qField, value: f.qName };
      });
    })
    .flat();
}

export async function mSelectInFieldBySearch(
  fieldName: string,
  searchTerm: string,
  toggle?: boolean,
  state?: string
): Promise<boolean> {
  const _this: EngineAPI.IApp = this;

  const { defaultedState, defaultedToggle } =
    validateSelectInFieldBySearch(arguments);

  let { obj: sessionObj, layout } = await _this.mCreateSessionListbox(
    fieldName,
    {
      state: defaultedState,
    }
  );

  if (layout.qListObject?.qDimensionInfo.qError?.qErrorCode)
    throw new Error(
      `Field "${fieldName}" do not exists. Error code: ${layout.qListObject.qDimensionInfo.qError.qErrorCode}`
    );

  const searchResponse = await sessionObj.searchListObjectFor(
    "/qListObjectDef",
    searchTerm
  );

  if (!searchResponse)
    throw new Error(
      `Error while searching the field "${fieldName}" for "${searchTerm}"`
    );

  await sessionObj.acceptListObjectSearch("/qListObjectDef", defaultedToggle);

  await _this.destroySessionObject(sessionObj.id);

  return searchResponse;
}

export async function mSelectInField(
  fieldName: string,
  values: (string | number)[],
  toggle?: boolean,
  state?: string
) {
  const _this: EngineAPI.IApp = this;

  const { defaultedState, defaultedToggle } = validateSelectInField(arguments);

  const { obj: sessionObj, layout } = await _this.mCreateSessionListbox(
    fieldName,
    {
      destroyOnComplete: false,
      getAllData: true,
      state: defaultedState,
    }
  );

  if (layout.qListObject?.qDimensionInfo.qError?.qErrorCode)
    throw new Error(
      `Field "${fieldName}" do not exists. Error code: ${layout.qListObject.qDimensionInfo.qError.qErrorCode}`
    );

  const index: number[] = layout.qListObject.qDataPages[0].qMatrix
    .filter((m) => values.indexOf(m[0].qText) > -1)
    .map((e) => e[0].qElemNumber as number);

  const selection = await sessionObj.selectListObjectValues(
    "/qListObjectDef",
    index,
    defaultedToggle
  );

  // async function selectMore() {
  //   //
  // }

  async function destroy() {
    await _this.destroySessionObject(sessionObj.id);
  }

  return { selection, destroy };
}
