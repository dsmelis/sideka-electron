import * as renderers from './renderers';
export default [
    {
        header: 'Id',
        field: 'id', 
        width: 0,
        type: 'text'
    },
    {
        header: 'Kd Bid',
        field: 'Kd_Bid', 
        type: 'text',
        width: 100,
    },
    {
        header: 'Nama Bidang',
        field: 'Nama_Bidang', 
        type: 'text',
        width: 300,
    },
    {
        header: 'Kd Keg',
        field: 'Kd_Keg', 
        type: 'text',
        width: 100,
    },
    {
        header: 'Lokasi',
        field: 'Lokasi_Spesifik', 
        type: 'text',
        width: 200,
    },
    {
        header: 'Volume',
        field: 'Volume', 
        type:'text',
        width: 100,
        
    },
    {
        header: 'Satuan',
        field: 'Satuan', 
        type: 'text',
        width: 100,
    },
    {
        header: 'Jml.Sas-Pria',
        field: 'Jml_Sas_Pria', 
        type: 'text',
        width: 130,
    },
    {
        header: 'Jml.Sas-Wanita',
        field: 'Jml_Sas_Pria', 
        type: 'text',
        width: 130,
    },    
    {
        header: 'Jml.Sas Rm-Tangga',
        field: 'Jml_Sas_ARTM', 
        type: 'text',
        width: 130,
    },
    {
        header: 'Sumberdana',
        field: 'Kd_Sumber', 
        type: 'text',
        width: 100,
    },
    {
        header: 'Waktu',
        field: 'Waktu', 
        type: 'text',
        width: 200,
    },
    {
        header: 'Mulai',
        field: 'Mulai', 
        type: 'text',
        width: 200,
    },
    {
        header: 'Selesai',
        field: 'Selesai', 
        type: 'text',
        width: 200,
    },
    {
        header: 'Biaya',
        field:'Biaya',
        type: 'numeric',
        width: 220,
        format: '0,0',
    },    
    {
        header: 'Pola_Kegiatan',
        field: 'Pola_Kegiatan', 
        type: 'text',
        width: 100,
    },  
    {
        header: 'Pelaksana',
        field: 'Pelaksana',
        type: 'text',
        width: 200,
    }
]
