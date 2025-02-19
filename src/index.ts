import EventEmitter from "node-event-emitter";

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
  mGetAlwaysOneSelectedFields,
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
  mGetDefaultBookmarkId,
} from "./mixins/doc/bookmarks";

import { mEmptyApp } from "./mixins/doc/emptyApp";

import { mGetAllData, mGetAllDataMatrix } from "./mixins/object/getAllData";

import { mUnbuild } from "./mixins/doc/unbuild";
import { mBuild } from "./mixins/doc/build";

import { mGetReloadProgress } from "./mixins/global/mGetReloadProgress";

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
      mGetAlwaysOneSelectedFields(): Promise<string[]>;
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
      mGetDefaultBookmarkId(): Promise<string>;
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
      /**
       * @experimental
       *
       * Removes the data from the app. If "keepOneSelected" is set to "true"
       * Then the app will contain a record for each field which is "always one selected".
       * This way the checkbox will be preserved.
       *
       * The data is purged by temporary replacing the script with an empty one and
       * reloading the app. Once the reload is complete (and the data is no more) then
       * the original script is brought back and the app is saved
       */
      mEmptyApp(
        /**
         * If set to true the resulted app will contain data only for the
         * fields that are "always one selected". These fields will contain
         * only one record/value - the current timestamp. This way the
         * "always one selected" checkbox will be preserved
         */
        keepOneSelected?: boolean
      ): Promise<boolean>;
    }

    export interface IGlobal {
      /**
       * Get reload progress in human readable form - similar to what Qlik outputs when app is being reloaded
       * @param {number} [options.qRequestId=-1] identifier of the DoReload or DoSave request. Default is -1
       */
      mGetReloadProgress(qRequestId?: string): {
        emitter: EventEmitter;
        /**
         * Start pooling Qlik for the reload progress. Emit each message via the "emitter" property.
         * Once the reload is complete dont forget to call "stop()" method to stop the pooling and clear
         * the memory
         * @param {Object} [options] - additional options
         * @param {number} [options.poolInterval=200] how ofter to get the reload progress. Default is 200ms
         * @param {boolean} [options.skipTransientMessages=false] show only the main messages. Default is false
         * @param {boolean} [options.includeTimeStamp=false] show timestamp for each message. Default is false
         * @param {boolean} [options.trimLeadingMessage=false] Some default messages have a leading space. This setting will trim it. Default is false
         */
        start(options?: {
          poolInterval?: number;
          skipTransientMessages?: boolean;
          includeTimeStamp?: boolean;
          trimLeadingMessage?: boolean;
        }): void;
        /**
         * Once the reload is complete stop getting the reload progress
         */
        stop(): void;
      };
    }

    export interface IGenericObject {
      /**
       * Paginate through all the object data and returns array of qMatrix
       */
      mGetAllDataMatrix(): Promise<EngineAPI.INxCellRows[]>;
      /**
       * Paginate through all the object data and returns array of the values
       */
      mGetAllData(): Promise<any[]>;
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
      mGetAlwaysOneSelectedFields,
      mExtensionObjectsAll,
      mBuild,
      mUnbuild,
      mCloneBookmark,
      mCreateBookmarkFromMeta,
      mGetBookmarkMeta,
      mGetBookmarkValues,
      mGetBookmarksMeta,
      mGetDefaultBookmarkId,
      mEmptyApp,
    },
  },
];

export const globalMixin = [
  {
    types: ["Global"],
    init(args) {},
    extend: {
      mGetReloadProgress,
    },
  },
];

export const objectMixin = [
  {
    types: ["GenericObject"],
    init(args) {},
    extend: {
      mGetAllData,
      mGetAllDataMatrix,
    },
  },
];
