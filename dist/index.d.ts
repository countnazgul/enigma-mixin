/// <reference types="qlik-engineapi" />
import { mVariableCreate, mVariableGetAll, mVariableUpdateById, mVariableUpdateByName } from "./mixins/doc/qVariables";
import { mCreateSessionListbox, mGetFields, mGetTables, mGetTablesAndFields } from "./mixins/doc/qTablesAndFields";
import { mSelectInField, mSelectionsAll, mSelectionsFields, mSelectionsSimple, mSelectionsSimpleGrouped } from "./mixins/doc/qSelections";
import { mExtensionObjectsAll } from "./mixins/doc/extension-objects";
import { mCloneBookmark, mCreateBookmarkFromMeta, mGetBookmarkMeta, mGetBookmarkValues, mGetBookmarksMeta } from "./mixins/doc/bookmarks";
import { mUnbuild } from "./mixins/doc/unbuild";
import { mBuild } from "./mixins/doc/build";
declare global {
    module EngineAPI {
        interface IApp {
            mUnbuild(sections?: ("variables" | "script" | "appProperties" | "connections" | "measures" | "dimensions" | "objects" | "bookmarks")[]): Promise<IUnbuildApp>;
            mBuild(arg: {
                variables?: EngineAPI.IGenericVariableProperties[];
                script?: string;
                appProperties?: EngineAPI.INxAppProperties;
                connections?: EngineAPI.IConnection[];
                measures?: EngineAPI.IGenericMeasureProperties[];
                dimensions?: EngineAPI.IGenericDimensionProperties[];
                objects?: (EngineAPI.IGenericObjectEntry | EngineAPI.IGenericObjectProperties)[];
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
            mVariableGetAll(showSession?: boolean, showReserved?: boolean): Promise<EngineAPI.INxVariableListItem[]>;
            mVariableUpdateById(id: string, name?: string, definition?: string, comment?: string): Promise<EngineAPI.IGenericVariableProperties>;
            mVariableUpdateByName(name: string, newName: string, definition?: string, comment?: string): Promise<EngineAPI.IGenericVariableProperties>;
            mVariableCreate(name: string, definition?: string, comment?: string): Promise<EngineAPI.IGenericVariableProperties>;
            mCreateSessionListbox(fieldName: string, state?: string, type?: string): Promise<{
                obj: EngineAPI.IGenericObject;
                layout: EngineAPI.IGenericBaseLayout;
                props: EngineAPI.IGenericObjectProperties;
            }>;
            mGetTables(): Promise<string[]>;
            mGetTablesAndFields(): Promise<{
                table: string;
                field: string;
            }[]>;
            mGetFields(): Promise<string[]>;
            mSelectionsAll(): Promise<EngineAPI.ISelectionListObject>;
            mSelectionsSimple(): Promise<{
                field: string;
                values: string[];
            }[]>;
            mSelectionsSimpleGrouped(): Promise<{
                field: string;
                value: string;
            }[]>;
            mSelectionsFields(): Promise<string[]>;
            mSelectInField(fieldName: string, values: any[], toggle?: boolean, state?: string): Promise<boolean>;
            mExtensionObjectsAll(): Promise<IExtension[]>;
            mGetBookmarkMeta(bookmarkId: string, state?: string): Promise<IMBookmarkMeta>;
            mGetBookmarksMeta(state?: string): Promise<IMBookmarkMeta[]>;
            mCreateBookmarkFromMeta(bookmarkMeta: IMBookmarkMeta, title: string, description?: string): Promise<string>;
            mGetBookmarkValues(bookmarkId: string, state?: string): Promise<IBookmarkValue[]>;
            mCloneBookmark(sourceBookmarkId: string, title: string, description?: string, state?: string): Promise<string>;
            getSetAnalysis(qStateName?: string, qBookmarkId?: string): Promise<string>;
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
    objects: (EngineAPI.IGenericObjectEntry | EngineAPI.IGenericObjectProperties)[];
}
export declare const docMixin: {
    types: string[];
    init(args: any): void;
    extend: {
        mSelectInField: typeof mSelectInField;
        mSelectionsAll: typeof mSelectionsAll;
        mSelectionsFields: typeof mSelectionsFields;
        mSelectionsSimple: typeof mSelectionsSimple;
        mSelectionsSimpleGrouped: typeof mSelectionsSimpleGrouped;
        mVariableCreate: typeof mVariableCreate;
        mVariableGetAll: typeof mVariableGetAll;
        mVariableUpdateById: typeof mVariableUpdateById;
        mVariableUpdateByName: typeof mVariableUpdateByName;
        mCreateSessionListbox: typeof mCreateSessionListbox;
        mGetFields: typeof mGetFields;
        mGetTables: typeof mGetTables;
        mGetTablesAndFields: typeof mGetTablesAndFields;
        mExtensionObjectsAll: typeof mExtensionObjectsAll;
        mBuild: typeof mBuild;
        mUnbuild: typeof mUnbuild;
        mCloneBookmark: typeof mCloneBookmark;
        mCreateBookmarkFromMeta: typeof mCreateBookmarkFromMeta;
        mGetBookmarkMeta: typeof mGetBookmarkMeta;
        mGetBookmarkValues: typeof mGetBookmarkValues;
        mGetBookmarksMeta: typeof mGetBookmarksMeta;
    };
}[];
