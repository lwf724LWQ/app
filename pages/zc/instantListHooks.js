import { ref, computed, nextTick, watch } from "vue";
import { getFootBallList } from "@/api/apis";
import { getAccount } from "@/utils/request.js";
import dayjs from "dayjs";

export const TOP_LEAGUE_NAMES = ["中超", "英超", "西甲", "意甲", "德甲", "法甲"];
export const ALL_TAB_NAME = "全部";
const CUSTOM_LEAGUE_STORAGE_KEY = "zcInstantCustomLeagues";
const MAX_CUSTOM_LEAGUES = 3;
const REFRESHER_CLOSE_DELAY = 300;
export const MOUNT_RANGE = 1;
const LIVE_MSTATES = [1, 2, 3, 4, 5];

const BASE_LEAGUE_TABS = [
  { id: 0, name: ALL_TAB_NAME, leagueChsShort: ALL_TAB_NAME },
  ...TOP_LEAGUE_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    leagueChsShort: name
  }))
];

function loadCustomLeagues() {
  try {
    const raw = uni.getStorageSync(CUSTOM_LEAGUE_STORAGE_KEY);
    let list = raw;
    if (typeof raw === "string" && raw) {
      list = JSON.parse(raw);
    }
    if (!Array.isArray(list)) return [];
    return list
      .map((item) => (typeof item === "string" ? item : item?.name))
      .filter((name) => !!name && name !== ALL_TAB_NAME && !TOP_LEAGUE_NAMES.includes(name))
      .slice(0, MAX_CUSTOM_LEAGUES);
  } catch (e) {
    return [];
  }
}

function saveCustomLeagues(list) {
  uni.setStorageSync(CUSTOM_LEAGUE_STORAGE_KEY, list.slice(0, MAX_CUSTOM_LEAGUES));
}

const customLeagueNames = ref(loadCustomLeagues());
const leagueList = computed(() => {
  const customs = customLeagueNames.value.map((name, index) => ({
    id: BASE_LEAGUE_TABS.length + index,
    name,
    leagueChsShort: name,
    isCustom: true
  }));
  return [...BASE_LEAGUE_TABS, ...customs];
});

const matchListMap = ref({});
const matchListWithDayMap = ref({});
const currentBeforeDayMap = ref({});
const currentLastDayMap = ref({});
const firstLoadedMap = ref({});
const noMoreMap = ref({});
const loadingBeforeMap = ref({});
const loadingMoreMap = ref({});

const pickerIndex = ref(0);
const refresherTriggered = ref(false);
const isLoadRefresh = ref(false);
const scrollIntoViewMap = ref({});
const allPagingRef = ref(null);
const allVirtualList = ref([]);
const isProMode = ref(!!uni.getStorageSync("searchProMode"));

const allRefresherText = {
  default: "继续下拉加载上一天",
  pulling: "松开开始加载",
  refreshing: "正在加载...",
  complete: "加载成功"
};

const refresherStatusText = computed(() =>
  refresherTriggered.value ? allRefresherText.refreshing : allRefresherText.default
);

let refreshTimer = null;
let lastHandledSelectName = "";
let started = false;
let onUpdateMatchList = () => {};

export function setInstantListEmitter(fn) {
  onUpdateMatchList = typeof fn === "function" ? fn : () => {};
}

function isLiveMatch(match) {
  return LIVE_MSTATES.includes(Number(match?.mstate));
}

function sortAllTabList(list) {
  return [...(list || [])].sort((a, b) => {
    const aLive = isLiveMatch(a) ? 1 : 0;
    const bLive = isLiveMatch(b) ? 1 : 0;
    if (bLive !== aLive) return bLive - aLive;
    if ((b.flag || 0) !== (a.flag || 0)) return (b.flag || 0) - (a.flag || 0);
    if ((b.mstate || 0) !== (a.mstate || 0)) return (b.mstate || 0) - (a.mstate || 0);
    return dayjs(a.matchTime).valueOf() - dayjs(b.matchTime).valueOf();
  });
}

