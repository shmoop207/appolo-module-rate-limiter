import {RateLimitType} from "./rateLimitType";

export interface IRole {

    limit: number
    interval: number
    spread?: number | boolean
    bucket?: number
    reserve?: number
    start?: number
    forceUpdate?: boolean
}

export interface IRoles {
    key: string,
    slim?: boolean
    roles: IRole[],
    type?: RateLimitType
}
