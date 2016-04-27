# ng2-slideable-directive


Status:
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)]()


Angular 2 directive that turn element to slider handle.

This directive is used by [Angular 2 Slider Component](https://github.com/Bogdan1975/ng2-slider-component)

* [Dependencies](#dependencies)
* [Install](#install)
* [Usage](#usage)
    - [Directive](#directive)
    - [Events](#events)
    - [Interfaces](#interfaces)
    - [CallBacks](#callbacks)


# Dependencies

- [Angular 2](https://github.com/angular/angular)  `npm install angular2`

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
          step="20"
          id="left-handle"
          class="ui-slider-handle"
          style="left: 0%;"></span>
    <span slideAble
          slideDirection="horisontal"
          dynamicLeftLimit="left-handle"
          (onStopSliding)="stopSlidingHandler($event)"
          (onSliding)="slidingHandler($event)"
          step="20"
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

### `step`

This attribute specify step of sliding in pixels

Default value: "1"

### `normalStyle`, `slidingStyle`

This attributes set styles of slideable element in normal and sliding modes

```html
<span slideAble
      boundElement="container"
      [normalStyle]="{ 'background-color': 'green'}"
      [slidingStyle]="{
            'border-radius': '9px',
            'background-color': 'red'
      }"
</span>
```


## Events

### `onInit`

Event `onInit` generated during initialisation of directive (ngOnInit)

Return object - implementation of interface [`IEventSlideAble`](#ieventslideable)

### `onStartSliding`

Event `onStartSliding` generated when mouse button was pressed and slideable element start to slide,  

### `onSliding`

Event `onSliding` generated during slideable element slides

### `onStopSliding`

Event `onStopSliding` generated when slideable element stoped to slide, mouse button was released 




## Interfaces

### `IEventSlideAble`
Events objects of SlideAbleDirective implements this interface

Interface properties:

`type`: `string` - type of event (`'init'`, `'sliding'`, `'stop'`)

`boundingRect`: `ClientRect` - result of standart DOM-document function `getBoundingClientRect()`, edges of slideable element

`relativePercentHorisontal`: `number` - relative horisontal position of sliding element in percents

`relativePercentVertical`: `number` - relative vertical position of slidable element in percents

`elementId`: `string` - value of slidable element `id` attribute

`instance`: `SlideAbleDirective` - instance of certain SlideAbleDirective object



## CallBacks

You can ser callback functions from parent

Example:
```TypeScript
    initHandlers(name: string, event: IEventSlideAble) {
        // Example of using callback function before redraw
        event.instance.checkXBeforeRedraw = function(x, y) {
            return true;
        }
        this.handlers[name] = event.instance;
    }
```

### `checkXBeforeRedraw(x, y)`
This functuion called changing horisontal position. If it returns `true` - element will be moved by horisontal axis, if `false` - will not
#### Arguments
`x`: `number` - current horisontal position of mouse pointer

`y`: `number` - current vertical position of mouse pointer

#### Result
`boolean`

### `checkYBeforeRedraw(x, y)`
This functuion called changing vertical position. If it returns `true` - element will be moved by vertical axis, if `false` - will not
#### Arguments
`x`: `number` - current horisontal position of mouse pointer

`y`: `number` - current vertical position of mouse pointer

#### Result
`boolean`
