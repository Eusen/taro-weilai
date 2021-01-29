import React, {Component} from 'react'
import {View, Image} from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default class Index extends Component {
  constructor() {
    super(...arguments)
    this.state = {
      distance: {
        start: 0,
        stop: 0
      },
      preNumValue: 1,//当前比例
      distanceMove: 0,//当前缩放的米数
      imgScale: 1, //图片得倍数
      // scale: 1,//位移得倍数
      // scaleMax: 5,
      // scaleMin: 0.1,
      // width: 5000,
      // height: 5000,
      imgleft: 0,
      imgtop: 0,
      x: 0,
      y: 0,
      origin: {
        x: 0,
        y: 0
      }
    }
  }

  componentDidMount() {
    let wrapper = document.getElementById('canvasWrapBody')
    wrapper.addEventListener('touchstart', this.handleTouch.bind(this, 'touchstart'));
    wrapper.addEventListener('touchmove', this.handleTouch.bind(this, 'touchmove'));
  }

  ///加载图片
  loadImg() {
    let that = this;
    let {data, selectBuild} = this.props
    let regionValue = {
      regionId: '1',
      regionImageUrl: '',
      regionName: '地面停车位14#13#',
      xaxisBuilding: 1025,
      yaxisBuilding: 2523,
      pic_width: 5000,
      pic_height: 5000,
      pointConfig: {
        buildingColor: '#EFEFEF',
        buildingFontSize: '20',
        buildingHeight: '40',
        carportFontSize: '14',
        carportHeight: '20'
      },
      buildingRelList: [{
        buildingId: '1',
        buildingName: '1',
        xaxis: '10',
        yaxis: '10'
      },
        {
          buildingId: '2',
          buildingName: '2',
          xaxis: '20',
          yaxis: '20'
        },
        {
          buildingId: '3',
          buildingName: '3',
          xaxis: '30',
          yaxis: '30'
        }]
    }
    // 默认倍数为1
    let newdata = JSON.parse(JSON.stringify(data))

    //循环处理车位显示参数
    newdata.park.map((item) => {
      //判断显示样式
      item.dragging = false
      item.pos = {}
      if (item.show_status === 1) {
        //可售
        item.showStyle = {
          color: 'rgba(38,193,0,.85)',
          text: '可售',
        }
      } else if (item.show_status === 2) {
        //已订
        item.showStyle = {
          color: 'rgba(226,226,5,.85)',
          text: '已订',
        }
      } else if (item.show_status === 3) {
        //已售
        item.showStyle = {
          color: 'rgba(221,0,0,.85)',
          text: '已售',
        }
      } else {
        //其他
        item.showStyle = {
          color: 'none',
          text: '',
        }
      }
      //定位尺寸重新设置
      // if (showScale < 1) {
      //   item.xaxis = item.xaxis;
      //   item.yaxis = item.yaxis;
      // }
    });
    that.setState({
      newData: newdata,
      regionValue
    })
  }

  goBack = () => {
    Taro.navigateBack({
      delta: 1
    })
  }

  /*
     * 获取中点
     */
  getOrigin(first, second) {
    return {
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2
    };
  }

  // 计算缩放比例
  getDistance(start, stop) {
    return Math.sqrt(Math.pow((stop.x - start.x), 2) + Math.pow((stop.y - start.y), 2));
  }

  getScale(start, stop) {
    return this.getDistance(start[0], start[1]) / this.getDistance(stop[0], stop[1]);
  }

  handleTouch(type, e) {
    console.log(e)
    e.preventDefault()
    e.stopPropagation()
    let that = this
    let {distanceMove, distance, origin, scale, imgScale, imgleft, imgtop, preNumValue} = that.state
    const info = Taro.getSystemInfoSync()
    // 设备的宽度
    const {windowWidth, windowHeight} = info
    const maxwindowWidth = 5000 * preNumValue
    const maxwindowHeight = 5000 * preNumValue
    //算一个固定的系数
    switch (e.type) {
      case 'touchstart':
        if (e.touches.length > 1) {
          // 缩放比例
          distance.start = that.getDistance({
            x: e.touches[0].screenX,
            y: e.touches[0].screenY
          }, {
            x: e.touches[1].screenX,
            y: e.touches[1].screenY
          });
        }
        // 记录手指按下的位置
        let startX = e.touches[0].clientX;
        let startY = e.touches[0].clientY;
        that.setState({
          startX,
          startY,
          distance,
          imgScale: imgScale
        })
        // 记录触摸点
        this.setState({
          x: e.touches[0].pageX - imgleft,
          y: e.touches[0].pageY - imgtop
        });
        break;
      case 'touchmove':
        const {
          pageX,
          pageY
        } = e.touches[0];
        let {x, y} = this.state

        if (e.touches.length === 2) {
          // 算两指之间中点
          origin = that.getOrigin({
            x: e.touches[0].pageX,
            y: e.touches[0].pageY
          }, {
            x: e.touches[1].pageX,
            y: e.touches[1].pageY
          });
          // 缩放比例
          distance.stop = that.getDistance({
            x: e.touches[0].screenX,
            y: e.touches[0].screenY
          }, {
            x: e.touches[1].screenX,
            y: e.touches[1].screenY
          });
          console.log(distance.stop - distance.start)
          // 当前缩放的距离
          console.log(distanceMove)
          let preDistanceMove = distanceMove
          let preScale = distance.stop / distance.start;
          // 当前倍数
          if (preScale > 1) { //放大
            imgScale = imgScale * preScale
            if (imgScale >= 3) {
              imgScale = 3,
                preDistanceMove = distanceMove
            } else {
              preDistanceMove = distanceMove + (distance.stop - distance.start)
            }
          } else { //缩小
            imgScale = imgScale * preScale
            if (imgScale <= 0.1) {
              imgScale = 0.1,
                preDistanceMove = distanceMove
            } else {
              preDistanceMove = distanceMove
            }
          }
          let _preNumValue = parseFloat(imgScale) / parseFloat(1)
          // 算屏幕得中点
          let windowWidthX = parseFloat(windowWidth) / 2
          let windowHeightY = parseFloat(windowHeight) / 2
          // // 算两指之间为屏幕中点是left top的变化偏差
          let offsetX = parseFloat(windowWidthX) - parseFloat(origin.x) + parseFloat(imgleft)
          let offsetY = parseFloat(windowHeightY) - parseFloat(origin.y) + parseFloat(imgtop)
          x = offsetX * _preNumValue
          y = offsetY * _preNumValue

          // left的极限
          if (x < -(5000 * _preNumValue)) {
            x = -(5000 * _preNumValue)
          } else if (x > (5000 * _preNumValue)) {
            x = (5000 * _preNumValue)
          }

          // top的极限
          if (y < -(5000 * _preNumValue)) {
            y = -(5000 * _preNumValue)
          } else if (y > (5000 * _preNumValue)) {
            y = (5000 * _preNumValue)
          }


          //移动更新img的left top
          this.setState({
            imgleft: x,
            imgtop: y,
            imgScale: imgScale,
            origin: origin,
            distanceMove: preDistanceMove,
            preNumValue: parseFloat(preNumValue)
          })
        } else {
          let preX = pageX - x
          let preY = pageY - y

          // left的极限
          if (preX < -(5000 * preNumValue)) {
            preX = -(5000 * preNumValue)
          } else if (preX > (5000 * preNumValue)) {
            preX = (5000 * preNumValue)
          }

          // top的极限
          if (preY < -(5000 * preNumValue)) {
            preY = -(5000 * preNumValue)
          } else if (preY > (5000 * preNumValue)) {
            preY = (5000 * preNumValue)
          }

          //移动更新img的left top
          this.setState({
            imgleft: preX,
            imgtop: preY
          })
        }
        break;
      default:
        ;
    }
  }

  // 选中onTouchActive
  onTouchActive(item, e) {
    e.stopPropagation();
    let that = this
    let {isPitch, pitchId} = this.state
    if (item.show_status === 2) {
      Taro.showToast({
        title: "当前车位已被预订，请选择其他车位",
        icon: "none",
        mask: true,
        duration: 2000
      })
      console.log('已订')
    } else if (item.show_status === 3) {
      Taro.showToast({
        title: "当前车位已售出，请选择其他车位",
        icon: "none",
        mask: true,
        duration: 2000
      })
    } else {
      if (pitchId === item.id) {
        that.props.onPitch(!isPitch, item)
        that.setState({
          isPitch: !isPitch
        })
      } else {
        that.props.onPitch(true, item)
        that.setState({
          isPitch: true,
          pitchId: item.id
        })
      }
    }
  }

  render() {
    let {regionValue, imgScale, imgleft, imgtop, distance, origin, distanceMove, preNumValue} = this.state
    return (
      <View className='canvasWrapBody' id='canvasWrapBody'>
        <View className='cenText'>
          <View>{'div得放大倍数：' + imgScale}</View>
          <View>{'div得endTranslateX：' + imgleft}</View>
          <View>{'div得endTranslateY：' + imgtop}</View>
          <View>{'div得width：' + 5000 * preNumValue + 'px'}</View>
          <View>{'div得height：' + 5000 * preNumValue + 'px'}</View>
          <View>{'div得origin：' + origin.x}</View>
          <View>{'div得origin：' + origin.y}</View>
          <View>{distance.stop}</View>
          <View>{distance.start}</View>
          <View>{distanceMove}</View>
          <View>{preNumValue}</View>
        </View>
        <View
          className='canvasWrap'
          id='canvasWrap'
          style={{
            width: 5000 * preNumValue + 'px',
            height: 5000 * preNumValue + 'px',
            left: `${imgleft}px`,
            top: `${imgtop}px`,
            position: "absolute",
          }}
          onTouchMove={this.handleTouch.bind(this, 'touchmove')}
          onTouchstart={this.handleTouch.bind(this, 'touchstart')}
        >
          <Image
            id='canvasImage'
            className='canvasImage'
            src='https://saas-transfer-oss.oss-cn-hangzhou.aliyuncs.com/house_test/210118032448188.jpg'
            style={{
              width: 5000 * preNumValue + 'px',
              height: 5000 * preNumValue + 'px'
            }}
          />
        </View>
      </View>
    )
  }
}
