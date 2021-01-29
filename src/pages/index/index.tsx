import React, {Component} from 'react'
import {Image, View} from '@tarojs/components'
import {AtNavBar, AtToast} from 'taro-ui'
import Panzoom from '@panzoom/panzoom';
import {PanzoomObject} from "@panzoom/panzoom/dist/src/types";

import {getParkData, ParkResponseData} from "../../api/park";
import './index.scss'

export class ParkPoint {
  id = 0;
  color = '';
  text = '';
  top = 0;
  left = 0;
  extStatus = 0;
  showStatus = 0;
  checked = false;

  constructor(data) {
    this.top = parseFloat(data.yaxis) + 30;
    this.left = parseFloat(data.xaxis);

    this.id = data.id;
    this.extStatus = data.ext_status;
    this.showStatus = data.show_status;

    switch (data.show_status) {
      case 1:
        this.color = 'rgba(38,193,0,.85)';
        this.text = '可售';
        break;
      case 2:
        this.color = 'rgba(226,226,5,.85)';
        this.text = '已订';
        break;
      case 3:
        this.color = 'rgba(221,0,0,.85)';
        this.text = '已售';
        break;
      case 4:
        this.color = '';
        this.text = '';
        break;
    }
  }
}

export class IndexState {
  parkData!: ParkResponseData;
  panzoom!: PanzoomObject;
  parkPoints: ParkPoint[] = [];
  toast = {isOpened: false, message: ''};
}

export default class Index extends Component<any, IndexState> {
  state = new IndexState();

  componentDidMount() {
    getParkData().then(parkData => {
      this.setState({parkData});
      this.loadParkData();
      this.setState({parkPoints: parkData.park.map(p => new ParkPoint(p))});
    });
  }

  showToast(message = '') {
    if (this.state.toast.isOpened) {
      return this.setState({toast: {message, isOpened: true}});
    }

    this.setState({toast: {message, isOpened: true}});

    setTimeout(() => {
      this.setState({toast: {message: '', isOpened: false}});
    }, 3000);
  }

  loadParkData() {
    const wrapper: HTMLDivElement = document.querySelector('.index-page .park-wrapper') as any;
    const innerWrapper: HTMLDivElement = document.querySelector('.index-page .park-inner-wrapper') as any;
    const minScale = document.body.clientWidth / this.state.parkData.pic_width;
    const panzoom = Panzoom(wrapper, {
      minScale,
      maxScale: 1,
      setTransform: (elem, {scale, x, y}) => {
        innerWrapper.style.transform = `scale(${scale}) translate(${x}px, ${y}px)`;
      }
    });

    wrapper.parentElement!.addEventListener('wheel', e => {
      if (e.deltaY < 0) {
        panzoom.zoomOut();
      } else {
        panzoom.zoomIn();
      }
    });

    this.setState({panzoom});
    setTimeout(() => {
      panzoom.zoom(minScale * 3.5);
    });
  }

  selectParkPoint(point: ParkPoint) {
    if (point.showStatus == 1) {
      //选中车位
      point.checked = !point.checked;
      if (point.checked) {
        this.showToast('请求车位信息');
      } else {
        this.showToast('取消车位信息');
      }
    } else if (point.showStatus === 2) {
      this.showToast('当前车位已被预订，请选择其他车位');
    } else if (point.showStatus == 3) {
      this.showToast('当前车位已售出，请选择其他车位');
    }
  }

  render() {
    return (
      <View className='index-page'>
        <AtNavBar
          color='#000'
          title={this.state.parkData?.name}
          leftText=''
        />

        <AtToast isOpened={this.state.toast.isOpened!} text={this.state.toast.message}/>

        <View className='index-page-content'>
          {!!this.state.parkData && (
            <View
              className='park-wrapper'
            >
              <View
                className='park-inner-wrapper'
                style={{
                  width: `${this.state.parkData.pic_width}px`,
                  height: `${this.state.parkData.pic_height}px`,
                }}
              >
                <Image
                  src={this.state.parkData.pic}
                  style={{
                    width: `${this.state.parkData.pic_width}px`,
                    height: `${this.state.parkData.pic_height}px`,
                  }}
                />

                {
                  this.state.parkPoints.map((point, index) => {
                    return (
                      <View
                        className='park-point'
                        key={index}
                        style={{
                          top: `${point.top}px`,
                          left: `${point.left}px`,
                          backgroundColor: point.color,
                        }}
                        onClick={() => this.selectParkPoint(point)}
                      >
                        {point.text}
                      </View>
                    )
                  })
                }
              </View>
            </View>
          )}
        </View>
      </View>
    )
  }
}
