declare module 'potrace' {
  type TraceOptions = {
    threshold?: number;
    color?: string;
    background?: string;
    turdSize?: number;
    optTolerance?: number;
    blackOnWhite?: boolean;
  };
  const potrace: {
    trace(input: Buffer, options: TraceOptions, cb: (err: Error | null, svg: string) => void): void;
  };
  export default potrace;
}
