export interface IResult {
    count: number,
    bucket: number,
    remaining: number,
    limit: number,
    rate: number,
    rateLimit: number,
    isValid: boolean,
    reset: number,
    retry: number
}

export interface IResults {
    isValid: boolean,
    results?: IResult[]
}
