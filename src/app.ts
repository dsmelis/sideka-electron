import { remote, ipcRenderer } from 'electron';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { enableProdMode, NgModule, Component, Inject, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { RouterModule, Router, Routes, ActivatedRoute } from '@angular/router';
import { HttpModule } from '@angular/http';
import { ProgressHttpModule, Progress } from 'angular-progress-http';
import { LeafletModule } from '@asymmetrik/angular2-leaflet';
import { ToastModule } from 'ng2-toastr';

import UndoRedoComponent from './components/undoRedo';
import CopyPasteComponent from './components/copyPaste';
import OnlineStatusComponent from './components/onlineStatus';
import DesaRegistrationComponent from './components/desaRegistration';
import MapComponent from './components/map';
import PendudukStatisticComponent from './components/pendudukStatistic';
import SuratComponent from './components/surat';
import PerencanaanComponent from './pages/perencanaan';
import PendudukComponent from './pages/penduduk';
import KemiskinanComponent from './pages/kemiskinan';
import RabComponent from './pages/rab';
import SppComponent from './pages/spp';
import PemetaanComponent from './pages/pemetaan';
import PendudukDetailComponent from './components/pendudukDetail';
import PaginationComponent from './components/pagination';
import PopupPaneComponent from './components/popupPane';
import ProgressBarComponent from './components/progressBar';

import DataApiService from './stores/dataApiService';
import SiskeudesService from './stores/siskeudesService';
import FeedApiService from './stores/feedApiService';

import * as $ from 'jquery';
import * as jetpack from 'fs-jetpack';
import * as moment from 'moment';
import * as path from 'path';
import * as os from 'os';

import env from './env';
import feedApi from './stores/feedApi';
import settings from './stores/settings';
import titleBar from './helpers/titleBar';

var pjson = require('./package.json');

if (env.name == 'production')
    enableProdMode();

const APP = remote.app;
const appDir = jetpack.cwd(APP.getAppPath());
const DATA_DIR = APP.getPath('userData');
const CONTENT_DIR = path.join(DATA_DIR, 'contents');
const ALL_CONTENTS = { rpjmList: true, config: true, feed: true, rabList: true, sppList: true, desaRegistration: true };
const JENIS_SPP = { UM: 'SPP Panjar', LS: 'SPP Definitif', PBY: 'SPP Pembiayaan' }

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf('://') > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

titleBar.initializeButtons();

@Component({
    selector: 'front',
    templateUrl: 'templates/front.html',
})
class FrontComponent {
    auth: any;
    package: any;
    file: any;
    logo: string;

    siskeudesPath: string;
    visiRPJM: any;
    sumAnggaranRAB: any = [];
    sppData: any = [];
    fixMultipleMisi: any;
    siskeudesMessage: string;
    isDbAvailable: boolean;

    feed: any;
    desas: any;
    loginErrorMessage: string;
    jabatan: string;
    penyurat: string;
    loginUsername: string;
    loginPassword: string;
    maxPaging: number;
    prodeskelRegCode: string;
    prodeskelPassword: string;
    contents: any;
    activeContent: any;
    progress: Progress;

    constructor(
        private sanitizer: DomSanitizer, 
        private zone: NgZone, 
        private dataApiService: DataApiService,
        private siskeudesService: SiskeudesService) {

        this.contents = Object.assign({}, ALL_CONTENTS);
        this.toggleContent('feed');
        this.maxPaging = 0;
    }

    ngOnInit() {
        titleBar.normal('Sideka');
        let me = this;
        this.auth = this.dataApiService.getActiveAuth();
        this.package = pjson;
        this.loadSettings();

        this.progress = {
            event: null,
            percentage: 0,
            lengthComputable: true,
            loaded: 0,
            total: 0
        };
        
        if (this.auth) {
            this.dataApiService.checkAuth().subscribe(data => {
                if (!data['user_id']) {
                    me.auth = null;
                    this.dataApiService.saveActiveAuth(me.auth);
                }
            });
        }

        feedApi.getOfflineFeed(data => {
            this.zone.run(() => {
                this.feed = this.convertFeed(data);
                this.desas = this.dataApiService.getLocalDesa();
                this.loadImages();
            });
        });

        this.dataApiService.getDesa(null).subscribe(
            desas => {
                feedApi.getFeed(data => {
                    this.zone.run(() => {
                        this.feed = this.convertFeed(data);
                        this.desas = desas;
                        this.loadImages();
                    });
                });
                jetpack.write(path.join(DATA_DIR, 'desa.json'), desas);
                this.progress.percentage = 100;
            },
            error => { 
                this.progress.percentage = 100;
            }
        );

        ipcRenderer.on('updater', (event, type, arg) => {
            if (type == 'update-downloaded') {
                $('#updater-version').html(arg);
                $('#updater').removeClass('hidden');
            }
        });

        $('#updater-btn').click(function () {
            ipcRenderer.send('updater', 'quitAndInstall');
        });
    }

    getDate(item) {
        var date = moment(new Date(item.pubDate));
        var dateString = date.fromNow();
        if (date.isBefore(moment().startOf('day').subtract(3, 'day'))) {
            dateString = date.format('LL');
        }
        return dateString;
    }

    getDesa(item) {
        var itemDomain = extractDomain(item.link);
        var desa = this.desas.filter(d => d.domain == itemDomain)[0];
        return desa && desa.desa ? desa.desa + ' - ' + desa.kabupaten : '-';
    }

    desaProgressListener(progress: Progress) {
        this.progress = progress;
    }

    loadImages() {
        var searchDiv = document.createElement('div');
        this.feed.forEach(item => {
            feedApi.getImage(searchDiv, item.link, image => {
                this.zone.run(() => {
                    if (image)
                        image = this.sanitizer.bypassSecurityTrustStyle("url('" + image + "')");
                    item.image = image;
                });
            })
        });
    }

    convertFeed(data) {
        var $xml = $(data);
        var items = [];
        $xml.find('item').each(function (i) {
            if (i === 30) return false;
            var $this = $(this);

            items.push({
                title: $this.find('title').text(),
                link: $this.find('link').text(),
                description: $this.find('description').text(),
                pubDate: $this.find('pubDate').text(),
            });
        });
        return items;
    }

    login() {
        let me = this;
        this.dataApiService.login(this.loginUsername, this.loginPassword).subscribe(
            data => {
                if (!data.success)
                    this.loginErrorMessage = 'User atau password Anda salah';    
                else {
                    me.auth = data;
                    me.dataApiService.saveActiveAuth(me.auth);
                }
            },
            error => {
                console.log(error);
                console.log(error.message);
                this.loginErrorMessage = 'Terjadi kesalahan';
            }
        );
        return false;
    }

    logout() {
        this.auth = null;
        this.dataApiService.logout();
        return false;
    }

    loadSettings(): void {
        this.jabatan = settings.data.jabatan;
        this.penyurat = settings.data.sender;
        this.logo = settings.data.logo;
        this.maxPaging = settings.data.maxPaging;
        this.siskeudesPath = settings.data['siskeudes.path'];
        this.prodeskelRegCode = settings.data['prodeskelRegCode'];
        this.prodeskelPassword = settings.data['prodeskelPassword'];
        this.fixMultipleMisi = settings.data['fixMultipleMisi']
    }

    saveSettings(): void {
        let data = {
            'jabatan': this.jabatan,
            'sender': this.penyurat,
            'logo': this.file,
            'maxPaging': this.maxPaging,
            'prodeskelRegCode': this.prodeskelRegCode,
            'prodeskelPassword': this.prodeskelPassword,
            'siskeudes.path': this.siskeudesPath,
            'fixMultipleMisi': this.fixMultipleMisi,
        };

        settings.setMany(data);
        this.loadSettings();
    }

    fileChangeEvent(fileInput: any) {
        let file = fileInput.target.files[0];
        let extensionFile = file.name.split('.').pop();

        if (extensionFile == 'mde' || extensionFile == 'mdb') {
            this.siskeudesPath = file.path;
        } else {
            this.file = jetpack.read(file.path).toString('base64');
        }
    }

    getVisiRPJM(): void {
        this.toggleContent('rpjmList');
        this.isDbAvailable = this.checkSiskeudesPath();

        if (this.isDbAvailable) {
            this.siskeudesService.getVisiRPJM(data => {
                this.zone.run(() => {
                    this.visiRPJM = data;
                });
            })
        }
    }

    getRAB(): void {
        this.toggleContent('rabList');
        this.sumAnggaranRAB = [];
        this.isDbAvailable = this.checkSiskeudesPath();

        if (this.isDbAvailable) {
            this.siskeudesService.getSumAnggaranRAB(data => {
                this.zone.run(() => {
                    let uniqueYears = [];

                    data.forEach(content => {
                        let isUniqueYear = uniqueYears.map(c => c['year']).indexOf(content['Tahun']);
                        let isUniqueDesa = uniqueYears.map(c => c['kd_desa']).indexOf(content['Kd_Desa']);

                        if (isUniqueDesa == -1 && isUniqueYear == -1 || isUniqueDesa == -1 && isUniqueYear != -1) {
                            uniqueYears.push({
                                year: content['Tahun'],
                                kd_desa: content['Kd_Desa'],
                            })
                        }
                    })

                    uniqueYears.forEach(item => {
                        let content = data.filter(c => c.Tahun == item.year && c.Kd_Desa == item.kd_desa)
                        this.sumAnggaranRAB.push({
                            year: item.year,
                            kd_desa: item.kd_desa,
                            data: content
                        })
                    })
                });
            })
        }
    }

    checkSiskeudesPath(): boolean {
        let res = false;
        let message = '';

        if (this.siskeudesPath) {
            if (!jetpack.exists(this.siskeudesPath))
                message = `Database Tidak Ditemukan di lokasi: ${this.siskeudesPath}`;
            else
                res = true;
        }
        else
            message = "Harap Pilih Database SISKEUDES Pada Menu Konfigurasi";

        this.zone.run(() => {
            this.siskeudesMessage = message;
        })

        return res;
    }

    registerDesa(): void {
        this.toggleContent('desaRegistration');
    }

    getSPPLists(): void {
        this.toggleContent('sppList');
        if (this.siskeudesPath) {
            this.siskeudesService.getSPP(data => {
                this.zone.run(() => {
                    this.sppData = data;
                })
            })
        }
    }

    toggleContent(content) {
        this.contents = Object.assign({}, ALL_CONTENTS);
        if (this.activeContent == content)
            content = 'feed';
        this.contents[content] = false;
        this.activeContent = content;
    }

    applyFixMultipleMisi() {
        if (this.fixMultipleMisi) return;
        this.fixMultipleMisi = 1;
        this.siskeudesService.applyFixMultipleMisi(response => {
            this.saveSettings();
        })
    }
}

@Component({
    selector: 'app',
    template: '<router-outlet></router-outlet>'
})

class AppComponent {
    constructor() { }
}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        LeafletModule,
        HttpModule,
        ProgressHttpModule,
        ToastModule.forRoot(),
        RouterModule.forRoot([
            { path: 'penduduk', component: PendudukComponent },
            { path: 'kemiskinan', component: KemiskinanComponent },
            { path: 'perencanaan', component: PerencanaanComponent },
            { path: 'rab', component: RabComponent },
            { path: 'spp', component: SppComponent },
            { path: 'pemetaan', component: PemetaanComponent },
            { path: '', component: FrontComponent, pathMatch: 'full' },
        ]),
    ],
    declarations: [
        AppComponent,
        FrontComponent,
        RabComponent,
        SppComponent,
        PerencanaanComponent,
        PendudukComponent,
        UndoRedoComponent,
        CopyPasteComponent,
        OnlineStatusComponent,
        PemetaanComponent,
        DesaRegistrationComponent,
        MapComponent,
        PendudukStatisticComponent,
        SuratComponent,
        PendudukDetailComponent,
        PaginationComponent,
        PopupPaneComponent,
        KemiskinanComponent,
        ProgressBarComponent
    ],
    entryComponents: [PopupPaneComponent],
    providers: [
        DataApiService,
        FeedApiService,
        SiskeudesService,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
    ],
    bootstrap: [AppComponent]
})

class SidekaModule {
    constructor() { }
}

platformBrowserDynamic().bootstrapModule(SidekaModule);
