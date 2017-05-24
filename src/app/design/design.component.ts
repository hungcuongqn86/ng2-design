import {Component, OnInit, ViewChild} from '@angular/core';
import {NgModel} from '@angular/forms';
import {DesignService} from './design.service';
import {ProductComponent} from './product.component';
import {DialogService} from 'ng2-bootstrap-modal';

import {Observable} from 'rxjs/Rx';

declare const SVG: any;
declare const key: any;

@Component({
    selector: 'app-design',
    templateUrl: './design.component.html',
    styleUrls: ['./design.component.css']
})
export class DesignComponent implements OnInit {
    @ViewChild('form1') form: NgModel;
    arrProduct: any = [];
    arrBaseTypes: any = [];
    arrBase: any = [];
    fDesign: any = JSON.parse('{"sBaseType":""}');
    oDesign: any = JSON.parse('{"sId":"","sFace":"front","sImageFront":"","sImageBack":""}');
    draw: any;
    productColor: any;
    productImg: any;
    printable: any;
    printableConf: any;
    width: number;
    height: number;
    arrNestedFront: any = [];
    arrNestedBack: any = [];
    selectItem: any;

    file: any = JSON.parse('{"input":""}');
    arrFile: any = [];
    filetype = '';

    constructor(private DesignService: DesignService, private dialogService: DialogService) {
    }

    ngOnInit() {
        const myobj = this;
        this.getBaseTypes();
        this.draw = SVG('drawing');
        this.productColor = this.draw.rect().fill('#fff');
        this.productImg = this.draw.image().click(function () {
            myobj.imgClick();
        });
        this.printable = this.draw.polyline().fill('none').stroke({color: 'rgba(0, 0, 0, 0.3)', width: 1});
        key('delete', function () {
            myobj.deleteImg();
        });
    }

    public handleFileSelect(evt) {
        const files = evt.target.files;
        const file = files[0];

        if (files && file) {
            this.arrFile.push(file);
            this.filetype = file.type;
            const reader = new FileReader();

            reader.onload = this._handleReaderLoaded.bind(this);

            reader.readAsBinaryString(file);
        }
    }

    private _handleReaderLoaded(readerEvt) {
        const binaryString = readerEvt.target.result;
        this.addImg(this.filetype, btoa(binaryString));
        // console.log(this.form['controls']['filePicker']);
        this.form['controls']['filePicker'].reset();
    }

    private imgClick() {
        this.resetSelect();
    }

