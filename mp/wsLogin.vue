<template>
  <view class="flex items-center justify-center">
    <view class="flex flex-col items-center pt-20">
      <u-input
        v-model="scene"
        placeholder=" "
      ></u-input>
      <view class="w-32 h-32 rounded-full overflow-hidden mb-6">
        <open-data
          type="userAvatarUrl"
          lang="zh_CN"
        ></open-data>
      </view>
      <view class="text-2xl font-semibold mb-4">
        <open-data
          type="userNickName"
          lang="zh_CN"
        ></open-data>
      </view>

      <view class="text-gray-500 mb-8"><text class="mr-2">将使用微信登录</text>
        <u-link href="https://www.icebreaker.top/">icebreaker.top</u-link>
      </view>

      <u-button
        type="primary"
        @click="getuserinfo"
        :custom-style="{
          width: '400rpx'
        }"
      >确认登录</u-button>
    </view>

  </view>
</template>

<script lang="ts">
import Vue from "vue";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";
// 这里也可以直接 http 触发，假如只是 B -> A 单端通信，没必要建立长链接
export default Vue.extend({
  data() {
    return {
      scene: "",
    };
  },
  methods: {
    async getuserinfo() {
      // @ts-ignore
      const [err, detail] = await uni.getUserProfile({
        desc: "您的信息将用于微信登录",
        lang: "zh_CN",
      });
      console.log(err, detail);
      if (err) {
        uni.showToast({
          title: "请授权一下您的基本信息",
          icon: "none",
        });
      } else {
        // console.log(e.detail)
        // @ts-ignore
        this.socket.emit("login", {
          id: this.scene,
          userinfo: detail.userInfo,
        });
        uni.showModal({
          title: "登录成功!",
          success() {
            uni.reLaunch({
              url: "/pages/index/index",
            });
          },
        });
      }
    },
  },
  onLoad(params) {
    const scene = decodeURIComponent(params?.scene || "");
    // @ts-ignore
    this.scene = scene;
    // @ts-ignore
    const socket: Socket = (this.socket = io(process.env.VUE_APP_WS_PATH, {
      query: {},
      transports: ["websocket", "polling"],
      timeout: 5000,
    }));

    socket.on("connect", () => {
      // ws连接已建立，此时可以进行socket.io的事件监听或者数据发送操作
      // 连接建立后，本插件的功能已完成，接下来的操作参考socket.io官方客户端文档即可
      // console.log('ws 已连接')
      // // socket.io 唯一连接id，可以监控这个id实现点对点通讯
      // const { id } = socket
      // socket.on(id, (message) => {
      //   // 收到服务器推送的消息，可以跟进自身业务进行操作
      //   console.log('ws 收到服务器消息：', message)
      // })
      // // 主动向服务器发送数据
      // socket.emit('send_data', {
      //   time: +new Date()
      // })
    });

    socket.on("error", (msg: any) => {
      console.log("ws error", msg);
    });
  },
});
</script>

<style>
</style>