function getTabKey(tabIdx = pickerIndex.value) {
  return leagueList.value[tabIdx]?.name || ALL_TAB_NAME;
}

function isTabMounted(idx) {
  if (idx === 0) return true;
  return Math.abs(idx - pickerIndex.value) <= MOUNT_RANGE;
}

function initTabState(tabKey) {
  if (!tabKey) return;
  if (!matchListMap.value[tabKey]) matchListMap.value[tabKey] = [];
  if (!currentBeforeDayMap.value[tabKey]) currentBeforeDayMap.value[tabKey] = dayjs();
  if (!currentLastDayMap.value[tabKey]) currentLastDayMap.value[tabKey] = dayjs();
  if (noMoreMap.value[tabKey] == null) noMoreMap.value[tabKey] = false;
}

function resetTabRange(tabKey) {
  currentBeforeDayMap.value[tabKey] = dayjs();
  currentLastDayMap.value[tabKey] = dayjs();
  noMoreMap.value[tabKey] = false;
}

function isTabNoMore(idx) {
  return !!noMoreMap.value[getTabKey(idx)];
}

function isTabLoadingMore(idx) {
  return !!loadingMoreMap.value[getTabKey(idx)];
}

function dateFormatWithBackEnd(date) {
  return dayjs(date).format("YYYY/M/D");
}

function dayAnchorId(tabIdx, dayId) {
  return `day_${tabIdx}_${dayId}`;
}

function extractLeagueName(selected) {
  if (selected == null || selected === "") return "";
  if (typeof selected === "string") return selected;
  if (Array.isArray(selected)) {
    const first = selected[0];
    if (!first) return "";
    return typeof first === "string" ? first : (first?.name || "");
  }
  if (typeof selected === "object") return selected.name || "";
  return "";
}

function sortLeagueNames(names) {
  return [...names].sort((a, b) => {
    const ai = TOP_LEAGUE_NAMES.indexOf(a);
    const bi = TOP_LEAGUE_NAMES.indexOf(b);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return String(a).localeCompare(String(b), "zh");
  });
}

function sortMatchList(list) {
  return [...list].sort((a, b) => {
    const aLive = isLiveMatch(a) ? 1 : 0;
    const bLive = isLiveMatch(b) ? 1 : 0;
    if (bLive !== aLive) return bLive - aLive;
    if ((b.flag || 0) !== (a.flag || 0)) return (b.flag || 0) - (a.flag || 0);
    if ((b.mstate || 0) !== (a.mstate || 0)) return (b.mstate || 0) - (a.mstate || 0);
    return dayjs(a.matchTime).valueOf() - dayjs(b.matchTime).valueOf();
  });
}

function computeDayList(matchList, beforeDay, lastDay, { fillEmptyDays = true } = {}) {
  const dayList = [];
  const dayIndex = new Map();
  let i = 0;

  if (fillEmptyDays && beforeDay && lastDay) {
    let day = beforeDay;
    while (dayjs(day).isBefore(lastDay) || dayjs(day).isSame(lastDay, "day")) {
      const datestr = dayjs(day).format("YYYY/MM/DD dddd");
      const item = { datestr, id: i, leagues: [] };
      dayList.push(item);
      dayIndex.set(datestr, item);
      i++;
      day = dayjs(day).add(1, "day");
    }
  }

  const byDay = new Map();
  for (const match of matchList || []) {
    const datestr = dayjs(match.matchTime).format("YYYY/MM/DD dddd");
    if (!byDay.has(datestr)) byDay.set(datestr, []);
    byDay.get(datestr).push(match);
  }

  for (const [datestr, matches] of byDay.entries()) {
    let dayItem = dayIndex.get(datestr);
    if (!dayItem) {
      dayItem = { datestr, id: i++, leagues: [] };
      dayList.push(dayItem);
      dayIndex.set(datestr, dayItem);
    }

    const leagueMap = new Map();
    for (const match of matches) {
      const leagueName = match.leagueChsShort || "未知联赛";
      if (!leagueMap.has(leagueName)) leagueMap.set(leagueName, []);
      leagueMap.get(leagueName).push(match);
    }

    dayItem.leagues = sortLeagueNames([...leagueMap.keys()]).map((name) => ({
      name,
      list: sortMatchList(leagueMap.get(name))
    }));
  }

  return dayList;
}

