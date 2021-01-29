import React, {Component} from 'react';
import {Button, Image, View} from '@tarojs/components';
import {$} from '@tarojs/extend';
import SwiperCore, {Zoom} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';
import {getPageData} from "./api";
import './index.scss';

SwiperCore.use([Zoom]);

class IndexState {
  constructor() {
    this.navbarHeight = 0;
    this.data = null;
    this.title = '';
    this.points = [];
    this.imageInfo = {
      url: '',
      width: 0,
      height: 0,
      maxRatio: 1,
      panelScale: 1,
    };

    this.setPoints = (points = []) => {

    };
  }
}

export default class Index extends Component {

  constructor() {
    super(...arguments);
    this.state = new IndexState();
  }

  componentDidMount() {
    this.setState({
      navbarHeight: $('.index .navbar')[0].clientHeight,
    });

    getPageData().then(resp => {
      console.log(resp, this.state);
      this.setState({
        data: resp,
        title: resp.name,
        imageInfo: {
          url: resp.pic,
          width: resp.pic_width,
          height: resp.pic_height,
          maxRatio: resp.pic_width / document.body.clientWidth,
          panelScale: document.body.clientWidth / resp.pic_width,
        },
      });
    });
  }

  onSwiperInit(swiper) {
  }

  render() {
    return (
      <View className='index'>
        <View className='navbar'>
          {this.state.title}
        </View>

        {this.state.data && (
          <Swiper
            style={{
              marginTop: `${this.state.navbarHeight}px`,
              height: `calc(100vh - ${this.state.navbarHeight}px)`,
            }}
            zoom={{maxRatio: this.state.imageInfo.maxRatio}}
            onSwiper={(swiper) => this.onSwiperInit(swiper)}
          >
            <SwiperSlide>
              <View className='swiper-zoom-container'>
                <View className='swiper-zoom-target'>
                  <Image src={this.state.imageInfo.url}/>
                  <View
                    className='ops-panel'
                    style={{
                      transform: `scale(${this.state.imageInfo.panelScale})`,
                      width: `${this.state.imageInfo.width}px`,
                      height: `${this.state.imageInfo.height}px`,
                    }}
                  >
                    {
                      this.state.points.map((point, index) => {
                        return (
                          <View
                            key={index}
                            className={`point ${point.state}`}
                            onClick={() => this.selectPoint()}
                          >
                          </View>
                        );
                      })
                    }
                  </View>
                </View>
              </View>
            </SwiperSlide>
          </Swiper>
        )}

        <Button className='action'>
          暂未开盘
        </Button>
      </View>
    )
  }
}
