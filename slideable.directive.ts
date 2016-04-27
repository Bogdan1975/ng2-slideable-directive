/**
 * Angular 2 directive that turn element to slider handle.
 * Created by Targus on 23.03.2016.
 * Last changed: 15.04.2016
 *
 * @version 1.0.4
 * @author Bogdan Shapoval (targus) <it.targus@gmail.com>
 */

import {Directive, Input, Output, Renderer, ElementRef, EventEmitter} from 'angular2/core'

export class BoundingRectClass {
    left:number;
    right:number;
    top:number;
    bottom:number;
}

export interface IEventSlideAble {
    type: string;
    boundingRect: ClientRect;
    relativePercentHorisontal: number;
    relativePercentVertical: number;
    elementId: string;
    instance: SlideAbleDirective;
}
export class EventSlideAble implements IEventSlideAble {
    
    boundingRect: ClientRect;
    relativePercentHorisontal: number;
    relativePercentVertical: number;
    elementId: string;
    
    constructor(public type: string, public instance:SlideAbleDirective){}
}

@Directive({
    selector: '[slideAble]',
    host: {
        '(mousedown)': 'slideStart($event)'
    }
})
export class SlideAbleDirective {

    @Input('slideDirection') direction:string;

    @Input() set boundElement(elementId) {
        this.signatures = {
            top: elementId + ':top',
            bottom: elementId + ':bottom',
            left: elementId + ':left',
            right: elementId + ':right'
        }
    };

    // Setting edges of slideable area
    @Input() set rightEdge(signature:string) {
        this.signatures.right = signature;
    }

    @Input() set leftEdge(signature:string) {
        this.signatures.left = signature;
    }

    @Input() set topEdge(signature:string) {
        this.signatures.top = signature;
    }

    @Input() set bottomEdge(signature:string) {
        this.signatures.bottom = signature;
    }

    // Setting dynamic limits of sliding
    @Input() set dynamicRightLimit(signature:string) {
        this.dynamicLimits.right = signature;
    }

    @Input() set dynamicLeftLimit(signature:string) {
        this.dynamicLimits.left = signature;
    }

    @Input() set dynamicTopLimit(signature:string) {
        this.dynamicLimits.top = signature;
    }

    @Input() set dynamicBottomLimit(signature:string) {
        this.dynamicLimits.bottom = signature;
    }

    @Input() normalStyle: Object;
    @Input() slidingStyle: Object;
    
    @Input() step: any = 1;
    @Input() parent: any = null;

    @Output('onStartSliding') startSlidingEvent = new EventEmitter();
    @Output('onSliding') slidingEvent = new EventEmitter();
    @Output('onStopSliding') stopSlidingEvent = new EventEmitter();
    @Output('onInit') initEvent = new EventEmitter();

    public boundingRect:BoundingRectClass;
    private dynamicLimitRect:BoundingRectClass;

    private signatures:any = {
        top: '',
        left: '',
        bottom: '',
        right: ''
    };

    private dynamicLimits:any = {};

    constructor(private el:ElementRef, private renderer: Renderer) {
        console.log('SliadableDirective');
    }

    private zeroLeft;
    private zeroTop;
    
    // Dummies for callback functions
    public checkXBeforeRedraw = null;
    public checkYBeforeRedraw = null;

    private lastX = null;
    private lastY = null;

    private backupStyle: Object;

    ngOnInit() {
        this.dynamicLimitRect = this.dynamicLimitRect || new BoundingRectClass();
        this.direction = this.direction || 'both';

        if (!this.signatures.left) this.signatures.left = 'parent:left';
        if (!this.signatures.right) this.signatures.right = 'parent:right';
        if (!this.signatures.top) this.signatures.top = 'parent:top';
        if (!this.signatures.bottom) this.signatures.bottom = 'parent:bottom';

        this.initEvent.emit(new EventSlideAble('init', this));
    }

    ngAfterViewInit() {
        // Set initial styles if needed
        if (this.normalStyle) {
            for (let idx in this.normalStyle) {
                this.renderer.setElementStyle(this.el.nativeElement, idx, this.normalStyle[idx]);
            }
        }

        // Store normal styles values
        if (this.slidingStyle) {
            this.backupStyle = {};
            for (let idx in this.slidingStyle) {
                var currentStyle = window.getComputedStyle(this.el.nativeElement).getPropertyValue(idx);
                // Get property in other way in case of FireFox
                if (!currentStyle) currentStyle = this.el.nativeElement.style[idx];
                this.backupStyle[idx] = currentStyle;
            }
        }
    }

