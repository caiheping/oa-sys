<template>
  <div>
    <img
      class="block w-20 h-20"
      src="//www.baidu.com/img/flexible/logo/pc/result.png"
      alt=""
    />
    <p v-for="item in 55" :key="item">主要内容{{ item }}</p>
  </div>
</template>
