import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, Dimensions, Modal, PanResponder, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View,Image,InteractionManager } from 'react-native';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;
const DRAG_DISMISS_THRESHOLD = 150;
const STATUS_BAR_OFFSET = (Platform.OS === 'android' ? -25 : 0);
const isIOS = Platform.OS === 'ios';
import ImageViewer from 'react-native-image-zoom-viewer';
import PhotoView from 'react-native-photo-view';
import Gallery from 'react-native-image-gallery';

import ImageZoom from 'react-native-image-pan-zoom';

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  open: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    // Android pan handlers crash without this declaration:
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WINDOW_WIDTH,
    backgroundColor: 'transparent',
  },
  closeButton: {
    fontSize: 35,
    color: 'white',
    lineHeight: 40,
    width: 40,
    textAlign: 'center',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 1.5,
    shadowColor: 'black',
    shadowOpacity: 0.8,
  },
});

let fristPress = true
var timers = null
let imageHeight = 0
let imageWidth = 0

export default class LightboxOverlay extends Component {
  static propTypes = {
    origin: PropTypes.shape({
      x:        PropTypes.number,
      y:        PropTypes.number,
      width:    PropTypes.number,
      height:   PropTypes.number,
    }),
    springConfig: PropTypes.shape({
      tension:  PropTypes.number,
      friction: PropTypes.number,
    }),
    backgroundColor: PropTypes.string,
    isOpen:          PropTypes.bool,
    renderHeader:    PropTypes.func,
    onOpen:          PropTypes.func,
    onClose:         PropTypes.func,
    swipeToDismiss:  PropTypes.bool,
    imagesource : PropTypes.string,
    imageWidth : PropTypes.number,
    imageHeight : PropTypes.number,

  };

  static defaultProps = {
    springConfig: { tension: 30, friction: 7 },
    backgroundColor: 'black',
  };

  state = {
    isAnimating: false,
    isPanning: false,
    target: {
      x: 0,
      y: 0,
      opacity: 1,
    },
    pan: new Animated.Value(0),
    openVal: new Animated.Value(0),
    imageWidth: this.props.imageWidth,
    imageHeight: this.props.imageHeight,

  };

  constructor(props){
    super(props)

    // 开始手势操作
    this.lastPositionX = null
    this.lastPositionY = null
    this.zoomCurrentDistance = null 
    this.zoomLastDistance = null
    this.lastTouchStartTime = new Date().getTime()
    this.scale = 1
    this.zoomLastDistance = 0
    this.springValue = new Animated.Value(1)
    imageHeight = this.props.imageHeight
    imageWidth =  this.props.imageWidth
  }

  

