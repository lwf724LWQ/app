<template>
  <div class="withdraw-detail">withdraw-detail</div>
</template>

<script setup>
import { getWithdrawDetailApi } from "@/api/apis";
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

let page = 1;
let limit = 10;
const withdrawDetail = ref({});
const getWithdrawDetail = async (id, page, limit) => {
  const { data } = await getWithdrawDetailApi(id, page, limit);
  withdrawDetail.value = data.records[0];
};

onLoad((options) => {
  getWithdrawDetail(options.id, page, limit);
});
</script>

<style scoped></style>
