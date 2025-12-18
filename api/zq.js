import {
	getAccount,
	request
} from "@/utils/request.js"

function getResultHistoryV1(query) {
	return request({
		url: "/zc/gateway/uniform/football/getResultHistoryV1.qry",
        data: query
	})
}

function getMatchFeatureV1(query) {
	return request({
		url: "/zc/gateway/uniform/football/getMatchFeatureV1.qry",
        data: query
	})
}

function getMatchHeadV1(query) {
	return request({
		url: "/zc/gateway/uniform/football/getMatchHeadV1.qry",
        data: query
	})
}
export default {
    getResultHistoryV1,
    getMatchFeatureV1,
    getMatchHeadV1
}