    private resetSelect() {
        this.selectItem = null;
        for (let i = 0; i < this.arrNestedFront.length; i++) {
            this.arrNestedFront[i].selectize(false, {deepSelect: true});
        }
        for (let i = 0; i < this.arrNestedBack.length; i++) {
            this.arrNestedBack[i].selectize(false, {deepSelect: true});
        }
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
                console.error(error.json().message);
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
                    const baseid = this.arrBase[0].id;
                    this.selectBase(baseid);
                }
            },
            error => {
                console.error(error.json().message);
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
        this.printableConf = base.printable;
        this.width = base.image.width;
        this.height = base.image.height;

        this.setSize();
        this.setFace(this.oDesign.sFace);
        // this.setPrintable();
    }

    private setSize() {
        this.draw.size(this.width, this.height);
        this.productColor.size(this.width, this.height);
    }

    public setFace(face) {
        this.oDesign.sFace = face;
        if (this.oDesign.sFace === 'front') {
            this.productImg.load(this.oDesign.sImageFront);
        } else {
            this.productImg.load(this.oDesign.sImageBack);
        }
        this.setPrintable();
        this.resetSelect();
        this.setImgFace();
    }

    private setPrintable() {
        this.printable.clear();
        let opt: any = [];
        if (this.oDesign.sFace === 'front') {
            opt = {
                minX: Number(this.printableConf.front_left)
                , minY: Number(this.printableConf.front_top)
                , maxX: Number(this.printableConf.front_left) + Number(this.printableConf.front_width)
                , maxY: Number(this.printableConf.front_top) + Number(this.printableConf.front_height)
            };
            this.printable.plot([[this.printableConf.front_left, this.printableConf.front_top],
                [this.printableConf.front_left, Number(this.printableConf.front_top) + Number(this.printableConf.front_height)],
                [Number(this.printableConf.front_left) + Number(this.printableConf.front_width),
                    Number(this.printableConf.front_top) + Number(this.printableConf.front_height)],
                [Number(this.printableConf.front_left) + Number(this.printableConf.front_width)
                    , Number(this.printableConf.front_top)],
                [this.printableConf.front_left, this.printableConf.front_top]
            ]);
        } else {
            opt = {
                minX: Number(this.printableConf.back_left)
                , minY: Number(this.printableConf.back_top)
                , maxX: Number(this.printableConf.back_left) + Number(this.printableConf.back_width)
                , maxY: Number(this.printableConf.back_top) + Number(this.printableConf.back_height)
            };
            this.printable.plot([[this.printableConf.back_left, this.printableConf.back_top],
                [this.printableConf.back_left, Number(this.printableConf.back_top) + Number(this.printableConf.back_height)],
                [Number(this.printableConf.back_left) + Number(this.printableConf.back_width),
                    Number(this.printableConf.back_top) + Number(this.printableConf.back_height)],
                [Number(this.printableConf.back_left) + Number(this.printableConf.back_width)
                    , Number(this.printableConf.back_top)],
                [this.printableConf.back_left, this.printableConf.back_top]
            ]);
        }

        this.setPosition(opt);
    }

    private setPosition(opt: any) {
        const myobj = this;
        this.selectItem = null;
        for (let i = 0; i < this.arrNestedFront.length; i++) {
            const img = this.arrNestedFront[i];
            const tlX = (opt.maxX - opt.minX) / (img.printableConf.maxX - img.printableConf.minX);
            const tlY = (opt.maxY - opt.minY) / (img.printableConf.maxY - img.printableConf.minY);
            const mx = (img.x() - img.printableConf.minX) * tlX;
            const my = (img.y() - img.printableConf.minY) * tlY;

            let mW = img.width() * tlX;
            let mH = 0;
            if (opt.minX + mx + mW <= opt.maxX) {
                mH = mW * img.height() / img.width();
            } else {
                mW = opt.maxX - (opt.minX + mx);
                mH = mW * img.height() / img.width();
            }

            if (opt.minY + my + mH <= opt.maxY) {
                img.move(opt.minX + mx, opt.minY + my).size(mW, mH);
            } else {
                mH = opt.maxY - (opt.minY + my);
                mW = mH * img.width() / img.height();
                img.move(opt.minX + mx, opt.minY + my).size(mW, mH);
            }

            img.selectize(false, {deepSelect: true}).draggable(false);
            img.click(function () {
                myobj.resetSelect();
                this.selectize().resize({
                    constraint: opt
                }).draggable(opt);
                myobj.selectItem = this;
            });

            img.printableConf = opt;
            this.arrNestedFront[i] = img;
        }

        for (let i = 0; i < this.arrNestedBack.length; i++) {
            const img = this.arrNestedBack[i];
            const tlX = (opt.maxX - opt.minX) / (img.printableConf.maxX - img.printableConf.minX);
            const tlY = (opt.maxY - opt.minY) / (img.printableConf.maxY - img.printableConf.minY);
            const mx = (img.x() - img.printableConf.minX) * tlX;
            const my = (img.y() - img.printableConf.minY) * tlY;

            let mW = img.width() * tlX;
            let mH = 0;
            if (opt.minX + mx + mW <= opt.maxX) {
                mH = mW * img.height() / img.width();
            } else {
                mW = opt.maxX - (opt.minX + mx);
                mH = mW * img.height() / img.width();
            }

            if (opt.minY + my + mH <= opt.maxY) {
                img.move(opt.minX + mx, opt.minY + my).size(mW, mH);
            } else {
                mH = opt.maxY - (opt.minY + my);
                mW = mH * img.width() / img.height();
                img.move(opt.minX + mx, opt.minY + my).size(mW, mH);
            }

            img.selectize(false, {deepSelect: true}).draggable(false);
            img.click(function () {
                myobj.resetSelect();
                this.selectize().resize({
                    constraint: opt
                }).draggable(opt);
                myobj.selectItem = this;
            });

            img.printableConf = opt;
            this.arrNestedBack[i] = img;
        }
    }

    public setColor(sColor) {
        this.productColor.fill(sColor);
    }

    public addImg(filetype, binaryString: any) {
        const myobj = this;
        let printw: number;
        let printh: number;
        if (this.oDesign.sFace === 'front') {
            printw = this.printableConf.front_width;
            printh = this.printableConf.front_height;
        } else {
            printw = this.printableConf.back_width;
            printh = this.printableConf.back_height;
        }
        const image = this.draw.image('data:' + filetype + ';base64,' + binaryString)
            .loaded(function (loader) {
                if (printw < loader.width) {
                    let mwidth = printw;
                    let mheight = loader.height * mwidth / loader.width;
                    if (mheight <= printh) {
                        this.size(mwidth, mheight);
                    } else {
                        mheight = printh;
                        mwidth = loader.width * mheight / loader.height;
                        this.size(mwidth, mheight);
                    }
                } else {
                    if (printh < loader.height) {
                        const mheight = printh;
                        const mwidth = loader.width * mheight / loader.height;
                        this.size(mwidth, mheight);
                    }
                }
            });

        let opt: any = [];
        if (this.oDesign.sFace === 'front') {
            image.move(this.printableConf.front_left, this.printableConf.front_top);
            opt = {
                minX: Number(this.printableConf.front_left)
                , minY: Number(this.printableConf.front_top)
                , maxX: Number(this.printableConf.front_left) + Number(this.printableConf.front_width)
                , maxY: Number(this.printableConf.front_top) + Number(this.printableConf.front_height)
            };
        } else {
            image.move(this.printableConf.back_left, this.printableConf.back_top);
            opt = {
                minX: Number(this.printableConf.back_left)
                , minY: Number(this.printableConf.back_top)
                , maxX: Number(this.printableConf.back_left) + Number(this.printableConf.back_width)
                , maxY: Number(this.printableConf.back_top) + Number(this.printableConf.back_height)
            };
        }

        image.printableConf = opt;

        image.click(function () {
            myobj.resetSelect();
            this.selectize().resize({
                constraint: opt
            }).draggable(opt);
            myobj.selectItem = this;
        });

        image.on('dragend', function (event) {
            /*console.log(this.printableConf);
             console.log(myobj.printable);*/
        });

        if (this.oDesign.sFace === 'front') {
            this.arrNestedFront.push(image);
        } else {
            this.arrNestedBack.push(image);
        }
    }

    public selectLayer(leyer: any) {
        let opt: any = [];
        if (this.oDesign.sFace === 'front') {
            opt = {
                minX: this.printableConf.front_left
                , minY: this.printableConf.front_top
                , maxX: Number(this.printableConf.front_left) + Number(this.printableConf.front_width)
                , maxY: Number(this.printableConf.front_top) + Number(this.printableConf.front_height)
            };
        } else {
            opt = {
                minX: this.printableConf.back_left
                , minY: this.printableConf.back_top
                , maxX: Number(this.printableConf.back_left) + Number(this.printableConf.back_width)
                , maxY: Number(this.printableConf.back_top) + Number(this.printableConf.back_height)
            };
        }
        this.resetSelect();
        leyer.selectize().resize({
            constraint: opt
        }).draggable(opt);
        this.selectItem = leyer;
    }

    public deleteImg() {
        if (this.selectItem) {
            this.selectItem.selectize(false, {deepSelect: true}).remove();
            let indexx: number = this.arrNestedFront.indexOf(this.selectItem);
            if (indexx >= 0) {
                this.arrNestedFront.splice(indexx, 1);
            }
            indexx = this.arrNestedBack.indexOf(this.selectItem);
            if (indexx >= 0) {
                this.arrNestedBack.splice(indexx, 1);
            }
            this.selectItem = null;
        }
    }

    public deleteLayer(leyer: any) {
        this.selectItem = null;
        leyer.selectize(false, {deepSelect: true}).remove();
        let indexx: number = this.arrNestedFront.indexOf(leyer);
        if (indexx >= 0) {
            this.arrNestedFront.splice(indexx, 1);
        }
        indexx = this.arrNestedBack.indexOf(leyer);
        if (indexx >= 0) {
            this.arrNestedBack.splice(indexx, 1);
        }
    }

    private setImgFace() {
        if (this.oDesign.sFace === 'front') {
            for (let i = 0; i < this.arrNestedFront.length; i++) {
                this.arrNestedFront[i].show();
            }
            for (let i = 0; i < this.arrNestedBack.length; i++) {
                this.arrNestedBack[i].hide();
            }
        } else {
            for (let i = 0; i < this.arrNestedFront.length; i++) {
                this.arrNestedFront[i].hide();
            }
            for (let i = 0; i < this.arrNestedBack.length; i++) {
                this.arrNestedBack[i].show();
            }
        }
    }

    public addProduct() {
        this.dialogService.addDialog(ProductComponent, {
            title: 'Select product'
        })
            .subscribe((product) => {
                this.arrProduct.push(product);
            });
    }
}
