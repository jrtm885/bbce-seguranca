export interface UserScope {
    operation: string,
    userEmail: string,
    frontScopes: number[],
    backScopes: number[]
}