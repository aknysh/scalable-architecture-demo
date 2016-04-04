import {
  Component,
  Input,
  Output,
  ViewChild,
  ContentChildren,
  ChangeDetectorRef,
  Renderer,
  EventEmitter,
  ElementRef,
  QueryList,
  AfterViewInit,
  OnInit
} from 'angular2/core';

import {DropDownItemComponent} from './drop-down-item.component';

@Component({
  selector: 'dd-container',
  template: `
    <div id="master">
      <div id="selected" (click)="expandDropDown()">
        <span>{{_text}}</span>
        <div id="triangle"></div>
      </div>
      <div #itemsContainer id="items"><ng-content></ng-content></div>
    </div>
  `,
  styles: [`
    #master {
      position: relative;
      font-family: Arial, Helvetica, sans-serif;
      min-width: 150px;
      cursor: pointer;
      color: #333;
    }
    
    #selected {
      padding: 10px 15px;
      background: #E0E0DD;
      border-radius: 4px;
      box-sizing: border-box;
    }
    
    #triangle {
      border-color: #4f4f4f transparent transparent transparent;
      border-width: 8px 7.5px 0 7.5px;
      border-style: solid;
      margin-top: 7px;
      float: right;
      height: 0;
      width: 0;
    }

    #items {
      position: absolute;
      background: #EEE;
      overflow: hidden;
      transition: max-height 0.2s linear;
      border-bottom-right-radius: 4px;
      border-bottom-left-radius: 4px;
      max-height: 0;
      z-index: 1;
      right: 0;
      left: 0;
    }

    #items.expanded { max-height: 500px; }
  `]
})
export class DropDownContComponent implements OnInit, AfterViewInit {
  private static EXPAND_CLASS: string = 'expanded';
  private static DEF_TEXT: string = 'Select an item';

  @Output() change: EventEmitter<DropDownItemComponent> = new EventEmitter();
  @Input() placeholder: string = '';

  @ViewChild('itemsContainer') itemsContainer: ElementRef;
  @ContentChildren(DropDownItemComponent) children: QueryList<DropDownItemComponent>;

  private _text: string;
  private _value: string;

  private _isExpanded: boolean;
  private _buttonFlag: boolean;

  constructor(private _renderer: Renderer, private _cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._renderer.listenGlobal('document', 'click', () => { this.closeOnDocClick(); });
  }

  @Input()
  get value() {
    return this._value;
  }

  set value(value: string) {
    let result = (this.children || []).reduce((accum: DropDownItemComponent, item: DropDownItemComponent) => {
      if (item.value === value) {
        accum = item;
      }
      return accum;
    }, null);
    if (result) {
      this._value = result.value;
      this._text = result.text;
    } else {
      this._value = undefined;
      this._text = this.placeholder;
    }
  }

  ngAfterViewInit(): void {
    if (!this.value) {
      this._text = DropDownContComponent.DEF_TEXT;
    }
    this._cdRef.detectChanges();
  }

  expandDropDown(): void {
    this._setDropDownState(!this._isExpanded);
    this._buttonFlag = true;
  }

  closeOnDocClick(): void {
    if (!this._buttonFlag && this._isExpanded) {
      this._setDropDownState(false);
    } else {
      this._buttonFlag = false;
    }
  }

  emitOnChangeEvent(item: DropDownItemComponent): void {
    this.change.emit(item);
    this._text = item.text;
  }

  private _setDropDownState(state: boolean): void {
    this._isExpanded = state;

    this._renderer.setElementClass(
      this.itemsContainer.nativeElement,
      DropDownContComponent.EXPAND_CLASS,
      this._isExpanded
    );
  }
}