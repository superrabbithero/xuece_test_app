<template>
    <h1>Painter 涂鸦</h1>
    <div class="component-demo">
        <div class="component-demo_view">
            <div class="component-demo_view_title">
                painter
            </div>
            <div class="component-demo_view_content">
                <div class="show-box">
                    <au-painter :position="config.placementList[config.placementIndex]"></au-painter>
                </div>
            </div>
        </div>
        
        <div class="component-demo_config">
            <div class="component-demo_config_title">
                <icon-wrapper name="RiLightbulbFill" size="16" color="#ffc848"/>
                配置
            </div>
            <div class="component-demo_config_content">
                <label>
                    <span>位置:</span>
                    <au-select :dataList="config.placementList" v-model="config.placementIndex"/>
                </label>
            </div>
        </div>
        <div v-show="false" class="component-demo_code">
            这里需要代码高亮样式，晚点再说
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
const config = ref({
    placementList:[
        "fixed",
        "top",
        // "top-left",
        // "top-right",
        "bottom"
        // "bottom-left",
        // "bottom-right",
        // "left",
        // "left-top",
        // "left-bottom",
        // "right",
        // "right-top",
        // "right-bottom"
        ],
    placementIndex:0
})


</script>

<style scoped>
.show-box {
    width: 500px;
    height: 400px;
    margin: 20px 0;
}
</style>