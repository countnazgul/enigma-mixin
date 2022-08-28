import { INxCellListBox } from ".";
import { IGenericBaseLayoutExt } from "./mixins/doc/qSelections";
import { IGenericObjectPropertiesExt } from "./mixins/doc/qTablesAndFields";

export { INxCellListBox } from ".";
export { IGenericBaseLayoutExt } from "./mixins/doc/qSelections";
export { IGenericObjectPropertiesExt } from "./mixins/doc/qTablesAndFields";

export interface INxVariableListItem extends EngineAPI.INxVariableListItem {}
export interface IGenericVariableProperties
  extends EngineAPI.IGenericVariableProperties {}
export interface IFieldValue extends EngineAPI.IFieldValue {}
export interface ISelectionListObject extends EngineAPI.ISelectionListObject {}
export interface IGenericObject extends EngineAPI.IGenericObject {}
export interface IGenericBaseLayout extends EngineAPI.IGenericBaseLayout {}
export interface IGenericObjectProperties
  extends EngineAPI.IGenericObjectProperties {}
export interface IGenericBookmarkProperties
  extends EngineAPI.IGenericBookmarkProperties {}
export interface IGenericBookmarkLayout
  extends EngineAPI.IGenericBookmarkLayout {}
export interface INxAppProperties extends EngineAPI.INxAppProperties {}
export interface IConnection extends EngineAPI.IConnection {}
export interface IGenericDimensionProperties
  extends EngineAPI.IGenericDimensionProperties {}
export interface IGenericMeasureProperties
  extends EngineAPI.IGenericMeasureProperties {}
export interface IGenericObjectEntry extends EngineAPI.IGenericObjectEntry {}
export interface ITableRecord extends EngineAPI.ITableRecord {}
export interface IGenericObject extends EngineAPI.IGenericObject {}

export type ISetAnalysisDestructed = {
  field: string;
  type: string;
  values: string | IFieldValue;
};

export type IExtension = {
  appId: string;
  appName: string;
  objId: string;
  objType: string;
  extName: any;
  extVersion: any;
  extVisible: any;
  extIsBundle: boolean;
  extIsLibrary: any;
  qProps: IGenericObjectProperties;
};

export type IBookmarkValue = {
  field: string;
  values: string | IFieldValue;
  type: string;
};

export type IMBookmarkMeta = {
  properties: IGenericBookmarkProperties;
  layout: IGenericBookmarkLayout;
  setAnalysisRaw: string;
  setAnalysisDestructed: ISetAnalysisDestructed[];
};

export interface IUnbuildApp {
  variables: INxVariableListItem[];
  script: string;
  appProperties: INxAppProperties;
  connections: IConnection[];
  dimensions: IGenericDimensionProperties[];
  measures: IGenericMeasureProperties[];
  objects: (IGenericObjectEntry | IGenericObjectProperties)[];
}

export interface DocMixin {
  /**
   * @experimental
   */
  mGetBookmarkMeta(bookmarkId: string, state?: string): Promise<IMBookmarkMeta>;
  /**
   * @experimental
   */
  mGetBookmarksMeta(state?: string): Promise<IMBookmarkMeta[]>;
  /**
   * @experimental
   */
  mCreateBookmarkFromMeta(
    bookmarkMeta: IMBookmarkMeta,
    title: string,
    description?: string
  ): Promise<string>;
  /**
   * @experimental
   */
  mGetBookmarkValues(
    bookmarkId: string,
    state?: string
  ): Promise<IBookmarkValue[]>;
  /**
   * @experimental
   */
  mCloneBookmark(
    sourceBookmarkId: string,
    title: string,
    description?: string,
    state?: string
  ): Promise<string>;
  /**
   * @experimental
   */
  mExtensionObjectsAll(): Promise<IExtension[]>;
  /**
   *
   * @param showSession - return session variables
   * @param showReserved - return reserved variables
   */
  mVariableGetAll(
    showSession?: boolean,
    showReserved?: boolean
  ): Promise<INxVariableListItem[]>;
  /**
   *
   * @param id - id of the variable to be updated
   * @param name - variable new name
   * @param definition - variable new definition (expression)
   * @param comment - variable new comment
   */
  mVariableUpdateById(
    id: string,
    name?: string,
    definition?: string,
    comment?: string
  ): Promise<IGenericVariableProperties>;
  /**
   *
   * @param name - name of the variable to be updates
   * @param newName - variable new name
   * @param definition - variable new definition (expression)
   * @param comment - variable new comment
   */
  mVariableUpdateByName(
    name: string,
    newName: string,
    definition?: string,
    comment?: string
  ): Promise<IGenericVariableProperties>;
  /**
   *
   * @param name - name for the new variable
   * @param definition - new variable definition (expression)
   * @param comment - new variable comment
   */
  mVariableCreate(
    name: string,
    definition?: string,
    comment?: string
  ): Promise<IGenericVariableProperties>;
  mSelectionsAll(): Promise<ISelectionListObject>;
  mSelectionsSimple(): Promise<{ field: string; values: string[] }[]>;
  mSelectionsSimpleGrouped(): Promise<{ field: string; value: string }[]>;
  mSelectInField(): Promise<boolean>;
  mGetTables(): Promise<string[]>;
  mGetTablesAndFields(): Promise<{ table: string; field: string }[]>;
  mGetFields(): Promise<string[]>;
  mGetSyntheticTables(): Promise<ITableRecord[]>;
  /**
   * @experimental
   */
  mUnbuild(
    sections?: (
      | "variables"
      | "script"
      | "appProperties"
      | "connections"
      | "measures"
      | "dimensions"
      | "objects"
      | "bookmarks"
    )[]
  ): Promise<IUnbuildApp>;
  /**
   * @experimental
   */
  mBuild(arg: {
    variables?: IGenericVariableProperties[];
    script?: string;
    appProperties?: INxAppProperties;
    connections?: IConnection[];
    measures?: IGenericMeasureProperties[];
    dimensions?: IGenericDimensionProperties[];
    objects?: (IGenericObjectEntry | IGenericObjectProperties)[];
    bookmarks?: {
      properties: IGenericBookmarkProperties;
      layout: IGenericBookmarkLayout;
      setAnalysisRaw: string;
      setAnalysisDestructed: {
        field: string;
        values: string | IFieldValue;
        type: string;
      }[];
    }[];
  }): Promise<IUnbuildApp>;
  mCreateSessionListbox(
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
    /**
     * Qlik object (returned from createSessionObject call)
     */
    obj: IGenericObject;
    /**
     * Qlik object layout (returned from getLayout() call)
     */
    layout: IGenericBaseLayoutExt;
    /**
     * Qlik object properties (returned from getProperties() call)
     */
    props: IGenericObjectPropertiesExt;
    /**
     * Function that returns the data in flat format
     * by flattening qMatrix of each qDataPage
     */
    flattenData(): INxCellListBox[];
  }>;
}
