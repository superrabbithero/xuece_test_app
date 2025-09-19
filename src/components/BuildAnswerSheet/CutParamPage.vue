<template>
  <div ref="cutparampage" class="cutpage" >
    <div ref="cutparampanel" class="cutpage-panel" v-if="cutParamJson">
      <div class="cutpage-section" v-show="toolsParams?.page_num%2===1"
      :style="{ width:cutParamJson.studentIdRect ? (cutDivScale*cutParamJson.studentIdRect.width + 'px') : '0',
                height:cutParamJson.studentIdRect ? (cutDivScale*cutParamJson.studentIdRect.height + 'px') : '0',
                top:cutParamJson.studentIdRect ? (cutDivScale*cutParamJson.studentIdRect.y + 'px') : '0',
                left:cutParamJson.studentIdRect ? (cutDivScale*cutParamJson.studentIdRect.x + 'px') : '0'}"></div>
      <div class="cutpage-section"  v-for="(section,index) in cutParamJson.section" :key="index" v-show="section.pageNumber == toolsParams?.page_num"
      :style="{ width:cutDivScale*section.rect.width + 'px',
                height:cutDivScale*section.rect.height + 'px',
                top:cutDivScale*section.rect.y + 'px',
                left:cutDivScale*section.rect.x + 'px'}">
        <div class="cutpage-section sub" v-for="(subsection,index) in section.subsections" :key="index" :style="hasFreeStyleGroupsSubsectionStyle(subsection)">
                <!-- <div class="cutpage-section sub remove">
                  {{subsection.x}}{{subsection.y}}
                </div> -->
                <div class="cutpage-section" v-for="(freeStyleCellGroup,index) in subsection.freeStyleCellGroups" :key="index">
                  <div class="cutpage-section sub" v-for="(freeStyleCell, index) in freeStyleCellGroup" :key="index" :style="{ width:'1px',height:'1px',
                  top:cutDivScale*freeStyleCell.y + 'px',
                  left:cutDivScale*freeStyleCell.x + 'px'}"></div>
                </div>
                  
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {defineProps, computed, onMounted, ref} from 'vue';


const props = defineProps({
  cutParamJson:{
    type:Object,
    default:null
  },
  cutDivScale:{
    type:Number
  },
  anchorxy:{
    type:Object
  },
  width_temp:{
    type:Number
  },
  height_temp:{
    type:Number
  },
  scaleCount:{
    type:Number
  }
})

const hasFreeStyleGroupsSubsectionStyle = computed(() => {
  return (subsection) => {
    if (subsection.freeStyleCellGroups) {
      return { 
        width: '0', 
        height: '0', 
        top: props.cutDivScale * subsection.y + 'px', 
        left: props.cutDivScale * subsection.x + 'px',
        border: 'none',
        boxSizing: 'border-size'
      }
    } else {
      return { 
        width: '1px', 
        height: '1px', 
        top: props.cutDivScale * subsection.y + 'px', 
        left: props.cutDivScale * subsection.x + 'px'
      }
    }
  }
})

const cutparampage = ref(null)
const cutparampanel = ref(null)

onMounted(()=>{
  initPanel()
})

const initPanel = () => {
  var json = props.cutParamJson
    // console.log(json.pageSize.width,json.pageSize.height)
  var widthTemp = props.width_temp * parseFloat(props.scaleCount)
  var heightTemp = props.height_temp * parseFloat(props.scaleCount)
  
  cutparampage.value.style.width = widthTemp + 'px'
  cutparampage.value.style.height = heightTemp + 'px'

  var panel = cutparampanel.value

  // props.cutDivScale = widthTemp/json.pageSize.width

  widthTemp = props.cutDivScale*json.panelSize.width
  heightTemp = props.cutDivScale*json.panelSize.height


  panel.style.width = widthTemp + 'px'
  panel.style.height = heightTemp + 'px'
  panel.style.marginTop = (props.anchorxy.y-3)*props.scaleCount + 'px'
  panel.style.marginLeft = (props.anchorxy.x-3)*props.scaleCount + 'px'
}

</script>