    slideStart(e) {
        
        // deny dragging and selecting
        document.ondragstart = function () {
            return false;
        };
        document.body.onselectstart = function () {
            return false;
        };

        // Calculate dynamic limits every time when sliding was started
        this.calcDynamicLimits();

        function dragProcess(event) {
            this.redraw(event.clientX, event.clientY);
        }

        document.onmousemove = dragProcess.bind(this);
        document.onmouseup = this.slideStop.bind(this);

        if (!this.lastX && this.direction == 'vartical') {
            this.lastX = this.el.nativeElement.getBoundingClientRect().left - parseInt(getComputedStyle(this.el.nativeElement).left) + Math.round(this.el.nativeElement.getBoundingClientRect().width / 2);
            if (isNaN(this.lastX)) this.lastX = Math.round(this.el.nativeElement.getBoundingClientRect().width / 2);
        }
        if (!this.lastY && this.direction == 'horisontal') {
            this.lastY = this.el.nativeElement.getBoundingClientRect().top - parseInt(getComputedStyle(this.el.nativeElement).top) + Math.round(this.el.nativeElement.getBoundingClientRect().height / 2);
            if (isNaN(this.lastY)) this.lastY = Math.round(this.el.nativeElement.getBoundingClientRect().height / 2);
        }

        // Change styles
        if (this.slidingStyle) {
            for (let idx in this.slidingStyle) {
                this.renderer.setElementStyle(this.el.nativeElement, idx, this.slidingStyle[idx]);
            }
            if (this.lastX) {
                this.el.nativeElement.style.left = this.lastX - this.zeroLeft - Math.round(this.el.nativeElement.getBoundingClientRect().width / 2) + 'px';
            }
            if (this.lastY) {
                this.el.nativeElement.style.top = this.lastY - this.zeroTop - Math.round(this.el.nativeElement.getBoundingClientRect().height / 2) + 'px';
            }
        }

        this.startSlidingEvent.emit(this.prepareEventData('start'));
    }

    /**
     * Move handle and change value in according to coordinate
     *
     * @param x
     * @param y
     * @returns {*}
     */
    redraw(x, y) {

        // We can't calculate any values that depends from coordinates in ngOnInit, because may be not all page was rendered
        // That's why we calculate these values here
        if (!this.boundingRect) {
            this.boundingRect = new BoundingRectClass();
            this.calcMargins();
        }

        if (typeof(this.zeroLeft) === 'undefined') {
            this.zeroLeft = this.el.nativeElement.getBoundingClientRect().left - parseInt(getComputedStyle(this.el.nativeElement).left);
            if (isNaN(this.zeroLeft)) this.zeroLeft = 0;
        }
        if (typeof(this.zeroTop) === 'undefined') {
            this.zeroTop = this.el.nativeElement.getBoundingClientRect().top - parseInt(getComputedStyle(this.el.nativeElement).top);
            if (isNaN(this.zeroTop)) this.zeroTop = 0;
        }

        if (this.direction == 'horisontal' || this.direction == 'both') {
            if (this.lastX) {
                let k = (x - this.lastX) / this.step;
                x = this.lastX + Math.round(k) * this.step;
            }
            
            if (x - this.boundingRect.left < -0.5) {
                x = this.lastX + Math.ceil((this.boundingRect.left - this.lastX) / this.step) * this.step;
            }
            if (x - this.boundingRect.right > 0.5) {
                x = this.lastX + Math.floor((this.boundingRect.right - this.lastX) / this.step) * this.step;
            }

            if (!!this.dynamicLimitRect.left && x < this.dynamicLimitRect.left) x = this.dynamicLimitRect.left;
            if (!!this.dynamicLimitRect.right && x > this.dynamicLimitRect.right) x = this.dynamicLimitRect.right;
            
            // Check callback result to make decigion change horisontal position or not
            if ((typeof(this.checkXBeforeRedraw) !== 'function' || this.checkXBeforeRedraw(x, y)) && x != this.lastX) {
                this.el.nativeElement.style.left = x - this.zeroLeft - Math.round(this.el.nativeElement.getBoundingClientRect().width / 2) + 'px';
                this.lastX = x;
            }
        }

        if (this.direction == 'vertical' || this.direction == 'both') {
            if (this.lastY) {
                let k = (y - this.lastY) / this.step;
                y = this.lastY + Math.round(k) * this.step;
            }

            if (y - this.boundingRect.top < -0.5) {
                y = this.lastY + Math.ceil((this.boundingRect.top - this.lastY) / this.step) * this.step;
            }
            if (y - this.boundingRect.bottom > 0.5) {
                y = this.boundingRect.bottom;
                y = this.lastY + Math.floor((this.boundingRect.bottom - this.lastY) / this.step) * this.step;
            }

            if (!!this.dynamicLimitRect.top && y < this.dynamicLimitRect.top) y = this.dynamicLimitRect.top;
            if (!!this.dynamicLimitRect.bottom && y > this.dynamicLimitRect.bottom) y = this.dynamicLimitRect.bottom;

            // Check callback result to make decigion change horisontal position or not
            if ((typeof(this.checkYBeforeRedraw) !== 'function' || this.checkYBeforeRedraw(x, y)) && y != this.lastY) {
                this.el.nativeElement.style.top = y - this.zeroTop - Math.round(this.el.nativeElement.getBoundingClientRect().height / 2) + 'px';
                this.lastY = y;
            }
        }

        this.slidingEvent.emit(this.prepareEventData('sliding'));
    }

