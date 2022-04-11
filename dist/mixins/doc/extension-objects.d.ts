/// <reference types="qlik-engineapi" />
export declare function mExtensionObjectsAll(): Promise<{
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
}[]>;
