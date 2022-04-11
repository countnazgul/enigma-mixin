/// <reference types="qlik-engineapi" />
export declare function mVariableGetAll(showConfig?: boolean, showReserved?: boolean): Promise<EngineAPI.INxVariableListItem[]>;
export declare function mVariableUpdateById(id: string, name?: string, definition?: string, comment?: string): Promise<EngineAPI.IGenericVariableProperties>;
export declare function mVariableUpdateByName(name: string, newName?: string, definition?: string, comment?: string): Promise<EngineAPI.IGenericVariableProperties>;
export declare function mVariableCreate(name: string, definition?: string, comment?: string): Promise<EngineAPI.IGenericVariableProperties>;
