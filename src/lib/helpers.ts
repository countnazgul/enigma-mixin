interface CommError {
  message: string;
}

export function handlePromise1<T>(
  promise
): Promise<[T | undefined, CommError | undefined]> {
  return promise
    .then((data: T) => [data, undefined])
    .catch((error) => Promise.resolve([undefined, error as CommError]));
}
