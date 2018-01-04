# react-native-lightbox

## exhibition

![image](http://otn4d80hz.bkt.clouddn.com/2018-01-04%2016_14_55.gif)

## Installation

```
yarn add react-native-image-lightbox

or  npm install react-native-image-lightbox
```

## Usage

[https://www.npmjs.com/package/react-native-image-lightbox](https://www.npmjs.com/package/react-native-image-lightbox)

```js
import LightboxImage from 'react-native-image-lightbox';

  <LightboxImage  
        imageWidth = {260}
        imageHeight = {260}
        underlayColor = "#fff"
        source={{ uri: 'http://knittingisawesome.com/wp-content/uploads/2012/12/cat-wearing-a-reindeer-hat1.jpg'}}>
 
  </Lightbox>
);
```

## Properties

| Prop | Type | Description |
|---|---|---|
|**`activeProps`**|`object`|Optional set of props applied to the content component when in lightbox mode. Usable for applying custom styles or higher resolution image source.|
|**`renderHeader(close)`**|`function`|Custom header instead of default with X button|
|**`renderContent`**|`function`|Custom lightbox content instead of default child content|
|**`onClose`**|`function`|Triggered when lightbox is closed|
|**`onOpen`**|`function`|Triggered when lightbox is opened|
|**`underlayColor`**|`string`|Color of touchable background, defaults to `black`|
|**`backgroundColor`**|`string`|Color of lightbox background, defaults to `black`|
|**`swipeToDismiss`**|`bool`|Enables gestures to dismiss the fullscreen mode by swiping up or down, defaults to `true`.|
|**`springConfig`**|`object`|[`Animated.spring`](https://facebook.github.io/react-native/docs/animations.html) configuration, defaults to `{ tension: 30, friction: 7 }`.|

