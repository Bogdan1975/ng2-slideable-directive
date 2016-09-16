"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var ng2_styled_directive_1 = require('ng2-styled-directive/ng2-styled.directive');
var BoundingRectClass = (function () {
    function BoundingRectClass() {
    }
    return BoundingRectClass;
}());
exports.BoundingRectClass = BoundingRectClass;
var EventSlideAble = (function () {
    function EventSlideAble(type, instance) {
        this.type = type;
        this.instance = instance;
    }
    return EventSlideAble;
}());
exports.EventSlideAble = EventSlideAble;
var SlideAbleDirective = (function () {
    function SlideAbleDirective(el, renderer, _view) {
        this.el = el;
        this.renderer = renderer;
        this._view = _view;
        this.step = 1;
        this.parent = null;
        this.startSlidingEvent = new core_1.EventEmitter();
        this.slidingEvent = new core_1.EventEmitter();
        this.stopSlidingEvent = new core_1.EventEmitter();
        this.initEvent = new core_1.EventEmitter();
        this.signatures = {
            top: '',
            left: '',
            bottom: '',
            right: ''
        };
        this.dynamicLimits = {};
        this.checkXBeforeRedraw = null;
        this.checkYBeforeRedraw = null;
        this.lastX = null;
        this.lastY = null;
    }
    Object.defineProperty(SlideAbleDirective.prototype, "boundElement", {
        set: function (elementId) {
            this.signatures = {
                top: elementId + ':top',
                bottom: elementId + ':bottom',
                left: elementId + ':left',
                right: elementId + ':right'
            };
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(SlideAbleDirective.prototype, "rightEdge", {
        set: function (signature) {
            this.signatures.right = signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideAbleDirective.prototype, "leftEdge", {
        set: function (signature) {
            this.signatures.left = signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideAbleDirective.prototype, "topEdge", {
        set: function (signature) {
            this.signatures.top = signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideAbleDirective.prototype, "bottomEdge", {
        set: function (signature) {
            this.signatures.bottom = signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideAbleDirective.prototype, "dynamicRightLimit", {
        set: function (signature) {
            this.dynamicLimits.right = signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideAbleDirective.prototype, "dynamicLeftLimit", {
        set: function (signature) {
            this.dynamicLimits.left = signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideAbleDirective.prototype, "dynamicTopLimit", {
        set: function (signature) {
            this.dynamicLimits.top = signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SlideAbleDirective.prototype, "dynamicBottomLimit", {
        set: function (signature) {
            this.dynamicLimits.bottom = signature;
        },
        enumerable: true,
        configurable: true
    });
    SlideAbleDirective.prototype.ngOnInit = function () {
        this.dynamicLimitRect = this.dynamicLimitRect || new BoundingRectClass();
        this.direction = this.direction || 'both';
        if (!this.signatures.left)
            this.signatures.left = 'parent:left';
        if (!this.signatures.right)
            this.signatures.right = 'parent:right';
        if (!this.signatures.top)
            this.signatures.top = 'parent:top';
        if (!this.signatures.bottom)
            this.signatures.bottom = 'parent:bottom';
        this.initEvent.emit(new EventSlideAble('init', this));
    };
    SlideAbleDirective.prototype.ngAfterViewInit = function () {
        if (!this._styledDirectives.length && this.normalStyle && this.slidingStyle) {
            this.styledInstance = new ng2_styled_directive_1.Ng2StyledDirective(this.el, this._view);
            var styleBlockArray = [];
            if (this.normalStyle) {
                var styleBlock = '';
                for (var idx in this.normalStyle) {
                    styleBlock += idx + ": " + this.normalStyle[idx] + "; ";
                }
                if (styleBlock)
                    styleBlockArray.push("{" + styleBlock + "}");
            }
            if (this.slidingStyle) {
                var styleBlock = '';
                for (var idx in this.slidingStyle) {
                    styleBlock += idx + ": " + this.slidingStyle[idx] + "; ";
                }
                if (styleBlock)
                    styleBlockArray.push("<.sliding {" + styleBlock + "}");
            }
            this.styledInstance.styleBlock = styleBlockArray;
            this.styledInstance.ngAfterViewInit();
        }
        else {
            this.styledInstance = this._styledDirectives.first;
        }
        var timer;
        var scrollStartX = 0;
        var scrolling = false;
        this.scrollPositionX = window.pageXOffset;
        window.addEventListener("scroll", function (e) {
            clearTimeout(timer);
            if (!scrolling)
                scrollStartX = window.pageXOffset;
            scrolling = true;
            timer = setTimeout(onScrollStop, 350);
        });
        var onScrollStop = function () {
        };
    };
    SlideAbleDirective.prototype.slideStart = function (e) {
        document.ondragstart = function () {
            return false;
        };
        document.body.onselectstart = function () {
            return false;
        };
        this.calcDynamicLimits();
        function dragProcess(event) {
            this.redraw(event.clientX, event.clientY);
        }
        function dragProcessTouch(event) {
            var touches = event.changedTouches;
            console.log('Touch');
            for (var i = 0; i < touches.length; i++) {
                if (touches[i].target == this.el.nativeElement) {
                    console.log('Redraw');
                    this.redraw(touches[i].clientX, touches[i].clientY);
                }
            }
        }
        document.onmousemove = dragProcess.bind(this);
        document.ontouchmove = dragProcessTouch.bind(this);
        document.onmouseup = this.slideStop.bind(this);
        document.ontouchend = this.slideStop.bind(this);
        if (!this.lastX && this.direction == 'vertical') {
            this.lastX = this.el.nativeElement.getBoundingClientRect().left - parseInt(getComputedStyle(this.el.nativeElement).left) + Math.round(this.el.nativeElement.getBoundingClientRect().width / 2);
            if (isNaN(this.lastX))
                this.lastX = Math.round(this.el.nativeElement.getBoundingClientRect().width / 2);
        }
        if (!this.lastY && this.direction == 'horisontal') {
            this.lastY = this.el.nativeElement.getBoundingClientRect().top - parseInt(getComputedStyle(this.el.nativeElement).top) + Math.round(this.el.nativeElement.getBoundingClientRect().height / 2);
            if (isNaN(this.lastY))
                this.lastY = Math.round(this.el.nativeElement.getBoundingClientRect().height / 2);
        }
        if (window.pageXOffset != this.scrollPositionX) {
            var delta = window.pageXOffset - this.scrollPositionX;
            if (this.lastX)
                this.lastX -= delta;
            if (this.zeroLeft)
                this.zeroLeft -= delta;
            this.scrollPositionX = window.pageXOffset;
        }
        this.lastX = this.el.nativeElement.getBoundingClientRect().left + Math.round(this.el.nativeElement.getBoundingClientRect().width / 2);
        this.boundingRect = new BoundingRectClass();
        this.calcMargins();
        this.renderer.setElementClass(this.el.nativeElement, 'sliding', true);
        if (this.lastX && (this.direction == 'horisontal' || this.direction == 'both')) {
            this.el.nativeElement.style.left = this.lastX - this.zeroLeft - Math.round(this.el.nativeElement.getBoundingClientRect().width / 2) + 'px';
        }
        if (this.lastY && (this.direction == 'vertical' || this.direction == 'both')) {
            this.el.nativeElement.style.top = this.lastY - this.zeroTop - Math.round(this.el.nativeElement.getBoundingClientRect().height / 2) + 'px';
        }
        this.startSlidingEvent.emit(this.prepareEventData('start'));
    };
    SlideAbleDirective.prototype.redraw = function (x, y) {
        this.boundingRect = new BoundingRectClass();
        this.calcMargins();
        var delta = window.pageXOffset - this.scrollPositionX;
        if (this.lastX)
            this.lastX -= delta;
        if (this.zeroLeft)
            this.zeroLeft -= delta;
        this.scrollPositionX = window.pageXOffset;
        this.zeroLeft = this.el.nativeElement.getBoundingClientRect().left - parseInt(getComputedStyle(this.el.nativeElement).left);
        if (isNaN(this.zeroLeft))
            this.zeroLeft = 0;
        this.zeroTop = this.el.nativeElement.getBoundingClientRect().top - parseInt(getComputedStyle(this.el.nativeElement).top);
        if (isNaN(this.zeroTop))
            this.zeroTop = 0;
        if (this.direction == 'horisontal' || this.direction == 'both') {
            if (this.lastX) {
                var k = (x - this.lastX) / this.step;
                x = this.lastX + Math.round(k) * this.step;
            }
            if (x - this.boundingRect.left < -0.8) {
                x = this.lastX + Math.ceil((this.boundingRect.left - this.lastX) / this.step) * this.step;
            }
            if (x - this.boundingRect.right > 0.8) {
                x = this.lastX + Math.floor((this.boundingRect.right - this.lastX) / this.step) * this.step;
            }
            if (!!this.dynamicLimitRect.left && x < this.dynamicLimitRect.left)
                x = this.dynamicLimitRect.left;
            if (!!this.dynamicLimitRect.right && x > this.dynamicLimitRect.right)
                x = this.dynamicLimitRect.right;
            if ((typeof (this.checkXBeforeRedraw) !== 'function' || this.checkXBeforeRedraw(x, y)) && x != this.lastX) {
                this.el.nativeElement.style.left = x - this.zeroLeft - Math.round(this.el.nativeElement.getBoundingClientRect().width / 2) + 'px';
                this.lastX = x;
            }
        }
        if (this.direction == 'vertical' || this.direction == 'both') {
            if (this.lastY) {
                var k = (y - this.lastY) / this.step;
                y = this.lastY + Math.round(k) * this.step;
            }
            if (y - this.boundingRect.top < -0.5) {
                y = this.lastY + Math.ceil((this.boundingRect.top - this.lastY) / this.step) * this.step;
            }
            if (y - this.boundingRect.bottom > 0.5) {
                y = this.boundingRect.bottom;
                y = this.lastY + Math.floor((this.boundingRect.bottom - this.lastY) / this.step) * this.step;
            }
            if (!!this.dynamicLimitRect.top && y < this.dynamicLimitRect.top)
                y = this.dynamicLimitRect.top;
            if (!!this.dynamicLimitRect.bottom && y > this.dynamicLimitRect.bottom)
                y = this.dynamicLimitRect.bottom;
            if ((typeof (this.checkYBeforeRedraw) !== 'function' || this.checkYBeforeRedraw(x, y)) && y != this.lastY) {
                this.el.nativeElement.style.top = y - this.zeroTop - Math.round(this.el.nativeElement.getBoundingClientRect().height / 2) + 'px';
                this.lastY = y;
            }
        }
        this.slidingEvent.emit(this.prepareEventData('sliding'));
    };
    SlideAbleDirective.prototype.slideStop = function (event) {
        this.stopSlidingEvent.emit(this.prepareEventData('stop'));
        document.onmousemove = null;
        document.ontouchmove = null;
        document.onmouseup = null;
        document.ontouchend = null;
        this.renderer.setElementClass(this.el.nativeElement, 'sliding', false);
        if (this.direction == 'horisontal' || this.direction == 'both') {
            var newLeft = this.lastX - this.zeroLeft - Math.round(this.el.nativeElement.getBoundingClientRect().width / 2);
            this.el.nativeElement.style.left = newLeft + 'px';
        }
        if (this.direction == 'vertical' || this.direction == 'both') {
            var newTop = this.lastY - this.zeroTop - Math.round(this.el.nativeElement.getBoundingClientRect().height / 2);
            this.el.nativeElement.style.top = newTop + 'px';
        }
    };
    SlideAbleDirective.prototype.prepareEventData = function (type) {
        var result = new EventSlideAble(type, this);
        result['boundingRect'] = this.el.nativeElement.getBoundingClientRect();
        result['relativePercentHorisontal'] = Math.round(100 * (result['boundingRect'].left + Math.round(result['boundingRect'].width / 2) - this.boundingRect.left) / (this.boundingRect.right - this.boundingRect.left));
        result['relativePercentVertical'] = Math.round(100 * (result['boundingRect'].top + Math.round(result['boundingRect'].height / 2) - this.boundingRect.top) / (this.boundingRect.bottom - this.boundingRect.top));
        result['elementId'] = this.el.nativeElement.id;
        return result;
    };
    SlideAbleDirective.prototype.calcMargins = function () {
        for (var idx in this.signatures) {
            var el = void 0, side = void 0;
            _a = this.splitSignature(this.signatures[idx]), el = _a[0], side = _a[1];
            if (!side) {
                if (idx == 'top' || idx == 'bottom')
                    side = 'center-y';
                if (idx == 'left' || idx == 'right')
                    side = 'center-x';
            }
            var result = this.getMargin(el, side);
            this.boundingRect[idx] = result;
        }
        var _a;
    };
    SlideAbleDirective.prototype.calcDynamicLimits = function () {
        for (var idx in this.dynamicLimits) {
            if (!this.dynamicLimits[idx])
                continue;
            var el = void 0, side = void 0;
            _a = this.splitSignature(this.dynamicLimits[idx]), el = _a[0], side = _a[1];
            if (!side) {
                if (idx == 'top' || idx == 'bottom')
                    side = 'center-y';
                if (idx == 'left' || idx == 'right')
                    side = 'center-x';
            }
            var result = this.getMargin(el, side);
            this.dynamicLimitRect[idx] = result;
        }
        var _a;
    };
    SlideAbleDirective.prototype.splitSignature = function (signature) {
        var tmp = signature.split(':', 2);
        var el, side;
        side = tmp[1];
        if (tmp[0] == '') {
            el = this.el.nativeElement.parentElement;
        }
        else {
            el = document.getElementById(tmp[0]);
            if (!el)
                el = this.el.nativeElement.parentElement;
        }
        el = el || null;
        side = side || null;
        return [el, side];
    };
    SlideAbleDirective.prototype.getMargin = function (el, side) {
        var boundingRect = el.getBoundingClientRect();
        var result;
        side = side.toLowerCase();
        switch (side) {
            case 'left':
            case 'right':
            case 'top':
            case 'bottom':
                result = boundingRect[side];
                break;
            case 'center-x':
                result = boundingRect.left + Math.round(boundingRect.width / 2);
                break;
            case 'center-y':
                result = boundingRect.top + Math.round(boundingRect.height / 2);
                break;
            default:
                result = null;
        }
        return result;
    };
    __decorate([
        core_1.Input('slideDirection'), 
        __metadata('design:type', String)
    ], SlideAbleDirective.prototype, "direction", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], SlideAbleDirective.prototype, "boundElement", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], SlideAbleDirective.prototype, "rightEdge", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], SlideAbleDirective.prototype, "leftEdge", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], SlideAbleDirective.prototype, "topEdge", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], SlideAbleDirective.prototype, "bottomEdge", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], SlideAbleDirective.prototype, "dynamicRightLimit", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], SlideAbleDirective.prototype, "dynamicLeftLimit", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], SlideAbleDirective.prototype, "dynamicTopLimit", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], SlideAbleDirective.prototype, "dynamicBottomLimit", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SlideAbleDirective.prototype, "normalStyle", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SlideAbleDirective.prototype, "slidingStyle", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SlideAbleDirective.prototype, "step", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SlideAbleDirective.prototype, "parent", void 0);
    __decorate([
        core_1.Output('onStartSliding'), 
        __metadata('design:type', Object)
    ], SlideAbleDirective.prototype, "startSlidingEvent", void 0);
    __decorate([
        core_1.Output('onSliding'), 
        __metadata('design:type', Object)
    ], SlideAbleDirective.prototype, "slidingEvent", void 0);
    __decorate([
        core_1.Output('onStopSliding'), 
        __metadata('design:type', Object)
    ], SlideAbleDirective.prototype, "stopSlidingEvent", void 0);
    __decorate([
        core_1.Output('onInit'), 
        __metadata('design:type', Object)
    ], SlideAbleDirective.prototype, "initEvent", void 0);
    __decorate([
        core_1.ContentChildren(ng2_styled_directive_1.Ng2StyledDirective), 
        __metadata('design:type', core_1.QueryList)
    ], SlideAbleDirective.prototype, "_styledDirectives", void 0);
    SlideAbleDirective = __decorate([
        core_1.Directive({
            selector: '[slideAble]',
            host: {
                '(mousedown)': 'slideStart($event)',
                '(touchstart)': 'slideStart($event)'
            }
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.Renderer, core_1.ViewContainerRef])
    ], SlideAbleDirective);
    return SlideAbleDirective;
}());
exports.SlideAbleDirective = SlideAbleDirective;
//# sourceMappingURL=slideable.directive.js.map