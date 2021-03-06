import WebdriverHelper from './webdriverHelper';

const PRODESKEL_URL = 'http://prodeskel.binapemdes.kemendagri.go.id';
const SUMBER_DATA = 'SIDEKA';

export default class ProdeskelProtocol {
    helper: WebdriverHelper;

    constructor() {
        this.helper = new WebdriverHelper();
    }

    login(reqNo: string, password: string): void {
        this.helper.goTo(PRODESKEL_URL + '/app_Login/');
        this.helper.fillText(null, 'name', 'login', reqNo);
        this.helper.fillText(null, 'name', 'pswd', password);
        this.helper.click (null, 'id', 'sub_form_b');
    }

    async run(kepalaKeluarga, anggota, user): Promise<void> {
        await this.helper.waitUntilUrlIs(PRODESKEL_URL + '/mdesa/', 5 * 1000);
        await this.searchKK(kepalaKeluarga.no_kk);
        await this.helper.waitUntilElementIsVisible('id', 'id_div_process_block', 5 * 1000);
        await this.helper.waitUntilElementIsNotVisible('id', 'id_div_process_block', 5 * 1000);

        console.log('Now is checking result');
        
        let dataGrids = await this.helper.waitFindElements('id', 'apl_grid_ddk01#?#1', 5 * 1000);
    
        if(dataGrids.length === 0) 
            await this.setupNewKK(kepalaKeluarga, anggota, user);
        else
            await this.editExistingKk(kepalaKeluarga, anggota, user);
    }

    async searchKK(noKK): Promise<void> {
        console.log('Now is searching KK');

        this.helper.goTo(PRODESKEL_URL + "/grid_ddk01/");
        
        await this.helper.waitUntilUrlIs(PRODESKEL_URL + '/grid_ddk01/', 5 * 1000);
        await this.helper.waitUntilElementIsVisible('name', 'sc_clone_nmgp_arg_fast_search', 5 * 1000);
        await this.helper.waitUntilElementLocated('name', 'sc_clone_nmgp_arg_fast_search', 5 * 1000);

        this.helper.click(null, 'name', 'sc_clone_nmgp_arg_fast_search');
        this.helper.fillText(null, 'name', 'nmgp_arg_fast_search', noKK);
        this.helper.click(null, 'id', 'SC_fast_search_submit_top');
    }

    async editExistingKk(kepalaKeluarga, anggota, user): Promise<void> {
       let dataGrid = await this.helper.findElement(null, 'id', 'apl_grid_ddk01#?#1');
       let selectedRow = await this.helper.findElement(dataGrid, 'className', 'scGridFieldOdd');
       let columns = await this.helper.findElements(selectedRow, 'tagName', 'td');
       let editKK = await this.helper.findElement(columns[2], 'className', 'scGridFieldOddLink');

       console.log('Edit KK');

       await editKK.click();
       await this.fillKKForm(kepalaKeluarga, user);
       await this.helper.waitUntilElementTextIs('name', 'kode_keluarga', '', 5 * 1000);

       this.helper.click(null, 'id', 'sc_b_upd_b');
    
       console.log('Now editing AK');

       await this.editExistingAK(anggota, 0);
    }

