import { Component, ApplicationRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import PendudukSelectorComponent from '../components/pendudukSelector';
import MapUtils from '../helpers/mapUtils';

var convert = require('color-convert');

interface SubIndicator {
    id: string;
    label: string;
    type: string;
    order?: number;
    options?: any[]
};

@Component({
    selector: 'popup-pane',
    templateUrl: '../templates/popupPane.html'
})
export default class PopupPaneComponent {
    private _selectedIndicator;
    private _selectedFeature;
    private _map;

    @ViewChild(PendudukSelectorComponent)
    pendudukSelectorComponent: PendudukSelectorComponent;

    @Output()
    onEditFeature: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onDeleteFeature: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onFeatureMove: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    addMarker: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onDevelopFeature: EventEmitter<any> = new EventEmitter<any>();
    
    @Input()
    set selectedIndicator(value) {
        this._selectedIndicator = value;
    }
    get selectedIndicator() {
        return this._selectedIndicator;
    }

    @Input()
    set selectedFeature(value) {
        this._selectedFeature = value;
    }
    get selectedFeature() {
        return this._selectedFeature;
    }

    @Input()
    set map(value) {
        this._map = value;
    }
    get map() {
        return this._map;
    }

    selectedElement: any;
    subElements: any[] = [];
    elements: any[] = [];
    attributes: any[] = [];
    selectedAttribute: any;

    color: any;
    
    ngOnInit(): void { 
       this.selectedElement = this.selectedIndicator.elements.filter(e => 
           e.values && Object.keys(e.values).every(valueKey => 
             e.values[valueKey] === this.selectedFeature.feature.properties[valueKey])
       )[0];
      
       if(this.selectedElement)
          this.onElementChange();
    }

    onElementChange(): void {
       if(this.selectedElement.values){
           Object.keys(this.selectedElement.values).forEach(valueKey => {
               this.selectedFeature.feature.properties[valueKey] = this.selectedElement.values[valueKey];
           });
       }

       this.attributes = [];

       if(this.selectedElement.attributeSetNames){
            this.selectedElement.attributeSetNames.forEach(attributeSetName => {
                this.attributes = this.attributes.concat(this.selectedIndicator.attributeSets[attributeSetName]);
            });
       }

       if(this.selectedElement.attributes){
           this.attributes = this.attributes.concat(this.selectedElement.attributes);
       }

       this.selectedAttribute = this.selectedFeature.feature.properties;

       if(this.selectedElement['style']){
           let style = MapUtils.setupStyle(this.selectedElement['style']);
           this.selectedFeature.setStyle(style);
       }
       
       this.onEditFeature.emit(this.selectedFeature.feature.id);
    }

    onAttributeChange(key): void {
        let attribute = this.attributes.filter(e => e.key === key)[0];

        if(attribute && attribute['options']){
            let option = attribute['options'].filter(e => e.value == this.selectedAttribute[key])[0];

            if(option['marker']){
                let bounds = null;
                let center = null;

                if(this.selectedFeature.feature.geometry.type !== 'Point') {
                     bounds = this.selectedFeature.getBounds();
                     center = bounds.getCenter();
                }
                else
                    center = this.selectedFeature.feature.geometry.coordinates;
                
                if(this.selectedFeature['marker'])
                    this.map.removeLayer(this.selectedFeature['marker']);
        
                this.selectedFeature['marker'] = MapUtils.createMarker(option['marker'], center).addTo(this.map);
                this.selectedFeature.feature.properties['icon'] = option['marker'];
                
                this.addMarker.emit(this.selectedFeature['marker']);
            }
        }

        Object.assign(this.selectedFeature.feature.properties, this.selectedAttribute)
        this.onEditFeature.emit(this.selectedFeature.feature.id);
    }

    onPendudukSelected(data){
        this.selectedAttribute['kk'] = data.id;
        this.onAttributeChange('kk');
    }

    deleteFeature(): void {
        this.onDeleteFeature.emit(this.selectedFeature.feature.id);
    }

    moveFeature(): void {
        this.onFeatureMove.emit(this.selectedFeature.feature);
    }

    develop(): void {
        this.onDevelopFeature.emit(this.selectedFeature);
    }
}