function flattenAllCells(list) {
  const matchList = (list || []).filter((item) => item && item.matchId);
  const dayList = computeDayList(
    matchList,
    currentBeforeDayMap.value[ALL_TAB_NAME],
    currentLastDayMap.value[ALL_TAB_NAME],
    { fillEmptyDays: false }
  );
  const cells = [];
  const todayStr = dayjs().format("YYYY/MM/DD dddd");
  const sortedDays = [...dayList].sort(
    (a, b) =>
      dayjs(a.datestr.split(" ")[0]).valueOf() - dayjs(b.datestr.split(" ")[0]).valueOf()
  );
  for (const day of sortedDays) {
    const dayKey = `day_all_${day.datestr}`;
    cells.push({
      id: dayKey,
      zpKey: dayKey,
      _cellType: "date",
      datestr: day.datestr === todayStr ? "今日全部赛事" : day.datestr
    });
    const dayMatches = [];
    for (const league of day.leagues) {
      dayMatches.push(...(league.list || []));
    }
    if (!dayMatches.length) {
      cells.push({
        id: `empty_all_${day.datestr}`,
        zpKey: `empty_all_${day.datestr}`,
        _cellType: "empty"
      });
      continue;
    }
    for (const match of sortMatchList(dayMatches)) {
      cells.push({ ...match, _cellType: "match" });
    }
  }
  return cells;
}

function setAllPagingRef(el) {
  allPagingRef.value = el || null;
}

function syncAllPaging(list, { complete = false, noMore = null } = {}) {
  const cells = flattenAllCells(sortAllTabList(list));
  const paging = allPagingRef.value;
  if (!paging) return cells;
  if (complete) {
    paging.complete(cells);
  } else {
    paging.resetTotalData?.(cells);
  }
  if (noMore != null) {
    paging.completeByNoMore?.([], noMore);
  }
  return cells;
}

function getDayCellRange(cells, day) {
  const datestr = dayjs(day).format("YYYY/MM/DD dddd");
  const todayStr = dayjs().format("YYYY/MM/DD dddd");
  const label = datestr === todayStr ? "今日全部赛事" : datestr;
  const dayKey = `day_all_${datestr}`;
  let start = -1;
  let end = -1;
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (cell._cellType === "date" && (cell.zpKey === dayKey || cell.datestr === label)) {
      start = i;
      end = i;
      continue;
    }
    if (start >= 0) {
      if (cell._cellType === "date") break;
      end = i;
    }
  }
  return start >= 0 ? { start, end } : null;
}

/** 取某一天「按状态排序后」场次的倒数第二个（不足则取最后一个） */
function getDaySortedSecondLastMatch(dayMatches) {
  const sorted = sortMatchList(dayMatches || []);
  if (!sorted.length) return null;
  return sorted[Math.max(0, sorted.length - 2)];
}