    async editExistingAK(anggota, index): Promise<void> {
        let data = anggota[index];

        await this.searchKK(data.no_kk);
        await this.helper.waitUntilElementIsVisible('id', 'id_div_process_block', 5 * 1000);
        await this.helper.waitUntilElementIsNotVisible('id', 'id_div_process_block', 5 * 1000);

        let dataGridKK = await this.helper.findElement(null, 'id', 'apl_grid_ddk01#?#1');
        let selectedRowKK = await this.helper.findElement(dataGridKK, 'className', 'scGridFieldOdd');
        let columnsKK = await this.helper.findElements(selectedRowKK, 'tagName', 'td');
        let editAK = await this.helper.findElement(columnsKK[1], 'className', 'scGridFieldOddLink');

        console.log('Opening AK grid');

        this.helper.click(columnsKK[1], 'className', 'scGridFieldOddLink');
        
        let dataGridAK = await this.helper.findElements(null, 'id', 'apl_grid_ddk02#?#1');

        if(dataGridAK.length === 0) {
           console.log('Add new AK');
           await this.helper.waitUntilElementLocated('id', 'sc_SC_btn_0_top', 5 * 1000).click();
           await this.helper.waitUntilUrlIs('http://prodeskel.binapemdes.kemendagri.go.id/form_ddk02/index.php', 5 * 1000);
           await this.fillAKForm(data, index + 1, true);         
           await this.helper.click(null, 'id', 'sc_b_ins_b');
           await this.helper.waitUntilElementTextIs('name', 'no_urut', '', 5 * 1000);
        }
        else {
            let rows = await this.helper.findElements(dataGridAK[0], 'css', '.scGridFieldEven,.scGridFieldOdd');
            let found = false;
            let row = null;
            let tdAK = null;
            for(let i=0; i<rows.length; i++) {
                row = rows[i];
                tdAK = await this.helper.findElements(row, 'css', ".scGridFieldEvenFont,.scGridFieldOddFont");
                let noUrutAK = await tdAK[1].getText();

                if(noUrutAK == (index + 1)) {
                    found = true;
                    break;
                    
                }
            }
            if (found){
                let editAKColumns = await this.helper.findElements(tdAK[0], 'tagName',  'td');

                editAKColumns[1].click();

                await this.helper.waitUntilUrlIs('http://prodeskel.binapemdes.kemendagri.go.id/form_ddk02/', 5 * 1000);

                console.log('Current location is in ddk02 form');

                await this.fillAKForm(data, index + 1, true);         
                this.helper.click(null, 'id', 'sc_b_upd_b');
                await this.helper.waitUntilElementIsNotVisible('id', 'id_div_process_block', 5 * 1000);

                console.log('Edit has been done');
            } else {
                console.log('Add new AK');
                await this.helper.waitUntilElementLocated('id', 'sc_SC_btn_0_top', 5 * 1000).click();
                await this.helper.waitUntilUrlIs('http://prodeskel.binapemdes.kemendagri.go.id/form_ddk02/index.php', 5 * 1000);
                await this.fillAKForm(data, index + 1, false);      
                await this.helper.click(null, 'id', 'sc_b_ins_b');
            }
        }
        
        if(index < anggota.length - 1)
           await this.editExistingAK(anggota, index + 1);
    }

    async setupNewKK(kepalaKeluarga, anggota, user): Promise<void> {
        let addButton = await this.helper.waitUntilElementLocated('id', 'sc_SC_btn_0_top', 5 * 1000);
        
        addButton.click();

        console.log('Clicking add new KK button');

        await this.fillKKForm(kepalaKeluarga, user);

        this.helper.click(null, 'id', 'sc_b_ins_b');

        await this.helper.waitUntilElementTextIs('name', 'kode_keluarga', '', 5 * 1000);

        console.log('Now is adding AK');

        await this.addAK(anggota, 0);
    }

    async addAK(anggota, index): Promise<void> {
        let data = anggota[index];

        await this.searchKK(data.no_kk);

        console.log('Adding AK no ' + (index + 1));
        
        await this.helper.waitUntilElementLocated('id', 'id_div_process_block', 5 * 1000);
        await this.helper.waitUntilElementIsVisible('id', 'id_div_process_block', 5 * 1000);
        await this.helper.waitUntilElementIsNotVisible('id', 'id_div_process_block', 5 * 1000);

        this.helper.click(null, 'className', 'scGridFieldOddLink');
      
        console.log('Clicking add new AK');

        await this.helper.waitUntilUrlIs('http://prodeskel.binapemdes.kemendagri.go.id/grid_ddk02/', 5 * 1000);

        this.helper.click(null, 'id', 'sc_SC_btn_0_top');

        await this.helper.waitUntilUrlIs('http://prodeskel.binapemdes.kemendagri.go.id/form_ddk02/index.php', 5 * 1000);
     
        console.log('Current location is in ddk02 form');

        await this.helper.wait(null, this.fillAKForm(data, index + 1, false), 5 * 1000);
        
        this.helper.click(null, 'id', 'sc_b_ins_b');

        await this.helper.waitUntilElementTextIs('name', 'no_urut', '', 5 * 1000);
       
        console.log('New form');

        if(index < anggota.length - 1)
          await this.addAK(anggota, index + 1);
        else
          await this.searchKK(data.no_kk);
    }
    
