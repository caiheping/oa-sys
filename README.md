# oa-sys

## 描述

oa-sys 为前后端分离的企业员工管理系统。

## 技术栈

后端技术栈：egg.js + mysql + sequelize + jwt 等

前端技术栈：vue3 + vite + ant-design-vue + pinia + windicss等

### 项目运行

**项目有两个分支，master分支包含一个后台管理系统的基础功能，feature-oa分支除了系统管理外还包含基础数据，财务数据，审核管理等模块**

```bash
git clone https://gitee.com/caiheping/oa-sys.git
cd oa-sys
npm install
```

同时你还要区clone后端项目，怎么运行请跳转到后端项目地址查看。

后端项目地址:

码云：https://gitee.com/caiheping/oa-api

GitHub：https://github.com/caiheping/oa-api



### 目录结构

```bash
oa-sys
├─ public                   // 静态文件
├─ src
|	├─ api			// 全部api接口都放在这
|	├─ assets				// 静态文件
|	├─ components			// 组件
|	├─ config				// 配置文件
|	├─ directives				// 自定义指令
|	├─ hooks				// hooks
|	├─ icons				// icons图标
|	├─ locales				// 国际化配置
|	├─ router				// router
|	├─ settings				// 系统布局配置
|	├─ store				// 全局store配置
|	├─ utils				// 工具方法
|	├─ views				// 页面
|	├─ App.vue				
|	├─ main.ts				
|	├─ ...
...
```

演示地址：http://oa.caihp.top （自己服务器只开放部分功能，想要查看全部功能，请copy代码在自己的电脑上看）

用户名： test123

密码：123456



## 界面截图

登录页

![](http://cdn.caihp.top/oa-sys/other/login.png)

![](http://cdn.caihp.top/oa-sys/other/dept.png)

![](http://cdn.caihp.top/oa-sys/other/dit.png)

![](http://cdn.caihp.top/oa-sys/other/lockIn.png)

![](http://cdn.caihp.top/oa-sys/other/log.png)

![](http://cdn.caihp.top/oa-sys/other/makeUpCard.png)

![](http://cdn.caihp.top/oa-sys/other/menu.png)

![](http://cdn.caihp.top/oa-sys/other/notice.png)

![](http://cdn.caihp.top/oa-sys/other/role.png)

![](http://cdn.caihp.top/oa-sys/other/salary.png)

![](http://cdn.caihp.top/oa-sys/other/sysSetting.png)

![](http://cdn.caihp.top/oa-sys/other/setting.png)

![](http://cdn.caihp.top/oa-sys/other/userInfo.png)

![](http://cdn.caihp.top/oa-sys/other/user.png)

![](http://cdn.caihp.top/oa-sys/other/workOverTime.png)

![](http://cdn.caihp.top/oa-sys/other/workingDaySetting.png)



## 功能模块

**master分支**

- [x] 登录 -- 完成
- [ ] 首页 -- 待定
- [x] 系统布局配置 -- 完成
- [x] 系统管理 =》用户中心 -- 完成
- [x] 系统管理 =》角色管理 -- 完成
- [x] 系统管理 =》菜单管理 -- 完成
- [x] 系统管理 =》部门管理 -- 完成
- [x] 系统管理 =》字典管理 -- 完成
- [x] 系统管理 =》消息公告 -- 完成
- [x] 个人中心 =》头像上传 -- 完成

**feature-oa**

- [x] 登录 -- 完成
- [ ] 首页 -- 待定
- [x] 系统布局配置 -- 完成
- [x] 国际化（中英文切换）-- 完成
- [x] 系统管理 =》用户中心 -- 完成
- [x] 系统管理 =》角色管理 -- 完成
- [x] 系统管理 =》菜单管理 -- 完成
- [x] 系统管理 =》部门管理 -- 完成
- [x] 系统管理 =》字典管理 -- 完成
- [x] 系统管理 =》消息公告 -- 完成
- [x] 个人中心 =》头像上传 -- 完成
- [x] 系统管理 =》系统配置 -- 完成
- [x] 系统管理 =》系统日志 -- 完成
- [x] 基础数据 =》打卡详情 -- 完成
- [x] 基础数据 =》工作日设置 -- 完成
- [x] 基础数据 =》员工假期详情 -- 完成
- [x] 财务数据 =》工资详情 -- 完成
- [x] 审批管理 =》出差申请 -- 完成
- [x] 审批管理 =》补卡申请 -- 完成
- [x] 审批管理 =》请假申请 -- 完成
- [x] 审批管理 =》 加班申请 -- 完成

如果对您有帮助，您可以点右上角 "Star" 支持一下 谢谢！ ^_^