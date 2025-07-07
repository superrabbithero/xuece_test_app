<template>
    <h1>Painter 涂鸦</h1>
    <div class="component-demo">
        <div class="component-demo_view">
            <div class="component-demo_view_title">
                painter
            </div>
            <div class="component-demo_view_content">
                <div class="show-box">
                    <au-painter ></au-painter>
                </div>
            </div>
        </div>
        
        <div class="component-demo_config">
            <div class="component-demo_config_title">
                <icon-wrapper name="RiLightbulbFill" size="16" color="#ffc848"/>
                配置
            </div>
            <div class="component-demo_config_content">
                
            </div>
        </div>
        <div v-show="false" class="component-demo_code">
            这里需要代码高亮样式，晚点再说
        </div>
    </div>
</template>

<script setup>
// import {ref} from 'vue'



</script>

<style scoped>
.show-box {
    width: 500px;
    height: 400px;
    margin: 20px 0;
}
</style>