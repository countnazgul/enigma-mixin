/// <reference types="qlik-engineapi" />
export declare function mGetTablesAndFields(): Promise<{
    table: string;
    field: string;
}[]>;
export declare function mGetTables(): Promise<string[]>;
export declare function mGetFields(): Promise<string[]>;
export declare function mCreateSessionListbox(fieldName: string, state?: string, type?: string): Promise<{
    obj: EngineAPI.IGenericObject;
    layout: EngineAPI.IGenericBaseLayout;
    props: EngineAPI.IGenericObjectProperties;
}>;
