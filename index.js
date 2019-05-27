/**
 * @ 移动端touch运动事件
 * @ author xiangshanxiumu
 * @ v1.0
 */
export default class TouchMove {
  constructor(wraper, scroller, options, callback) {
    this.options = options;
    // 默认配置
    this.default = {
      scrollX: false,
      scrollY: false,
      thresholdMax: 100, //最大运动阀值 整数
      thresholdMin: 20, //最小运动阀值 触发值
      throttle: true, // 是否节流 默认ture
      throttleTime: 200, //节流时间间隔 默认200毫秒
      dropDownText: "",
      pullUpText: "",
      reBound: true // 默认反弹运动回来
    }
    // 合并外部传入配置参数
    Object.assign(
      this.default, this.options);

    this.wraper = wraper; // 当前实例的外框元素
    this.scroller = scroller; // 当前实例的内部滚动元素
    this.disX = 0; // 当前实例水平方向运动距离
    this.disY = 0; // 当前实例垂直方向运动距离
    this.callback = callback
    this.init();

    this.event();
  }
  //初始化函数
  init() {
    //设置内外盒子定位样式
    this.wraper.style.position = "relative";
    this.scroller.style.position = "absolute";

    // 外部有设置dropDownText参数情况下 创建 "下拉刷新"
    if (this.default.dropDownText) {
      this.dropDown = document.createElement("p");
      this.dropDown.innerHTML = this.default.dropDownText;
      this.dropDown.style.position = "absolute";
      this.dropDown.style.top = "1rem";
      this.dropDown.style.width = "100%";
      this.dropDown.style.textAlign = "center";
      this.dropDown.style.display = "none";
      this.wraper.prepend(this.dropDown);
    }
    // 外部有设置pullUpText参数情况下 创建 "上拉加载更多"
    if (this.default.pullUpText) {
      this.pullUp = document.createElement("p");
      this.pullUp.innerHTML = this.default.pullUpText;
      this.pullUp.style.position = "absolute";
      this.pullUp.style.bottom = "1rem";
      this.pullUp.style.width = "100%";
      this.pullUp.style.textAlign = "center";
      this.pullUp.style.display = "none";
      this.wraper.appendChild(this.pullUp);
    }
  }
  event() {
    //开始触摸事件
    this.scroller.addEventListener(
      "touchstart",
      e => {
        this.startX = e.targetTouches[0].pageX;
        this.startY = e.targetTouches[0].pageY;

        this.Top = this.scroller.offsetTop;
        this.Left = this.scroller.offsetLeft;
        //默认阻止滚动事件和冒泡
        //e.preventDefault();
        //e.cancelBubble = true;
        //触摸移动事件
        let fnMove = e => {
          this.curX = e.targetTouches[0].pageX;
          this.curY = e.targetTouches[0].pageY;
          // 计算运动距离
          this.disX = this.curX - this.startX;
          this.disY = this.curY - this.startY;

          if (this.default.throttle) {
            //节流
            clearTimeout(this.throttleTimer);
            this.throttleTimer = setTimeout(() => {
              this.callback && this.callback(this.disX, this.disY);
            }, this.default.throttleTime);
          } else {
            this.callback && this.callback(this.disX, this.disY);
          }

          // 外部有设置 scrollX 或 scrollY其中之一为true情况下 采用外部设置值
          if (this.default.scrollX || this.default.scrollY) {
            this.ScrollX = this.default.scrollX;
            this.ScrollY = this.default.scrollY;
          } else {
            // 否则默认比较判断水平和垂直运动大小决定运动方向
            if (
              Math.abs(this.disX) >
              Math.abs(this.disY)
            ) {
              // 此时水平运动 禁止垂直运动
              this.ScrollX = true;
              this.ScrollY = false;
            } else {
              // 此时垂直运动 禁止水平运动
              this.ScrollX = false;
              this.ScrollY = true;
            }
          }

          //左右滑动运动 把垂直方向锁死
          if (this.ScrollX) {
            //从左往右滑动
            if (this.disX > 0) {
              if (
                this.disX >= this.default.thresholdMin &&
                this.disX <= this.default.thresholdMax
              ) {
                this.scroller.style.left = this.Left +
                  this.disX + "px";
              } else if (this.disX >= this.default.thresholdMax) {
                this.disX = this.default.thresholdMax;
                this.scroller.style.left = this.Left + this.default.thresholdMax + "px";
              }
            }
            //从右往做滑动
            if (this.disX < 0) {
              if (
                this.disX <= -this.default.thresholdMin &&
                this.disX >= -this.default.thresholdMax
              ) {
                this.scroller.style.left = this.Left +
                  this.disX + "px";
              } else if (this.disX <= -this.default.thresholdMax) {
                this.disX = -this.default.thresholdMax;
                this.scroller.style.left = this.Left - this.default.thresholdMax + "px";
              }
            }
          }
          // 垂直方向运动时 把 水平方向锁死
          if (this.ScrollY) {
            //下拉运动
            if (this.disY > 0) {
              // 显示 "下拉刷新"
              if (this.default.dropDownText) {
                this.dropDown.style.display = "block";
              }
              if (
                this.disY >= this.default.thresholdMin &&
                this.disY <= this.default.thresholdMax
              ) {
                this.scroller.style.top =
                  this.Top + this.disY + "px";
                // 超过最大门限值时
              } else if (this.disY > this.default.thresholdMax) {
                this.scroller.style.top = this.Top + this.default.thresholdMax + "px";
                this.disY = this.default.thresholdMax;
              }
            }
            // 上拉运动
            if (this.disY < 0) {
              //显示 "上拉加载更多"
              if (this.default.pullUpText) {
                this.pullUp.style.display = "block";
              }
              if (
                this.disY <= -this.default.thresholdMin &&
                this.disY >= -this.default.thresholdMax
              ) {
                this.scroller.style.top =
                  this.Top + this.disY + "px";
                // 超过最大门限值时
              } else if (this.disY < -this.default.thresholdMax) {
                this.scroller.style.top = this.Top - this.default.thresholdMax + "px";
                this.disY = -this.default.thresholdMax;
              }
            }
          }
        };
        //触摸结束事件
        let fnEnd = e => {
          this.scroller.removeEventListener("touchmove", fnMove, false);
          this.scroller.removeEventListener("touchend", fnEnd, false);
          if (this.default.reBound) { // this.default.reBound 为true时反弹运动回来
            if (this.default.scrollX || this.default.scrollY) {
              if (this.default.scrollX) {
                clearInterval(this.timerX);
                this.timerX = setInterval(() => {
                  //右滑动 反弹
                  if (this.disX > 0) {
                    this.disX -= 1;
                    this.scroller.style.left = this.Left +
                      this.disX + "px";
                    //左滑动 反弹
                  } else if (this.disX < 0) {
                    this.disX += 1;
                    this.scroller.style.left = this.Left +
                      this.disX + "px";
                  } else {
                    this.scroller.style.left = this.Left + "px";
                    clearInterval(this.timerX);
                  }
                }, 1);
              }
              if (this.default.scrollY) {
                clearInterval(this.timerY);
                this.timerY = setInterval(() => {
                  //下拉运动 反弹
                  if (this.disY > 0) {
                    this.disY -= 1;
                    this.scroller.style.top =
                      this.Top + this.disY + "px";
                    //上拉运动 反弹
                  } else if (this.disY < 0) {
                    this.disY += 1;
                    this.scroller.style.top =
                      this.Top + this.disY + "px";
                  } else {
                    // 隐藏 "下拉刷新"
                    if (this.default.dropDownText) {
                      this.dropDown.style.display = "none";
                    }
                    // 隐藏 "上拉加载更多"
                    if (this.default.pullUpText) {
                      this.pullUp.style.display = "none";
                    }
                    clearInterval(this.timerY);
                    this.scroller.style.top = this.Top + "px";
                  }
                }, 1);
              }
            } else {
              // this.default.scrollX 、 this.default.scrollY都为false情况下 自动判断运动方向
              if (this.ScrollX) {

              }
              if (this.ScrollY) {

              }
            }
          }
        };
        this.scroller.addEventListener("touchmove", fnMove, false);
        this.scroller.addEventListener("touchend", fnEnd, false);
      },
      false
    );
  }
}