function scrollAllPagingToDaySecondLast(day, cells) {
  const list = cells || [];
  const range = getDayCellRange(list, day);
  const paging = allPagingRef.value;
  if (!range || !paging) return;

  const dayMatches = [];
  for (let i = range.start; i <= range.end; i++) {
    if (list[i]?._cellType === "match") dayMatches.push(list[i]);
  }
  const targetMatch = getDaySortedSecondLastMatch(dayMatches);
  let targetIndex = range.start;
  if (targetMatch) {
    const found = list.findIndex(
      (cell, idx) =>
        idx >= range.start &&
        idx <= range.end &&
        cell._cellType === "match" &&
        cell.id === targetMatch.id
    );
    if (found >= 0) targetIndex = found;
  }

  nextTick(() => {
    setTimeout(() => {
      const ref = allPagingRef.value;
      if (!ref) return;
      const cache = ref.virtualHeightCacheList;
      if (cache && cache[targetIndex]) {
        ref.scrollIntoViewByIndex?.(targetIndex, 0, false);
        return;
      }
      const measured = (cache || []).filter((item) => item && item.height > 0);
      const avg = measured.length
        ? measured.reduce((sum, item) => sum + item.height, 0) / measured.length
        : 120;
      ref.scrollToY?.(avg * targetIndex, 0, false);
    }, 150);
  });
}

function scrollLeagueToDaySecondLast(tabIdx, day) {
  const dayList = matchListWithDayMap.value[tabIdx] || [];
  const datestr = dayjs(day).format("YYYY/MM/DD dddd");
  const dayItem = dayList.find((item) => item.datestr === datestr);
  if (!dayItem) return;

  const dayMatches = [];
  for (const league of dayItem.leagues || []) {
    dayMatches.push(...(league.list || []));
  }
  const targetMatch = getDaySortedSecondLastMatch(dayMatches);
  const targetId = targetMatch
    ? `id_${targetMatch.id}`
    : dayAnchorId(tabIdx, dayItem.id);

  scrollIntoViewMap.value[tabIdx] = "";
  nextTick(() => {
    scrollIntoViewMap.value[tabIdx] = targetId;
  });
}

function rebuildDayMap(idx) {
  const tabKey = getTabKey(idx);
  if (!tabKey || tabKey === ALL_TAB_NAME) return;
  initTabState(tabKey);
  matchListWithDayMap.value[idx] = computeDayList(
    filterByLeague(matchListMap.value[tabKey] || [], tabKey),
    currentBeforeDayMap.value[tabKey],
    currentLastDayMap.value[tabKey]
  );
}

function rebuildVisibleDayMaps() {
  const max = leagueList.value.length - 1;
  const start = Math.max(1, pickerIndex.value - MOUNT_RANGE);
  const end = Math.min(max, pickerIndex.value + MOUNT_RANGE);
  for (let idx = start; idx <= end; idx++) {
    rebuildDayMap(idx);
  }
}

function mergeMatchList(baseList, incomingList) {
  const map = new Map();
  for (const item of baseList || []) {
    if (item?.id != null) map.set(item.id, item);
  }
  for (const item of incomingList || []) {
    if (item?.id == null) continue;
    const old = map.get(item.id);
    map.set(item.id, old ? { ...old, ...item } : item);
  }
  return [...map.values()];
}

function getRequestLeagueName(tabIdx = pickerIndex.value) {
  const tabName = leagueList.value[tabIdx]?.name;
  if (tabName === ALL_TAB_NAME) return "";
  return tabName || "";
}

function fetchState(isAllTab) {
  return isAllTab ? 3 : 999;
}

