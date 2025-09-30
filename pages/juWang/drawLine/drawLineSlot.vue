<template>
  <view class="container">
    <custom-slot-nav-bar>
      <template #title>
        <view style="background-color: red">d2rawLine2</view>
      </template>
    </custom-slot-nav-bar>
    <custom-slot-nav-bar>
      <template #title>
        <test-com></test-com>
      </template>
      默认插槽
      <template #search>
        搜索2
      </template>
    </custom-slot-nav-bar>

  </view>
</template>

<script></script>