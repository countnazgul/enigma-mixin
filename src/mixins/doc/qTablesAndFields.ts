import { INxCellListBox } from "../..";
import { IGenericBaseLayoutExt } from "./qSelections";

export interface IGenericObjectPropertiesExt
  extends EngineAPI.IGenericObjectProperties {
  qListObjectDef: {
    qExpressions: string[];
    qFrequencyMode: string;
    qStateName: string;
    qInitialDataFetch: EngineAPI.INxPage[];
    qDef: {
      qActiveField: number;
      qFieldDefs: string[];
      qFieldLabels: string[];
      qGrouping: string;
      qNumberPresentations: EngineAPI.IFieldAttributes[];
      qSortCriterias: EngineAPI.ISortCriteria[];
    };
  };
}

export async function mGetTablesAndFields(): Promise<
  { table: string; field: string }[]
> {
  const _this: EngineAPI.IApp = this;

  const tables = await _this.getTablesAndKeys(
    {} as EngineAPI.ISize,
    {} as EngineAPI.ISize,
    0,
    true,
    false
  );

  return tables.qtr
    .map(function (t) {
      return t.qFields.map(function (f) {
        return { table: t.qName, field: f.qName };
      });
    })
    .flat();
}

export async function mGetTables(): Promise<string[]> {
  const _this: EngineAPI.IApp = this;

  const qTables = await _this.getTablesAndKeys(
    {} as EngineAPI.ISize,
    {} as EngineAPI.ISize,
    0,
    true,
    false
  );

  return qTables.qtr.map((t) => t.qName);
}

export async function mGetFields(): Promise<string[]> {
  const _this: EngineAPI.IApp = this;

  const qTables = await _this.getTablesAndKeys(
    {} as EngineAPI.ISize,
    {} as EngineAPI.ISize,
    0,
    true,
    false
  );

  return qTables.qtr
    .map(function (t) {
      return t.qFields.map(function (f) {
        return f.qName;
      });
    })
    .flat();
}

// TODO: option to specify if full data to be extracted (loop though all data pages)
export async function mCreateSessionListbox(
  fieldName: string,
  /**
   * Additional options
   */
  options?: {
    /**
     * Create the object in specific state. Defaults to $
     */
    state?: string;
    /**
     * Type of the object. Defaults to session-listbox
     */
    type?: string;
    /**
     * Destroy the session object at the end
     */
    destroyOnComplete?: boolean;
    /**
     * By default the first 10 000 values will be extracted and returned. If need all set this option to true
     */
    getAllData?: boolean;
  }
): Promise<{
  obj: EngineAPI.IGenericObject;
  layout: IGenericBaseLayoutExt;
  props: IGenericObjectPropertiesExt;
  flattenData(): INxCellListBox[];
}> {
  const _this: EngineAPI.IApp = this;
  const dataPageHeight: number = 10000;

  const lbDef = {
    qInfo: {
      qType: options && options.type ? options.type : "session-listbox",
    },
    qListObjectDef: {
      qStateName: options && options.state ? options.state : "$",
      qDef: {
        qFieldDefs: [fieldName],
        qSortCriterias: [
          {
            qSortByState: 1,
            qExpression: {},
          },
        ],
      },
      qInitialDataFetch: [
        {
          qTop: 0,
          qLeft: 0,
          qHeight: dataPageHeight,
          qWidth: 1,
        },
      ],
    },
  };

  const obj = await _this.createSessionObject(lbDef);
  const [props, layout] = await Promise.all([
    (await obj.getProperties()) as IGenericObjectPropertiesExt,
    (await obj.getLayout()) as IGenericBaseLayoutExt,
  ]);

  if (options && options.getAllData) {
    // calculate the total possible data pages
    const dataPages = Math.ceil(
      (layout.qListObject.qDimensionInfo as any).qCardinal / dataPageHeight
    );

    // if more than 1 then extract all (the first page is already extracted with the initial load)
    if (dataPages > 1) {
      // generate index for all data pages
      const pages = Array.from({ length: dataPages - 1 }, (_, i) => i + 1);

      await Promise.all(
        pages.map(async (i) => {
          const pageData = await obj.getListObjectData("/qListObjectDef", [
            {
              qTop: i * dataPageHeight,
              qLeft: 0,
              qHeight: dataPageHeight,
              qWidth: 0,
            },
          ]);

          // push the result to the layout object
          layout.qListObject.qDataPages.push(pageData[0]);
        })
      );
    }
  }

  if (options && options.destroyOnComplete == true)
    await _this.destroySessionObject(obj.id);

  // call this function to receive all the data in flat format
  // flat the qMatrix of each qDataPage
  const flattenData = () =>
    layout.qListObject.qDataPages
      .map((dp) => dp.qMatrix)
      .flat(Infinity) as INxCellListBox[];

  return {
    obj,
    layout,
    props,
    flattenData,
  };
}

export async function mGetSyntheticTables(): Promise<EngineAPI.ITableRecord[]> {
  const _this: EngineAPI.IApp = this;

  const tables = await _this.getTablesAndKeys(
    {} as EngineAPI.ISize,
    {} as EngineAPI.ISize,
    0,
    true,
    false
  );

  return tables.qtr.filter((t) => t.qIsSynthetic && t.qIsSynthetic == true);
}
