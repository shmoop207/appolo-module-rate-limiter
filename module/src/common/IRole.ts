import {RateLimitType} from "./rateLimitType";

export interface IRole {

    limit: number
    interval: number
    spread?: number | boolean
    bucket?: number
    reserve?: number
    start?: number
}

export interface IRoles {
    key: string,
    slim?: boolean
    roles: IRole[],
    type?: RateLimitType
}
