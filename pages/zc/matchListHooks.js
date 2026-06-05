import { ref, watch, computed } from "vue";
import lpinyin from "lpinyin"

let matchList = []

let mathchLeaguesBypinyin = []

function computedPinyinList(){
    const obj = {}
    matchList.forEach(item => {
        const leagueChsShort = item.leagueChsShort
        const a = new lpinyin(leagueChsShort)[0][0][0]
        if (obj[a]) {
            const leagueList = obj[a].leagueList
            const leagueObj = leagueList.find(item => item.name === leagueChsShort)
            if (leagueObj) {
                leagueObj.count ++
            }else{
                obj[a].leagueList.push({
                    name: leagueChsShort, count: 1
                })
            }
        }else{
            obj[a] = {
                leagueList: [{name: leagueChsShort, count: 1}]
            }
        }
    })
    console.log(obj)
    mathchLeaguesBypinyin = obj
}
const cbs = []

export function useMatchList(){
    let cbIndex = false
    return {
        setMatchList(list){
            matchList = list
            computedPinyinList()
            cbs.forEach(cb => {
                if (typeof cb === "function") {
                    try {
                        cb(mathchLeaguesBypinyin)
                    } catch (error) {
                        
                    }
                }
            })
        },
        leagueListChangeCallback(newcb){
            if(cbIndex !== false){
                cbs[cbIndex] === null
            }
            cbIndex = cbs.push(newcb)
        },
        unleagueListChangeCallback(){
            cbs[cbIndex] === null
        }
    }
}

export function filterItem(searchParams){
    const name = typeof searchParams.keyword === "string" ? searchParams.keyword.split(" ").map(item => item.trim().toUpperCase()).filter(item => item !== "") : [];
    const leagueList = searchParams.leagueList;
    
    return function (item){
        let nameFlag = true
        let leagueFlag = true

        if (leagueList instanceof Array && leagueList.length > 0) {
            leagueFlag = false
            leagueFlag = leagueList.map(league => league.name).includes(item.leagueChsShort)
        }
        
        if(name instanceof Array && name.length > 0){
            nameFlag = false
            nameFlag = name.some(n => ((item.homeChs.indexOf(n) >= 0)
            || (item.awayChs.indexOf(n) >= 0)
            || (item.leagueChsShort.indexOf(n) >= 0)))
        }
        
        return nameFlag && leagueFlag
    }
}