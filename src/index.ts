import {
  mVariableCreate,
  mVariableGetAll,
  mVariableUpdateById,
  mVariableUpdateByName,
} from "./mixins/doc/qVariables";
import {
  IGenericObjectPropertiesExt,
  mCreateSessionListbox,
  mGetFields,
  mGetTables,
  mGetTablesAndFields,
  mGetSyntheticTables,
} from "./mixins/doc/qTablesAndFields";
import {
  IGenericBaseLayoutExt,
  mSelectInField,
  mSelectionsAll,
  mSelectionsFields,
  mSelectInFieldBySearch,
  mSelectionsSimple,
  mSelectionsSimpleGrouped,
} from "./mixins/doc/qSelections";
import { mExtensionObjectsAll } from "./mixins/doc/extension-objects";
import {
  mCloneBookmark,
  mCreateBookmarkFromMeta,
  mGetBookmarkMeta,
  mGetBookmarkValues,
  mGetBookmarksMeta,
} from "./mixins/doc/bookmarks";

import { mUnbuild } from "./mixins/doc/unbuild";
import { mBuild } from "./mixins/doc/build";

declare global {
  module EngineAPI {
    export interface IApp {
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
        variables?: EngineAPI.IGenericVariableProperties[];
        script?: string;
        appProperties?: EngineAPI.INxAppProperties;
        connections?: EngineAPI.IConnection[];
        measures?: EngineAPI.IGenericMeasureProperties[];
        dimensions?: EngineAPI.IGenericDimensionProperties[];
        objects?: (
          | EngineAPI.IGenericObjectEntry
          | EngineAPI.IGenericObjectProperties
        )[];
        bookmarks?: {
          properties: EngineAPI.IGenericBookmarkProperties;
          layout: EngineAPI.IGenericBookmarkLayout;
          setAnalysisRaw: string;
          setAnalysisDestructed: {
            field: string;
            values: string | EngineAPI.IFieldValue;
            type: string;
          }[];
        }[];
      }): Promise<IUnbuildApp>;
      /**
       * List all variables in document
       * @param showSession - (OPTIONAL) return session variables
       * @param showReserved - (OPTIONAL) return reserved variables
       */
      mVariableGetAll(
        showSession?: boolean,
        showReserved?: boolean
      ): Promise<EngineAPI.INxVariableListItem[]>;
      /**
       * Update variable by providing the variable id
       * @param id - id of the variable to be updated
       * @param name - (OPTIONAL) variable new name
       * @param definition - (OPTIONAL) variable new definition (expression)
       * @param comment - (OPTIONAL) variable new comment
       */
      mVariableUpdateById(
        id: string,
        name?: string,
        definition?: string,
        comment?: string
      ): Promise<EngineAPI.IGenericVariableProperties>;
      /**
       * Update variable by providing the variable name
       * @param name - name of the variable to be updates
       * @param newName - variable new name
       * @param definition - (OPTIONAL) variable new definition (expression)
       * @param comment - (OPTIONAL) variable new comment
       */
      mVariableUpdateByName(
        name: string,
        newName: string,
        definition?: string,
        comment?: string
      ): Promise<EngineAPI.IGenericVariableProperties>;
      /**
       * Create new variable
       * @param name - name for the new variable
       * @param definition - (OPTIONAL) new variable definition (expression)
       * @param comment - (OPTIONAL) new variable comment
       */
      mVariableCreate(
        name: string,
        definition?: string,
        comment?: string
      ): Promise<EngineAPI.IGenericVariableProperties>;
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
        obj: EngineAPI.IGenericObject;
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
      mGetTables(): Promise<string[]>;
      mGetTablesAndFields(): Promise<{ table: string; field: string }[]>;
      mGetFields(): Promise<string[]>;
      mGetSyntheticTables(): Promise<EngineAPI.ITableRecord[]>;
      mSelectionsAll(): Promise<EngineAPI.ISelectionListObject>;
      mSelectionsSimple(): Promise<{ field: string; values: string[] }[]>;
      mSelectionsSimpleGrouped(): Promise<{ field: string; value: string }[]>;
      mSelectionsFields(): Promise<string[]>;
      mSelectInField(
        fieldName: string,
        values: any[],
        toggle?: boolean,
        state?: string
      ): Promise<{
        selection: boolean;
        selectMore: void;
        destroy: void;
      }>;
      /**
       * Select values in a field by search criteria.
       * The search criteria result is automatically accepted.
       */
      mSelectInFieldBySearch(
        /**
         *
         */
        fieldName: string,
        /**
         * What to search for
         */
        searchTerm: string,
        /**
         * Set to true to keep any selections present in the list object. If missing then "false" is assumed
         */
        toggle?: boolean,
        /**
         * In which state to make the selection. If missing then "$" is used
         */
        state?: string
      ): Promise<boolean>;
      /**
       * @experimental
       */
      mExtensionObjectsAll(): Promise<IExtension[]>;
      /**
       * @experimental
       */
      mGetBookmarkMeta(
        bookmarkId: string,
        state?: string
      ): Promise<IMBookmarkMeta>;
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
      getSetAnalysis(
        qStateName?: string,
        qBookmarkId?: string
      ): Promise<string>;
    }
  }
}

export interface ISetAnalysisDestructed {
  field: string;
  type: string;
  values: string | EngineAPI.IFieldValue;
}

export interface IExtension {
  appId: string;
  appName: string;
  objId: string;
  objType: string;
  extName: any;
  extVersion: any;
  extVisible: any;
  extIsBundle: boolean;
  extIsLibrary: any;
  qProps: EngineAPI.IGenericObjectProperties;
}

export interface IBookmarkValue {
  field: string;
  values: string | EngineAPI.IFieldValue;
  type: string;
}

export interface IMBookmarkMeta {
  properties: EngineAPI.IGenericBookmarkProperties;
  layout: EngineAPI.IGenericBookmarkLayout;
  setAnalysisRaw: string;
  setAnalysisDestructed: ISetAnalysisDestructed[];
}

export interface IUnbuildApp {
  variables: EngineAPI.INxVariableListItem[];
  script: string;
  appProperties: EngineAPI.INxAppProperties;
  connections: EngineAPI.IConnection[];
  dimensions: EngineAPI.IGenericDimensionProperties[];
  measures: EngineAPI.IGenericMeasureProperties[];
  objects: (
    | EngineAPI.IGenericObjectEntry
    | EngineAPI.IGenericObjectProperties
  )[];
}

export interface INxCellListBox {
  qText: string;
  qNum: number | undefined;
  qElemNumber: number;
  qState: EngineAPI.NxCellStateType;
}

export const docMixin = [
  {
    types: ["Doc"],
    init(args) {},
    extend: {
      mSelectInField,
      mSelectInFieldBySearch,
      mSelectionsAll,
      mSelectionsFields,
      mSelectionsSimple,
      mSelectionsSimpleGrouped,
      mVariableCreate,
      mVariableGetAll,
      mVariableUpdateById,
      mVariableUpdateByName,
      mCreateSessionListbox,
      mGetFields,
      mGetTables,
      mGetTablesAndFields,
      mGetSyntheticTables,
      mExtensionObjectsAll,
      mBuild,
      mUnbuild,
      mCloneBookmark,
      mCreateBookmarkFromMeta,
      mGetBookmarkMeta,
      mGetBookmarkValues,
      mGetBookmarksMeta,
    },
  },
];
