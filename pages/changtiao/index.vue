<template>
    <view class="container">
        <tag-list-component class="tag-list" :tags="tagOptions" :list-data="listData" @tag-change="handleTagChange">
            <!-- 自定义标签插槽 -->
            <template #tags="{ activeTag, switchTag }">
                <view class="custom-tags">
                    <view v-for="tag in tagOptions" :key="tag.value"
                        :class="['custom-tag-btn', { active: activeTag === tag.value }]" @click="switchTag(tag.value)">
                        {{ tag.label }}
                    </view>
                </view>
            </template>

            <!-- 自定义列表插槽 -->
            <template #list="{ data, activeTag }">
                <view class="custom-list">
                    <view v-for="item in data" :key="item.id" class="custom-list-item">
                        <h3>{{ item.title }}</h3>
                        <p>{{ item.description }}</p>
                        <span class="tag">{{ activeTag }}</span>
                    </view>
                </view>
            </template>
        </tag-list-component>
    </view>
</template>

<script>
import TagListComponent from '../../components/tag-list.vue'

export default {
    components: {
        TagListComponent
    },
    data() {
        return {
            tagOptions: [
                { label: '全部', value: 'all' },
                { label: '技术', value: 'tech' },
                { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
                { label: '技术', value: 'tech' },
                { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
                { label: '技术', value: 'tech' },
                { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
                { label: '技术', value: 'tech' },
                { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
                { label: '技术', value: 'tech' },
                { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
                { label: '技术', value: 'tech' },
                { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
                { label: '技术', value: 'tech' },
                { label: '设计', value: 'design' },
                { label: '产品', value: 'product' }
            ],
            listData: {
                all: [
                    { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' }, { id: 1, title: 'Vue开发实践', description: 'Vue项目实战经验分享' },
                    { id: 2, title: 'React状态管理', description: 'Redux与Mobx对比分析' }
                ],
                tech: [
                    { id: 1, title: '前端性能优化', description: '提升页面加载速度的方法' },
                    { id: 2, title: '微前端架构', description: '大型应用的拆分策略' }
                ],
                design: [
                    { id: 1, title: '用户体验设计', description: '如何提升产品的用户体验' }
                ],
                product: [
                    { id: 1, title: '需求分析方法', description: '如何准确把握用户需求' },
                    { id: 2, title: '产品迭代策略', description: '敏捷开发中的产品规划' }
                ]
            }
        }
    },
    methods: {
        handleTagChange(tag) {
            console.log('当前选中的标签:', tag)
        }
    }
}
</script>

<style lang="scss" scoped>
.container {
    .tag-list {
        height: 100vh;
    }

    .custom-tags {
        height: 100%;
        background-color: #efefef;

        .custom-tag-btn {
            padding: 28rpx 40rpx;

            &.active {
                color: rgb(223, 34, 34);
                background-color: #fff;
            }
        }
    }
}
</style>