function toMatchList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.list)) return data.list;
  if (data && Array.isArray(data.records)) return data.records;
  if (data && typeof data === "object" && typeof data.length === "number") {
    try {
      return Array.from(data);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function isSameLeague(match, leagueName) {
  if (!leagueName) return true;
  return String(match?.leagueChsShort || "").trim() === String(leagueName).trim();
}

function filterByLeague(list, leagueName) {
  if (!leagueName) return list || [];
  return (list || []).filter((item) => isSameLeague(item, leagueName));
}

async function fetchDayMatches(day, state = 999, leagueName = "") {
  const fdateStr = day ? dateFormatWithBackEnd(day) : "";
  const res = await getFootBallList(fdateStr, state, leagueName, getAccount());
  const list = toMatchList(res?.data ?? res);
  return filterByLeague(list, leagueName);
}

async function getCurrentDay({ tabIdx = pickerIndex.value } = {}) {
  const tabKey = getTabKey(tabIdx);
  initTabState(tabKey);
  const isAllTab = tabKey === ALL_TAB_NAME;
  const leagueName = getRequestLeagueName(tabIdx);

  try {
    const list = await fetchDayMatches(dayjs(), fetchState(isAllTab), leagueName);
    const finalList = isAllTab ? sortAllTabList(list) : list;
    matchListMap.value[tabKey] = finalList;
    resetTabRange(tabKey);
    firstLoadedMap.value[tabKey] = true;

    if (isAllTab) {
      syncAllPaging(finalList, { complete: true });
    } else {
      rebuildDayMap(tabIdx);
    }
  } catch (error) {
    console.log(error);
    matchListMap.value[tabKey] = [];
    firstLoadedMap.value[tabKey] = true;
    if (isAllTab) {
      allPagingRef.value?.complete(false);
    } else {
      rebuildDayMap(tabIdx);
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function delayCloseRefresher(ms = REFRESHER_CLOSE_DELAY) {
  setTimeout(() => {
    refresherTriggered.value = false;
  }, ms);
}

async function getBeforeDayData(tabIdx = pickerIndex.value) {
  const tabKey = getTabKey(tabIdx);
  initTabState(tabKey);
  const isAllTab = tabKey === ALL_TAB_NAME;

  if (loadingBeforeMap.value[tabKey]) {
    if (isAllTab) allPagingRef.value?.endRefresh?.();
    else delayCloseRefresher();
    return;
  }

  loadingBeforeMap.value[tabKey] = true;
  const newDay = (currentBeforeDayMap.value[tabKey] || dayjs()).add(-1, "day");
  const state = fetchState(isAllTab);

  try {
    const list = await fetchDayMatches(newDay, state, getRequestLeagueName(tabIdx));
    const merged = mergeMatchList(matchListMap.value[tabKey] || [], list);
    const finalList = isAllTab ? sortAllTabList(merged) : merged;
    currentBeforeDayMap.value[tabKey] = newDay;
    matchListMap.value[tabKey] = finalList;

    if (isAllTab) {
      const cells = syncAllPaging(finalList, { complete: true });
      scrollAllPagingToDaySecondLast(newDay, cells);
    } else {
      await delay(REFRESHER_CLOSE_DELAY);
      rebuildDayMap(tabIdx);
      refresherTriggered.value = false;
      scrollLeagueToDaySecondLast(tabIdx, newDay);
    }
  } catch (error) {
    console.log(error);
    if (isAllTab) {
      allPagingRef.value?.complete(false);
    } else {
      delayCloseRefresher();
    }
  } finally {
    loadingBeforeMap.value[tabKey] = false;
  }
}

async function getNextDayData(tabIdx = pickerIndex.value) {
  const tabKey = getTabKey(tabIdx);
  initTabState(tabKey);
  const isAllTab = tabKey === ALL_TAB_NAME;

  if (loadingMoreMap.value[tabKey] || noMoreMap.value[tabKey]) {
    if (isAllTab && noMoreMap.value[tabKey]) {
      allPagingRef.value?.completeByNoMore([], true);
    }
    return;
  }

  loadingMoreMap.value[tabKey] = true;
  const newDay = (currentLastDayMap.value[tabKey] || dayjs()).add(1, "day");

  try {
    const list = await fetchDayMatches(newDay, fetchState(isAllTab), getRequestLeagueName(tabIdx));
    const merged = mergeMatchList(matchListMap.value[tabKey] || [], list);
    const finalList = isAllTab ? sortAllTabList(merged) : merged;
    matchListMap.value[tabKey] = finalList;
    currentLastDayMap.value[tabKey] = newDay;
    const isMore = dayjs().diff(newDay, "day") > 5 || list.length === 0;
    noMoreMap.value[tabKey] = isMore;

    if (isAllTab) {
      syncAllPaging(finalList, { noMore: isMore });
    } else {
      rebuildDayMap(tabIdx);
    }
  } catch (error) {
    console.log(error);
    if (isAllTab) allPagingRef.value?.complete(false);
  } finally {
    loadingMoreMap.value[tabKey] = false;
  }
}

function onAllVirtualListChange(vList) {
  allVirtualList.value = vList || [];
}

async function onAllQuery(pageNo, pageSize, from) {
  initTabState(ALL_TAB_NAME);
  if (from === "reload") {
    await getCurrentDay({ tabIdx: 0 });
  } else if (from === "user-pull-down") {
    await getBeforeDayData(0);
  } else if (from === "load-more") {
    await getNextDayData(0);
  }
}

function hasSameMatchSnapshot(prev, next) {
  if (prev.length !== next.length) return false;
  for (let i = 0; i < next.length; i++) {
    const a = prev[i];
    const b = next[i];
    if (a.id !== b.id || a.mstate !== b.mstate || a.flag !== b.flag) return false;
    if (a.homeScore !== b.homeScore || a.awayScore !== b.awayScore) return false;
  }
  return true;
}

async function refreshNewData() {
  if (isLoadRefresh.value) return;
  isLoadRefresh.value = true;

  try {
    const list = await fetchDayMatches(dayjs(), 0, "");
    onUpdateMatchList(list);

    const loadedKeys = Object.keys(firstLoadedMap.value).filter((k) => firstLoadedMap.value[k]);
    let allChanged = false;

    for (const tabKey of loadedKeys) {
      const tabList = [...(matchListMap.value[tabKey] || [])];
      list.forEach((item) => {
        if (tabKey !== ALL_TAB_NAME && !isSameLeague(item, tabKey)) return;
        const i = tabList.findIndex((m) => m.id === item.id);
        if (i >= 0) {
          tabList[i] = { ...tabList[i], ...item };
        } else if (
          tabKey !== ALL_TAB_NAME &&
          dayjs(item.matchTime).isSame(dayjs(), "day")
        ) {
          // 轮询是 state=0，不能把这些场次追加进「全部」
          tabList.push(item);
        }
      });
      const nextList = tabKey === ALL_TAB_NAME ? sortAllTabList(tabList) : tabList;
      if (tabKey === ALL_TAB_NAME) {
        allChanged = !hasSameMatchSnapshot(matchListMap.value[tabKey] || [], nextList);
      }
      matchListMap.value[tabKey] = nextList;
    }

    if (firstLoadedMap.value[ALL_TAB_NAME] && allChanged) {
      syncAllPaging(matchListMap.value[ALL_TAB_NAME] || []);
    }
    rebuildVisibleDayMaps();
  } catch (error) {
    console.log(error);
  } finally {
    isLoadRefresh.value = false;
  }
}

function resolveLeagueTabIndex(leagueName) {
  if (!leagueName) return -1;
  return leagueList.value.findIndex((item) => item.name === leagueName);
}

function addOrSwitchLeagueTab(leagueName) {
  if (!leagueName || leagueName === ALL_TAB_NAME) return -1;

  const existingIdx = resolveLeagueTabIndex(leagueName);
  if (existingIdx >= 0) {
    pickerIndex.value = existingIdx;
    return existingIdx;
  }

  const next = [...customLeagueNames.value];
  if (next.length >= MAX_CUSTOM_LEAGUES) {
    next.shift();
  }
  next.push(leagueName);
  customLeagueNames.value = next;
  saveCustomLeagues(next);
  return -2;
}

function setPickerIndex(idx) {
  if (idx == null || idx < 0) return;
  if (idx >= leagueList.value.length) return;
  if (idx === pickerIndex.value) {
    ensureTabData(idx);
    return;
  }
  pickerIndex.value = idx;
}

async function refresherAll() {
  const tabKey = getTabKey();
  initTabState(tabKey);
  resetTabRange(tabKey);

  if (tabKey === ALL_TAB_NAME && allPagingRef.value) {
    allPagingRef.value.reload(true);
  } else {
    await getCurrentDay({ tabIdx: pickerIndex.value });
  }
}

function toTopAll() {
  initTabState(ALL_TAB_NAME);
  resetTabRange(ALL_TAB_NAME);
  if (allPagingRef.value) {
    allPagingRef.value.reload(true);
  } else {
    getCurrentDay({ tabIdx: 0 });
  }
}

function toTop(idx) {
  const dayList = matchListWithDayMap.value[idx] || [];
  const todayStr = dayjs().format("YYYY/MM/DD dddd");
  const todayItem = dayList.find((item) => item.datestr === todayStr);
  if (!todayItem) return;

  scrollIntoViewMap.value[idx] = "";
  nextTick(() => {
    scrollIntoViewMap.value[idx] = dayAnchorId(idx, todayItem.id);
  });
}

async function ensureTabData(idx = pickerIndex.value) {
  const tabKey = getTabKey(idx);
  initTabState(tabKey);
  if (firstLoadedMap.value[tabKey]) return;

  if (tabKey === ALL_TAB_NAME) {
    const tryReload = (attempt = 0) => {
      if (allPagingRef.value) {
        allPagingRef.value.reload(true);
        return;
      }
      if (attempt < 8) setTimeout(() => tryReload(attempt + 1), 50);
    };
    nextTick(() => tryReload());
    return;
  }
  await getCurrentDay({ tabIdx: idx });
}

async function onPullDown() {
  if (getTabKey() === ALL_TAB_NAME) return;
  refresherTriggered.value = true;
  await getBeforeDayData(pickerIndex.value);
}

function onRefresherRestore() {
  refresherTriggered.value = false;
}

async function onLoadMore() {
  await getNextDayData(pickerIndex.value);
}

function onSearch(params = {}) {
  if (typeof params.isProMode === "boolean") {
    isProMode.value = params.isProMode;
  }
  const name = extractLeagueName(params.leagueList);
  if (!name || name === lastHandledSelectName) return pickerIndex.value;
  lastHandledSelectName = name;
  const idx = addOrSwitchLeagueTab(name);
  if (idx === -2) {
    nextTick(() => {
      const nextIdx = resolveLeagueTabIndex(name);
      if (nextIdx >= 0) pickerIndex.value = nextIdx;
    });
  }
  return pickerIndex.value;
}

function startRefreshTimer() {
  stopRefreshTimer();
  refreshNewData();
  refreshTimer = setInterval(() => {
    refreshNewData();
  }, 3000);
}

function stopRefreshTimer() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

function initInstantList() {
  if (started) return;
  started = true;
  nextTick(async () => {
    await ensureTabData(pickerIndex.value);
    startRefreshTimer();
  });
}

watch(pickerIndex, (idx) => {
  rebuildVisibleDayMaps();
  ensureTabData(idx);
});

watch(customLeagueNames, () => {
  if (pickerIndex.value >= leagueList.value.length) {
    pickerIndex.value = Math.max(leagueList.value.length - 1, 0);
  }
});

export function useInstantList() {
  return {
    ALL_TAB_NAME,
    leagueList,
    pickerIndex,
    customLeagueNames,
    matchListWithDayMap,
    refresherTriggered,
    scrollIntoViewMap,
    allVirtualList,
    isProMode,
    refresherStatusText,
    setAllPagingRef,
    isTabMounted,
    isTabNoMore,
    isTabLoadingMore,
    dayAnchorId,
    onAllQuery,
    onAllVirtualListChange,
    onPullDown,
    onRefresherRestore,
    onLoadMore,
    toTop,
    toTopAll,
    setPickerIndex,
    onSearch,
    refresherAll,
    initInstantList,
    stopRefreshTimer,
    ensureTabData
  };
}
