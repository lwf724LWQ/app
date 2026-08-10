import { ref, watch, computed } from "vue";
import lpinyin from "lpinyin"
import { getFootBallLeagueList } from "@/api/apis"

function computedPinyinList(list){
    const obj = {}
    console.log(`开始处理拼音`, list)
     list.forEach(item => {
        const pingyin = ((s)=>{
            if (typeof s === "string") {
                try {
                    return new lpinyin(s)[0][0][0]
                } catch (error) {
                    return s[0]
                }
            }
            return "#"
        })(item.leagueChsShort)

        if (obj[pingyin]) {
            const leagueList = obj[pingyin].leagueList
            const leagueObj = leagueList.find(item => item.name === item.leagueChsShort)
            if (leagueObj) {
                leagueObj.count ++
            }else{
                obj[pingyin].leagueList.push({
                    name: item.leagueChsShort, count: 1
                })
            }
        }else{
            obj[pingyin] = {
                leagueList: [{name: item.leagueChsShort, count: 1}]
            }
        }
    })
    console.log("拼音处理结果", obj)
    return obj
}

const leagueList = ref([])
const leagueListWithPinyin = ref([])

const TOP_LEAGUE_NAMES = ['中超', '英超', '西甲', '意甲', '德甲', '法甲'] // 置顶数组

let isLoad = false

export function useMatchList(){
    if (isLoad) {
        return {
            leagueList: leagueList,
            leagueListWithPinyin: leagueListWithPinyin
        }
    }
    isLoad = true
    let cbIndex = false

    uni.showLoading()
    getFootBallLeagueList().then((res) => {
        const dataMap = new Map()
        res.data.forEach(item => {
            dataMap.set(item.leagueChsShort, item)
        })
        // 按置顶数组顺序构建置顶列表（缺失则补占位项）
        const topItems = TOP_LEAGUE_NAMES.map(name => {
            return dataMap.get(name) || { leagueChsShort: name }
        })

        const otherItems = res.data.filter(item => !TOP_LEAGUE_NAMES.includes(item.leagueChsShort));

        const sortedData = [...topItems, ...otherItems];
        // 添加“全部”在最前面
        const fullData = [{leagueChsShort: "全部"}, ...sortedData];
        const list = fullData.map((item, index) => ({index, ...item}))

        leagueList.value = [...list].map((item, index) => ({id: index, name: item.leagueChsShort, ...item}))
        leagueListWithPinyin.value = computedPinyinList(list)
    }).finally(()=>{
        uni.hideLoading()
    })

    return {
        leagueList: leagueList,
        leagueListWithPinyin: leagueListWithPinyin
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
            const searchStr = `${item.homeChs} ${item.awayChs} ${item.leagueChsShort}`
            nameFlag = name.some(n => (searchStr.indexOf(n) >= 0))
        }

        return nameFlag && leagueFlag
    }
}