    slideStop(event) {
        this.stopSlidingEvent.emit(this.prepareEventData('stop'));
        document.onmousemove = null;
        document.onmouseup = null;
        if (this.backupStyle) {
            for (let idx in this.backupStyle) {
                this.renderer.setElementStyle(this.el.nativeElement, idx, this.backupStyle[idx]);
            }
            this.el.nativeElement.style.left = this.lastX - this.zeroLeft - Math.round(this.el.nativeElement.getBoundingClientRect().width / 2) + 'px';
            this.el.nativeElement.style.top = this.lastY - this.zeroTop - Math.round(this.el.nativeElement.getBoundingClientRect().height / 2) + 'px';
        }
    }

    prepareEventData(type) :IEventSlideAble {
        let result = new EventSlideAble(type, this);
        result['boundingRect'] = this.el.nativeElement.getBoundingClientRect();
        result['relativePercentHorisontal'] = Math.round(100 * (result['boundingRect'].left + Math.round(result['boundingRect'].width / 2) - this.boundingRect.left) / (this.boundingRect.right - this.boundingRect.left));
        result['relativePercentVertical'] = Math.round(100 * (result['boundingRect'].top + Math.round(result['boundingRect'].height / 2) - this.boundingRect.top) / (this.boundingRect.bottom - this.boundingRect.top));
        result['elementId'] = this.el.nativeElement.id;
        return result;
    }

    // Calculating all margins of common sliding area
    calcMargins() {
        for (let idx in this.signatures) {
            let el, side;
            [el, side] = this.splitSignature(this.signatures[idx]);
            if (!side) {
                if (idx == 'top' || idx == 'bottom') side = 'center-y';
                if (idx == 'left' || idx == 'right') side = 'center-x';
            }
            let result = this.getMargin(el, side);
            this.boundingRect[idx] = result;
        }
    }

    // Calculating dynamic sliding limits
    calcDynamicLimits() {
        for (let idx in this.dynamicLimits) {
            if (!this.dynamicLimits[idx]) continue;
            let el, side;
            [el, side] = this.splitSignature(this.dynamicLimits[idx]);
            if (!side) {
                if (idx == 'top' || idx == 'bottom') side = 'center-y';
                if (idx == 'left' || idx == 'right') side = 'center-x';
            }
            let result = this.getMargin(el, side);
            this.dynamicLimitRect[idx] = result;
        }
    }

    // Extract from 'element:side' fromat element object and side
    // If element missed or not finded, get parent as element
    splitSignature(signature:string) {
        let tmp = signature.split(':', 2);
        let el, side;
        side = tmp[1];
        if (tmp[0] == '') {
            el = this.el.nativeElement.parentElement;
        } else {
            el = document.getElementById(tmp[0]);
            if (!el) el = this.el.nativeElement.parentElement;
        }
        el = el || null;
        side = side || null;
        return [el, side];
    }

    // Getting coordinate of certain side (or center) of DOM-element
    getMargin(el:any, side:string) {
        let boundingRect = el.getBoundingClientRect();
        let result;
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
    }
}
