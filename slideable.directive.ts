/**
 * Angular 2 directive that turn element to slider handle.
 * Created by Targus on 23.03.2016.
 *
 * @version 1.0.2
 * @author Bogdan Shapoval (targus) <it.targus@gmail.com>
 */

import {Directive, Input, Output, ElementRef, EventEmitter} from 'angular2/core'

export class BoundingRectClass {
    left:number;
    right:number;
    top:number;
    bottom:number;
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

    @Output('onSliding') slidingEvent = new EventEmitter();
    @Output('onStopSliding') stopSlidingEvent = new EventEmitter();

    private boundingRect:BoundingRectClass;
    private dynamicLimitRect:BoundingRectClass;

    private signatures:any = {
        top: '',
        left: '',
        bottom: '',
        right: ''
    };

    private dynamicLimits:any = {};

    constructor(private el:ElementRef) {
        console.log('SliadableDirective');
    }

    private zeroLeft;
    private zeroTop;

    ngOnInit() {
        this.dynamicLimitRect = this.dynamicLimitRect || new BoundingRectClass();
        this.direction = this.direction || 'both';

        if (!this.signatures.left) this.signatures.left = 'parent:left';
        if (!this.signatures.right) this.signatures.right = 'parent:right';
        if (!this.signatures.top) this.signatures.top = 'parent:top';
        if (!this.signatures.bottom) this.signatures.bottom = 'parent:bottom';
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

        // We can't calculate any values that depends from coordinates in ngOnInit, because may be not all page was rendered
        // That's why we calculate these values here
        if (!this.boundingRect) {
            this.boundingRect = new BoundingRectClass();
            this.calcMargins();
        }
        if (!this.zeroLeft || !this.zeroTop) {
            this.zeroLeft = this.el.nativeElement.getBoundingClientRect().left - parseInt(getComputedStyle(this.el.nativeElement).left);
            this.zeroTop = this.el.nativeElement.getBoundingClientRect().top - parseInt(getComputedStyle(this.el.nativeElement).top);
        }

        function dragProcess(event) {
            this.redraw(event.clientX, event.clientY);
        }

        document.onmousemove = dragProcess.bind(this);
        document.onmouseup = this.slideStop.bind(this);
    }

    /**
     * Move handle and change value in according to coordinate
     *
     * @param x
     * @param y
     * @returns {*}
     */
    redraw(x, y) {

        if (this.direction == 'horisontal' || this.direction == 'both') {
            if (x < this.boundingRect.left) x = this.boundingRect.left;
            if (x > this.boundingRect.right) x = this.boundingRect.right;
            if (!!this.dynamicLimitRect.left && x < this.dynamicLimitRect.left) x = this.dynamicLimitRect.left;
            if (!!this.dynamicLimitRect.right && x > this.dynamicLimitRect.right) x = this.dynamicLimitRect.right;
            this.el.nativeElement.style.left = x - this.zeroLeft - Math.round(this.el.nativeElement.getBoundingClientRect().width / 2) + 'px';
        }
        if (this.direction == 'vertical' || this.direction == 'both') {
            if (y < this.boundingRect.top) y = this.boundingRect.top;
            if (y > this.boundingRect.bottom) y = this.boundingRect.bottom;
            if (!!this.dynamicLimitRect.top && y < this.dynamicLimitRect.top) y = this.dynamicLimitRect.top;
            if (!!this.dynamicLimitRect.bottom && y > this.dynamicLimitRect.bottom) y = this.dynamicLimitRect.bottom;
            this.el.nativeElement.style.top = y - this.zeroTop - Math.round(this.el.nativeElement.getBoundingClientRect().height / 2) + 'px';
        }

        this.slidingEvent.emit(this.prepareEventData());
    }

    slideStop(event) {
        this.stopSlidingEvent.emit(this.prepareEventData());
        document.onmousemove = null;
        document.onmouseup = null;
    }

    prepareEventData() {
        let result = {};
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
                result = boundingRect.top + Math.round(boundingRect.heigth / 2);
                break;
            default:
                result = null;
        }
        return result;
    }
}
