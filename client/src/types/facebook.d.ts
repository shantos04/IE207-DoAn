// Global type definitions for Facebook SDK
declare global {
    interface Window {
        FB: {
            init: (config: any) => void
            login: (callback: any, options?: any) => void
            api: (path: string, options: any, callback: any) => void
        }
        fbAsyncInit: () => void
    }
}

export { }
