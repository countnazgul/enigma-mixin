/// <reference types="qlik-engineapi" />
export declare function mSelectionsAll(): Promise<EngineAPI.ISelectionListObject>;
export declare function mSelectionsFields(): Promise<string[]>;
export declare function mSelectionsSimple(): Promise<{
    field: string;
    values: string[];
}[]>;
export declare function mSelectionsSimpleGrouped(): Promise<{
    field: string;
    value: string;
}[]>;
export declare function mSelectInField(fieldName: string, values: any[], toggle?: boolean, state?: string): Promise<boolean>;
