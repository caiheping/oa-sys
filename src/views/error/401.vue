<template>
  <div class="errPage-container">
    <a-button class="pan-back-btn" @click="back">
      {{ t('error.401.back') }}
    </a-button>
    <a-row>
      <a-col :span="12">
        <h1 class="text-jumbo text-ginormous">401{{ t('error.401.error') }}</h1>
        <h2>{{ t('error.401.noAccess') }}</h2>
        <h6>{{ t('error.401.errorMsg') }}</h6>
        <ul class="list-unstyled">
          <li class="link-type">
            <router-link to="/"> {{ t('error.401.goHome') }} </router-link>
          </li>
        </ul>
      </a-col>
      <a-col :span="12">
        <img
          :src="errGif"
          width="313"
          height="428"
          alt="Girl has dropped her ice cream."
        />
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useI18n } from '@/hooks/useI18n'
import errGif from '@/assets/images/401.gif'
import router from '@/router'

export default defineComponent({
  setup() {
    const { t } = useI18n()
    const back = () => {
      router.back()
    }
    return {
      errGif: errGif + '?' + +new Date(),
      back,
      t,
    }
  },
})
</script>

<style lang="less" scoped>
.errPage-container {
  width: 800px;
  max-width: 100%;
  margin: 100px auto;
  .pan-back-btn {
    background: #008489;
    color: #fff;
    border: none !important;
  }
  .pan-gif {
    margin: 0 auto;
    display: block;
  }
  .pan-img {
    display: block;
    margin: 0 auto;
    width: 100%;
  }
  .text-jumbo {
    font-size: 60px;
    font-weight: 700;
    color: #484848;
  }
  .list-unstyled {
    font-size: 14px;
    li {
      padding-bottom: 5px;
    }
    a {
      color: #008489;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
