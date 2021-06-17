<template>
  <div class="login">
    <login />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Login from "./Login.vue";

export default defineComponent({
  components: {
    Login,
  },
});
</script>

<style lang="less" scope>
.login {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  background-size: cover;
  box-sizing: border-box;
  justify-content: flex-end;
  background-image: url("../../assets/images/login-bg.jpg");
}
</style>
