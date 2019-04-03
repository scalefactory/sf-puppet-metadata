declare module 'find-in-files' {
    export function find(pattern: string , directory: string, fileFilter: string): object[]
    export function findSync(pattern: string , directory: string, fileFilter: string): object[]
}
