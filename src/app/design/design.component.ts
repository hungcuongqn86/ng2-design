import {Component, OnInit} from '@angular/core';
import {DesignService} from './design.service';

import {Observable} from 'rxjs/Rx';

declare const SVG: any;

@Component({
    selector: 'app-design',
    templateUrl: './design.component.html',
    styleUrls: ['./design.component.css']
})
export class DesignComponent implements OnInit {
    arrBaseTypes: any = [];
    arrBase: any = [];
    fDesign: any = JSON.parse('{"sBaseType":""}');
    oDesign: any = JSON.parse('{"sId":"","sFace":"front","sColor":"","sImageFront":"","sImageBack":""}');

    constructor(private DesignService: DesignService) {
    }

    ngOnInit() {
        this.getBaseTypes();
        /*    /!*const draw = SVG('drawing').size(500, 130)

         const image = draw.image('https://cdn.img42.com/4b6f5e63ac50c95fe147052d8a4db676.jpeg');
         image.size(100, 100).move(20, 20);*!/

         const draw = SVG('drawing').size(500, 130);
         const rect = draw.image('https://cdn.img42.com/4b6f5e63ac50c95fe147052d8a4db676.jpeg').size(100, 100);
         rect.selectize();
         // rect.selectize().resize();
         // rect.draggable();*/

        const draw = SVG('drawing').size(500, 130);
        const rect = draw.image('https://cdn.img42.com/4b6f5e63ac50c95fe147052d8a4db676.jpeg');
        rect.size(100, 100);
        rect.selectize();
        rect.resize();
        rect.draggable();
    }

    private getBaseTypes() {
        this.DesignService.getBaseTypes().subscribe(
            data => {
                this.arrBaseTypes = data;
                if (this.arrBaseTypes.length) {
                    const arrBaseType: any = this.arrBaseTypes[0].base_types;
                    if (arrBaseType.length) {
                        this.fDesign.sBaseType = arrBaseType[0].id;
                        this.selectBaseType();
                    }
                }
            },
            error => {
                console.error('Not base groups');
                return Observable.throw(error);
            }
        );
    }

    public selectBaseType() {
        this.getBases();
    }

    private getBases() {
        this.DesignService.getBases(this.fDesign.sBaseType).subscribe(
            data => {
                this.arrBase = data;
                if (this.arrBase.length > 0) {
                    if (this.oDesign.sId === '') {
                        const baseid = this.arrBase[0].id;
                        this.selectBase(baseid);
                    }
                }
            },
            error => {
                console.error('Not base');
                return Observable.throw(error);
            }
        );
    }

    public selectBase(id) {
        for (let i = 0; i < this.arrBase.length; i++) {
            const value = this.arrBase[i].id;
            if (value === id) {
                this._selectBase(this.arrBase[i]);
            }
        }
    }

    private _selectBase(base: any) {
        this.oDesign.sId = base.id;
        this.oDesign.sImageFront = base.image.front;
        this.oDesign.sImageBack = base.image.back;
    }

    public setFace(face) {
        this.oDesign.sFace = face;
    }

    public setColor(sColor) {
        this.oDesign.sColor = sColor;
    }
}
