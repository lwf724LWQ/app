<template>
  <view class="example-container">
    <view class="title">自定义虚拟列表示例</view>
    
    <view class="list-container">
      <custom-virtual-list
        :data="listData"
        :item-height="80"
        :buffer-size="5"
        scroll-y
        :upper-threshold="50"
        :lower-threshold="50"
        @scrolltolower="handleLoadMore"
        @scrolltoupper="handleRefresh"
      >
        <template v-slot="{ item, index }">
          <view class="list-item">
            <view class="item-index">{{ index + 1 }}</view>
            <view class="item-content">
              <view class="item-title">{{ item.title }}</view>
              <view class="item-desc">{{ item.description }}</view>
            </view>
          </view>
        </template>
      </custom-virtual-list>
    </view>
  </view>
</template>

<script>
import CustomVirtualList from './list.vue';

export default {
  components: {
    CustomVirtualList
  },
  data() {
    return {
      listData: []
    };
  },
  created() {
    // 初始化数据
    this.generateMockData();
  },
  methods: {
    generateMockData() {
      const data = [];
      for (let i = 0; i < 10000; i++) {
        data.push({
          id: i,
          title: `标题 ${i + 1}`,
          description: `这是第 ${i + 1} 项的详细描述内容，用于测试虚拟列表组件。`
        });
      }
      this.listData = data;
    },
    
    handleLoadMore() {
      console.log('加载更多数据');
      // 实际应用中，这里可以请求更多数据并追加到listData中
    },
    
    handleRefresh() {
      console.log('刷新数据');
      // 实际应用中，这里可以重新请求数据
    }
  }
};
</script>

<style lang="scss" scoped>
.example-container {
  padding: 20px;
  
  .title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .list-container {
    height: 600px;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .list-item {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #f0f0f0;
    
    .item-index {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #007AFF;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
    }
    
    .item-content {
      flex: 1;
      
      .item-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .item-desc {
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>