    async fillKKForm(data, user): Promise<void> {
        await this.helper.waitUntilElementLocated('id', 'id_sc_field_d017', 5 * 1000);

        await this.helper.fillText(null, 'name', 'kode_keluarga', data.no_kk);
        await this.helper.fillText(null,'name', 'namakk', data.nama_penduduk);
        await this.helper.fillText(null,'name', 'alamat',  data.alamat_jalan ? data.alamat_jalan : '');
        await this.helper.fillText(null,'name', 'rt', data.rt ? data.rt : '');
        await this.helper.fillText(null,'name', 'rw', data.rw ? data.rw : '');
        await this.helper.fillText(null,'name','nama_dusun', data.nama_dusun ? data.nama_dusun : '');
        await this.helper.fillText(null,'name', 'd014', user.pengisi);
        await this.helper.fillText(null,'name', 'd015', user.pekerjaan);
        await this.helper.fillText(null,'name', 'd016', user.jabatan);
        await this.helper.fillText(null,'name', 'd017', SUMBER_DATA);

        console.log('Saving new KK');
    }

    async fillAKForm(data, noUrut, reset): Promise<void> {
        if(reset) {
            await this.helper.fillText(null, 'name', 'no_urut', '');
            await this.helper.fillText(null,'name', 'nik', '');
            await this.helper.fillText(null,'name', 'd025', '');
            await this.helper.fillText(null,'name', 'd028', '');
            await this.helper.fillText(null,'name', 'd029', '');
            await this.helper.fillText(null,'name', 'd038', '');
            await this.helper.fillText(null,'name', 'd025a', '');
        }

        await this.helper.fillText(null, 'name', 'no_urut', noUrut);
        await this.helper.fillText(null,'name', 'nik', data.nik);
        await this.helper.fillText(null,'name', 'd025', data.nama_penduduk);
        await this.helper.fillText(null,'name', 'd028', data.tempat_lahir);
        await this.helper.fillText(null,'name', 'd029', data.tanggal_lahir);
        await this.helper.fillText(null,'name', 'd038', data.nama_ayah ? data.nama_ayah : data.nama_ibu ? data.nama_ibu : '');
        await this.helper.fillText(null,'name', 'd025a', data.no_akta ? data.no_akta : '');

        await this.helper.selectRadio(null, 'id', 'idAjaxRadio_d026', data.jenis_kelamin);
        await this.helper.selectRadio(null, 'id','idAjaxRadio_d027', data.hubungan_keluarga);
        await this.helper.selectRadio(null, 'id','idAjaxRadio_d031', data.status_kawin);
        await this.helper.selectRadio(null, 'id','idAjaxRadio_d032', data.agama);
        await this.helper.selectRadio(null, 'id','idAjaxRadio_d036', data.pendidikan);
        await this.helper.selectRadio(null, 'id','idAjaxRadio_d037', data.pekerjaan);
        await this.helper.selectRadio(null, 'id','idAjaxRadio_d040', data.akseptor_kb);

        await this.helper.selectCheckboxes(null, 'id','idAjaxCheckbox_d041', data.cacat_fisik);
        await this.helper.selectCheckboxes(null, 'id','idAjaxCheckbox_d042', data.cacat_mental);
        await this.helper.selectCheckboxes(null, 'id','idAjaxCheckbox_d045', data.wajib_pajak);
        await this.helper.selectCheckboxes(null, 'id','idAjaxCheckbox_d047', data.lembaga_pemerintahan);
        await this.helper.selectCheckboxes(null, 'id','idAjaxCheckbox_d048', data.lembaga_kemasyarakatan);
        await this.helper.selectCheckboxes(null, 'id','idAjaxCheckbox_d049', data.lembaga_ekonomi);

        console.log('Filling AK form has been done!');
    }

    quit(): void {
         this.helper.browser.quit();
    }
}
