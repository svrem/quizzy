declare global {
  interface Window {
    umami:
      | {
          track: (event: string) => Promise<void>;
          identify: (
            id: string,
            properties: Record<string, any>,
          ) => Promise<void>;
        }
      | undefined;
  }
}

export {};
