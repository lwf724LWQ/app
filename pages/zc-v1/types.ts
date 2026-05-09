export interface Match {
    matchInfoList: MatchInfoList[];
}

export interface MatchInfoList {
    businessDate: string;
    subMatchList: SubMatchList[];
    weekday:      string;
    matchCount:   number;
}

export interface SubMatchList {
    id:         string;
    fdate:      Date;
    numStr:     string;
    abbName:    string;
    htname:     string;
    atname:     string;
    mdate:      Date;
    mtime:      string;
    matchId:    string;
    mresult:    null;
    createTime: Date;
}


export enum MatchStatus {
    Define = "Define",
    Selling = "Selling",
}

export interface OddsList {
    a:             string;
    d:             string;
    goalLine:      GoalLine;
    goalLineF:     string;
    goalLineValue: string;
    h:             string;
    matchId:       number;
    matchNum:      number;
    odds:          string;
    poolCode:      PoolCode;
    poolId:        number;
    updateDate:    string;
    updateTime:    string;
}

export enum GoalLine {
    Empty = "",
    GoalLine100 = "+1.00",
    The100 = "-1.00",
}

export enum PoolCode {
    CRS = "CRS", // 半全场胜平负
    Empty = "", // 待开售
    Had = "HAD", // 胜负平
    Hafu = "HAFU", // 总进球数
    Hhad = "HHAD", // 让球胜平负
    Ttg = "TTG", // 比分
}

export interface PoolList {
    cbtAllUp:      number;
    cbtSingle:     number;
    cbtValue:      number;
    intAllUp:      number;
    intSingle:     number;
    intValue:      number;
    poolCode:      PoolCode;
    poolPrimaryId: number;
    poolStatus:    PoolStatus;
}

export enum PoolStatus {
    Empty = "",
    Selling = "Selling",
}
