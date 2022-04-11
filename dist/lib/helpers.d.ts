interface CommError {
    message: string;
}
export declare function handlePromise1<T>(promise: any): Promise<[T | undefined, CommError | undefined]>;
export {};
