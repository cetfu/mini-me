// global.d.ts
declare class Go {
    importObject: any;

    run(instance: WebAssembly.Instance): void;
}


interface Window {
    generateMiniMe(base64: string, scale: number, slim: boolean): string
}