  componentWillMount() {
    

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => !this.state.isAnimating,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => !this.state.isAnimating,
      onMoveShouldSetPanResponder: (evt, gestureState) => !this.state.isAnimating,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => !this.state.isAnimating,
      
      onStartShouldSetResponder :(evt)=>true,
      // onResponderMove : (evt) => this.onResponderMove(evt),

      onPanResponderMove : (evt,gestureState) => this.onResponderMove(evt,gestureState),
      onPanResponderGrant: (evt, gestureState) => {
        
        this.onPanResponderRelease(evt,gestureState)

        this.state.pan.setValue(0);
        this.setState({ isPanning: true });
      },
      onPanResponderMove: Animated.event([
        null,
        { dy: this.state.pan }
      ]),

      // 有其他组件请求接替响应者，当前的View是否“放权”？返回true的话则释放响应者权力。
      onPanResponderTerminationRequest: (evt, gestureState) => true,

      // 手指抬起离开屏幕
      onPanResponderRelease: (evt, gestureState) => {

        if(Math.abs(gestureState.dy) > DRAG_DISMISS_THRESHOLD) {
          this.setState({
            isPanning: false,
            target: {
              y: gestureState.dy,
              x: gestureState.dx,
              opacity: 1 - Math.abs(gestureState.dy / WINDOW_HEIGHT)
            }
          });
          this.close();
        } else {
          Animated.spring(
            this.state.pan,
            { toValue: 0, ...this.props.springConfig }
          ).start(() => { this.setState({ isPanning: false }); });
        }

      }
    });
  }

  componentDidMount() {
    if(this.props.isOpen) {
      this.open();
    
    }
  }

  open = () => {
    
    if(isIOS) {
      StatusBar.setHidden(true, 'fade');
    }
    this.state.pan.setValue(0);
    this.setState({
      isAnimating: true,
      target: {
        x: 0,
        y: 0,
        opacity: 1,
      }
    });

    Animated.spring(
      this.state.openVal,
      { toValue: 1, ...this.props.springConfig }
    ).start(() => this.setState({ isAnimating: false }));
  }

  close = () => {
    // this.springValue.setValue(1)

    // alert("1111")

    this.setState({
        imageWidth:imageWidth,
        imageHeight:imageHeight
    })

    if(isIOS) {
      StatusBar.setHidden(false, 'fade');
    }
    this.setState({
      isAnimating: true,
    });
    Animated.spring(
      this.state.openVal,
      { toValue: 0, ...this.props.springConfig }
    ).start(() => {
      this.setState({
        isAnimating: false,
      });
      this.props.onClose();
    });
  }

  componentWillReceiveProps(props) {
    if(this.props.isOpen != props.isOpen && props.isOpen) {
      this.open();
    }
  }

  onResponderMove(evt,gestureState){

    if (evt.nativeEvent.changedTouches.length <= 1) {
      console.log("1个手指点击")
    } else {
      console.log("两个手指点击")
    }

  }

  onPanResponderRelease(event, gestureState){

      if(gestureState.numberActiveTouches<=1){

        console.log("一个手机点击屏幕")
        console.log(gestureState)

      }else{
        console.log("多个屏幕点击")

        this.zoomLastDistance = this.zoomCurrentDistance

        const widthDistance = gestureState.x0
        const heightDistance = gestureState.y0

         this.springValue.setValue(heightDistance/widthDistance)


        const diagonalDistance = Math.sqrt(widthDistance * widthDistance + heightDistance * heightDistance)
        this.zoomCurrentDistance = Number(diagonalDistance.toFixed(1))

        let distanceDiff = (this.zoomCurrentDistance - this.zoomLastDistance) / 400
        let zoom = this.scale + distanceDiff
          if (zoom < 0.6) {
              zoom = 0.6
          }
          if (zoom > 10) {
              zoom = 10
          }
        // 开始缩放

        this.scale = zoom

       
        // Animated.spring(
        //   this.springValue,
        //   {
        //       toValue: 1,
        //       friction: 1
        //   }
        // ).start()

        console.log("点击事件的响应--------11111")
        // console.log(this.scale)
        console.log(gestureState)
  
        console.log("点击事件的响应--------1111-----2----2--3--3-4--4-5")
  
        console.log(event.nativeEvent)

      }

  }

  render() {
    
    const {
      isOpen,
      renderHeader,
      swipeToDismiss,
      origin,
      backgroundColor,
      imagesource,
    } = this.props;

    const {
      isPanning,
      isAnimating,
      openVal,
      target,
      imageHeight,
      imageWidth,
    } = this.state;

    const lightboxOpacityStyle = {
      opacity: openVal.interpolate({inputRange: [0, 1], outputRange: [0, target.opacity]})
    };

    let handlers;
    if(swipeToDismiss) {
      handlers = this._panResponder.panHandlers;
    }

    let dragStyle;
    if(isPanning) {
      dragStyle = {
        top: this.state.pan,
      };
      lightboxOpacityStyle.opacity = this.state.pan.interpolate({inputRange: [-WINDOW_HEIGHT, 0, WINDOW_HEIGHT], outputRange: [0, 1, 0]});
    }

    const openStyle = [styles.open, {
      //动画篡改 插入数据
      left:   openVal.interpolate({inputRange: [0, 1], outputRange: [origin.x, target.x]}),
      top:    openVal.interpolate({inputRange: [0, 1], outputRange: [origin.y + STATUS_BAR_OFFSET, target.y + STATUS_BAR_OFFSET]}),
      width:  openVal.interpolate({inputRange: [0, 1], outputRange: [origin.width, WINDOW_WIDTH]}),
      height: openVal.interpolate({inputRange: [0, 1], outputRange: [origin.height, WINDOW_HEIGHT]}),
    }];

    const background = (<Animated.View style={[styles.background, { backgroundColor: backgroundColor }, lightboxOpacityStyle]}></Animated.View>);
    
    const header = (<Animated.View style={[styles.header, lightboxOpacityStyle]}>{(renderHeader ?
      renderHeader(this.close) :
      (
        <TouchableOpacity onPress={this.close}>
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
      )
    )}</Animated.View>);

    const content = (
        <Animated.View style={[openStyle, dragStyle]} >
            <ImageZoom  cropWidth={Dimensions.get('window').width}
                        cropHeight={Dimensions.get('window').height}
                        imageWidth={imageWidth}
                        imageHeight={imageHeight}>

                <Image style={{width:imageWidth, height:imageHeight}}
                       source={{uri:imagesource}} resizeMode="contain"/>
                       
            </ImageZoom>
        </Animated.View>
    );

    if (this.props.navigator) {
      return (
        <View>
          {background}
          {content}
          {header}
        </View>
      );
    }

    return (
      <Modal visible={isOpen} transparent={true} onRequestClose={() => this.close()}>
       {background}
        {content}
        {header}
      </Modal>
    );
  }
}
