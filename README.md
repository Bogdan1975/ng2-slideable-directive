# ng2-slideable-directive


Status:
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)]()


Angular 2 directive that turn element to slider handle.

* [Install](#install)
* [Usage](#usage)
    - [Directive](#directive)
    - [Events](#events)


# Install

You can get it on npm.

```shell
npm install ng2-slideable-directive
```

# Usage

```html
<div id="range-slider-container">
    <div class="ui-slider-range" style="left: 0%; width: 100%;"></div>
    <span slideAble
          slideDirection="horisontal"
          dynamicRightLimit="right-handle"
          (onStopSliding)="stopSlidingHandler($event)"
          (onSliding)="slidingHandler($event)"
          id="left-handle"
          class="ui-slider-handle"
          style="left: 0%;"></span>
    <span slideAble
          slideDirection="horisontal"
          dynamicLeftLimit="left-handle"
          (onStopSliding)="stopSlidingHandler($event)"
          (onSliding)="slidingHandler($event)"
          id="right-handle"
          class="ui-slider-handle"
          style="left: 100%;"></span>
</div>
```


## Directive


### `slideable`

The `slideable` directive makes DOM-element as slideable

### `slideDirection`

The `slideDirection` attribute set a type of sliding. 
Possible values: `horisontal`, `vertical`, `both`
Default value: `both`

### `boundElement`

This attribute specify ID of element wich edges will be edges of sliding area
Value: id of DOM-elemnt
If this attribute is not defined, current parent of sliding element became bounding element 
Default value: `parent`

### `rightEdge`, `leftEdge`, `topEdge`, `bottomEdge`

This attributes set any edge separately. This attributes override `boundElement` attribute.
Value format: `elementId:side`, where `elementId` is ID of DOM-element and `side` can be valued as `left`, `right`, `top`, `bottom`, `center-x` or `center-y`

```html
<span slideAble
      boundElement="container"
      leftEdge="object1:left"
      topEdge="object2:center-y">
</span>
```
In this example sliding area will have follow edges - at left it will be left edge of element with ID `object1`, at right it will be right edge of element with ID `container`, at top it will be vertical center of element with ID `object2` and at bottom it will be bottom edge of element with ID `container`

### `dynamicRightLimit`, `dynamicLeftLimit`, `dynamicTopLimit`, `dynamicBottomLimit`

Potentially you may need dynamically changed edge(s) - for example in range slider left handle can't be the right of right handle, but right handle have dynamical position.
In these cases `dynamic****Limit` will help you. Format is the same as in `****Edge` attributes.



## Events

### `onSliding`

Event `onSliding` generated during slideable element slides

### `onStopSliding`

Event `onStopSliding` generated during slideable element stoped to slide, mouse button was released 
 