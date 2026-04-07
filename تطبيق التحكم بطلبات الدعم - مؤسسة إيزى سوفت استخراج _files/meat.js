"use strict";
const documentTitle = 'كشف توزيع اللحوم';

var association_title = '';
var region_title = '';
var village_title = '';

function toDataURL(src, callback, outputFormat) {
    let image = new Image();
    image.crossOrigin = 'Anonymous';
    image.onload = function () {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let dataURL;
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
    };
    image.src = src;
    if (image.complete || image.complete === undefined) {
        image.src = "data:image/gif;base64, R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        image.src = src;
    }
}

function getBase64FromImageUrl(url) {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    };
    img.src = url;
}

// Class definition
var KTDatatablesServerSide = function () {
    // Shared variables
    var table;
    var dt;

    // Private functions
    var initDatatable = function () {
        let region = $('#select-regions').val();
        let village = $('#select-subregions').val();
        let association = $('#select-associations').val();

        association_title = $('#select-associations option:selected').text();
        village_title = $('#select-subregions option:selected').text();
        region_title = $('#select-regions option:selected').text();

        console.log(association_title);

        if ($.fn.dataTable.isDataTable('#meat-datatatable')) {
            dt.destroy();
        }

        var data = {};
        data.region = region;
        data.association = association;

        dt = $("#meat-datatatable").DataTable({
            lengthMenu: [
                [25, 50, 100, -1],
                [25, 50, 100, 'All'],
            ],
            pageLength: 100,
            searchDelay: 500,
            //processing: true,
            //serverSide: true,
            responsive: true,
            select: false,
            order: [[1, 'asc']],
            ajax: {
                url: "/cdapp/Reporting/GetMeatCasesDataJsonAsync",
                "data": {
                    "region": region,
                    "association": association,
                    "village": village
                },
                error: function (xhr, error, thrown) {
                    console.log(xhr);
                    console.log(xhr.responseText);
                    console.log(error);
                    console.log(thrown);
                    alert('You are not logged in');
                }
            },
            language: {
                url: '/assets/js/ar.json'
            },
            columns: [
                { data: 'Code' },
                { data: 'FullName' },
                { data: 'NationalID' },
                { data: 'Region' },
                { data: 'Village' },
                { data: 'Amount' },
                { data: 'Signature' },
            ],
            columnDefs: [
                {
                    targets: 1,
                    render: function (data, type, row) {
                        if (type === 'pdf') {
                            return data.split(' ').reverse().join(' ');
                        }
                        else {
                            return data;
                        }
                    }
                },
                {
                    targets: 2,
                    orderable: false,
                    render: function (data, type, row) {
                        if (type === 'pdf') {
                            return data.split(' ').reverse().join(' ');
                        }
                        else {
                            return data;
                        }
                    }
                },
                {
                    targets: 3,
                    orderable: false,
                    render: function (data, type, row) {
                        if (type === 'pdf') {
                            return data.split(' ').reverse().join(' ');
                        }
                        else {
                            return data;
                        }
                    }
                },
                {
                    targets: 4,
                    orderable: false,
                    render: function (data, type, row) {
                        if (type === 'pdf') {
                            return data.split(' ').reverse().join(' ');
                        }
                        else {
                            return data;
                        }
                    }
                },
                {
                    targets: -1,
                    data: null,
                    orderable: false,
                    className: 'text-end',
                    render: function (data, type, row) {
                        if (type === 'pdf' || type === 'print') {
                            return '';
                        }
                        else {
                            return '';
                        }
                    },
                },
            ],

            // Add data-filter attribute
            //createdRow: function (row, data, dataIndex) {
            //    $(row).find('td:eq(1)').attr('data-filter', data.id);
            //}
        });

        //table = dt.$;
        /*dt.search('').draw();*/
        // Re-init functions on every table re-draw -- more info: https://datatables.net/reference/event/draw
        dt.on('draw', function () {

            //handleDeleteRows();
            KTMenu.createInstances();
            $('[data-bs-toggle="tooltip"]').tooltip();
        });
    }

    var exportButtons = () => {
        console.log('export init');

        var buttons = new $.fn.dataTable.Buttons(dt, {
            buttons: [
                {
                    extend: 'copyHtml5',
                    title: documentTitle
                },
                {
                    extend: 'excelHtml5',
                    title: documentTitle
                },
                {
                    extend: 'csvHtml5',
                    charset: 'utf-8',
                    bom: true,
                    title: documentTitle
                },
                {
                    extend: 'print',
                    charset: 'utf-8',
                    bom: true,
                    title: documentTitle,
                    //For repeating heading.
                    repeatingHead: {
                        logo: 'https://www.google.co.in/logos/doodles/2018/world-cup-2018-day-22-5384495837478912-s.png',
                        logoPosition: 'right',
                        logoStyle: '',
                        title: '<h3>Sample Heading</h3>'
                    },
                    exportOptions: {
                        orthogonal: "print",
                        //columns: [0, 1, 2, 4],
                        alignment: "right",
                        modifier: { order: 'index', page: 'current' },
                        stripHtml: false

                    },
                    customize: function (win) {
                        $(win.document.body).css('direction', 'rtl');

                    },
                },
                {
                    extend: 'pdfHtml5',
                    filename: documentTitle,
                    text: "PDF",
                    pageSize: 'A4',
                    exportOptions: {
                        orthogonal: "pdf",
                        columns: [6, 5, 4, 2, 1, 0],
                        alignment: "right",
                        modifier: { page: 'all', search: 'none', order: 'index' }

                    },
                    customize: function (doc) {
                        alert('hello world!');
                        //Remove the title created by datatTables
                        doc.content.splice(0, 1);

                        // It's important to create enough space at the top for a header !!!
                        doc.pageMargins = [20, 100, 20, 80];

                        doc['footer'] = (function (page, pages) {
                            return {
                                columns: [
                                    'رئيس مجلس الإدارة - الخاتم'.split(' ').reverse().join(' '),
                                    {
                                        alignment: 'right',
                                        text: [
                                            {
                                                text: "تقر الجمعية بصحة البيانات والتوقيعات".split(' ').reverse().join(' ')
                                            },
                                            {
                                                text: " إقرار: \n", bold: true, fontSize: 12
                                            },
                                            {
                                                text: "وأن التسليم تم للحالات الموجودة بالكشف وتحت مسؤوليتها".split(' ').reverse().join(' ') + "\n"
                                            },
                                            {
                                                text: "الرقم القومى يجب أن يكون سارى".split(' ').reverse().join(' ')
                                            },
                                            {
                                                text: "ملحوظة: ", bold: true, fontSize: 12
                                            }
                                        ]
                                    }
                                ],
                                margin: [40, 0]
                            }
                        });

                        doc['header'] = (function (page, pages) {

                            return {
                                columns: [
                                    {
                                        text: [
                                            { text: documentTitle.split(' ').reverse().join(' '), bold: true, fontSize: 16 },
                                            { text: "\n" + association_title.split(' ').reverse().join(' ') + ' الجمعية: ' },
                                            { text: "\n" + region_title.split(' ').reverse().join(' ') + ' المركز: ' },
                                            { text: "\n" + village_title.split(' ').reverse().join(' ') + ' القرية: ' }
                                        ],
                                        alignment: "center",
                                        margin: [-120, 10, 0, 0]
                                    },
                                    {
                                        text: [
                                            { text: 'مؤسسة نهضة بنى سويف'.split(' ').reverse().join(' ') + '\n', bold: true, fontSize: 14 },
                                            { text: 'المشهرة برقم 1079 لسنة 2009'.split(' ').reverse().join(' ') + '\n' },
                                            { text: 'التنمية الشاملة المستدامة'.split(' ').reverse().join(' ') }
                                        ],
                                        alignment: "right",
                                        margin: [0, 10, 20, 0]

                                    }
                                ]
                            }

                        });
                        doc.styles.tableBodyEven.margin = [0, 0, 1, 0];
                        doc.styles.tableBodyOdd.margin = [0, 0, 1, 0];

                        doc.content[0].table.widths = ['15%', '7%', '18%', '16%', '*', '7.5%'];
                        doc.content[0].table.dontBreakRows = true;
                        for (var row = 0; row < doc.content[0].table.headerRows; row++) {
                            var header = doc.content[0].table.body[row];
                            for (var col = 0; col < header.length; col++) {
                                header[col].fillColor = '#4FC9DA';
                                header[col].alignment = 'right';
                                header[col].margin = [0, 0, 3, 0];

                                if (col == 0) {
                                    header[col].text = 'التوقيع';
                                }
                            }
                        };

                        var tblBody = doc.content[0].table.body;

                        [...tblBody].forEach((e) => {


                            if (e[2].text.length > 30) {
                                e[2].fontSize = 6;
                            }
                            else if (e[2].text.length > 15) {
                                e[2].fontSize = 8;
                            }

                            if (e[4].text.length > 40) {
                                e[4].fontSize = 11;
                            }
                            else {
                                e[4].fontSize = 12;
                            }
                            [...e].forEach((c) => {
                                c.alignment = 'right';
                            })
                        })


                        var objLayout = {};
                        objLayout['hLineWidth'] = function (i) { return 1; };
                        objLayout['vLineWidth'] = function (i) { return 1; };
                        objLayout['hLineColor'] = function (i) { return '#000'; };
                        objLayout['vLineColor'] = function (i) { return '#000'; };
                        objLayout['paddingLeft'] = function (i) { return 4; };
                        objLayout['paddingRight'] = function (i) { return 4; };

                        objLayout['fillColor'] = function (row, col, node) { return row > 0 && row % 2 ? 'yellow' : 'white'; };
                        //fillColor: function(row, col, node) { return row > 0 && row % 2 ? 'yellow' : null; }

                        doc.content[0].layout = objLayout;
                    }

                }
            ],
        }).container().appendTo($('#kt_datatable_example_buttons'));

        // Hook dropdown menu click event to datatable export buttons
        const exportButtons = document.querySelectorAll('#kt_datatable_example_export_menu [data-kt-export]');

        exportButtons.forEach(exportButton => {
            //exportButton.addEventListener('click', e => {
            //    e.preventDefault();

            //    // Get clicked export value
            //    const exportValue = e.target.getAttribute('data-kt-export');
            //    const target = document.querySelector('.dt-buttons .buttons-' + exportValue);

            //    // Trigger click event on hidden datatable export buttons
            //    target.click();
            //});
            if (!!exportButton.onclick == false) {
                exportButton.onclick = e => {
                    e.preventDefault();

                    // Get clicked export value
                    const exportValue = e.target.getAttribute('data-kt-export');
                    const target = document.querySelector('.dt-buttons .buttons-' + exportValue);

                    // Trigger click event on hidden datatable export buttons
                    target.click();
                }
            }


        });
    }

    var loadAssociations = (region, subregion) => {
        $.ajax({
            method: 'POST',
            url: 'cdapp/BasicData/RegionAssociationsAsync',
            data: JSON.stringify({ 'region_id': region, 'village_id': subregion }),
            contentType: "application/json",
            dataType: 'json',
            success: (data) => {
                //console.log(data);
                $('#select-associations option:gt(0)').remove();
                [...data].forEach((e) => {
                    $('#select-associations').append($("<option></option>")
                        .attr("value", e.id).text(e.Association));
                })
            }
        });
    }

    var loadSubRegions = (region) => {
        $.ajax({
            method: 'POST',
            url: 'cdapp/BasicData/GetRegions',
            data: JSON.stringify({ 'id': region }),
            contentType: "application/json",
            dataType: 'json',
            success: (data) => {
                //console.log(data);
                $('#select-subregions option:gt(0)').remove();
                [...data].forEach((e) => {
                    $('#select-subregions').append($("<option></option>")
                        .attr("value", e.id).text(e.Region_Name));
                })

                loadAssociations(region, 0);
            }
        });
    }

    var initAssociationsLoader = () => {
        const SubRegionsSelect = document.querySelector('#select-subregions');

        SubRegionsSelect.addEventListener('change', function (e) {
            loadAssociations(document.querySelector('#select-regions').value, e.target.value);
        });
    }

    var initSubRegionsLoader = () => {
        const RegionsSelect = document.querySelector('#select-regions');

        RegionsSelect.addEventListener('change', function (e) {
            loadSubRegions(e.target.value);
        });
    }

    var handleFillDatatable = () => {
        const loadDataButton = document.querySelector('#button-reload');

        loadDataButton.addEventListener('click', (e) => {
            e.preventDefault();

            initDatatable();
            exportButtons();
        });
    }

    // Public methods
    return {
        init: function () {
            //initDatatable();
            initSubRegionsLoader();
            initAssociationsLoader();
            handleFillDatatable();
            initDatatable();
            exportButtons();

        }
    }
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTDatatablesServerSide.init();
});

function GetPDF(url) {
    let region = $("#select-regions").val();
    let village = $("#select-subregions").val();
    let associate = $("#select-associations").val();


    if (region == null || region == 0 || associate == null || associate == 0) {
        Swal.fire({
            title: 'لا يمكن استخراج التقرير',
            html: '<div class="text-danger">لم يتم اختيار الجمعية أو المركز أو القرية!</div>',
            icon: 'error',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'حسناً!'
        });
    }
    else {
        if (village == null)
            village = 0;

        let reportTitle = "كشف توزيع اللحوم";

        reportTitle += `[${$("#select-associations option:selected").text()}]`;
        reportTitle += `[${$("#select-regions option:selected").text()}]`;
        reportTitle += `[${$("#select-subregions option:selected").text()}]`;

        let actionUrl = url + `?region=${region}&association=${associate}&village=${village}&offset=${new Date().getTimezoneOffset()}`;

        swal.fire({
            title: "برجاء الانتظار",
            text: "جارى تجهيز ملف ال PDF",
            allowOutsideClick: () => !Swal.isLoading(),
            allowEscapeKey: () => !Swal.isLoading(),
            didOpen: () => Swal.showLoading()
        });
        $.ajax({
            url: actionUrl,
            method: 'GET',
            xhrFields: {
                responseType: 'blob'
            },
            success: function (data) {
                console.log('x');
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(data);
                a.href = url;
                var div = document.createElement("div");
                div.innerHTML = "لعرض الملف إضغط ";
                div.append(a);
                swal.fire({
                    title: "تم تجهيز الملف بنجاح!",
                    html: "<div>الملف جاهز للتحميل أو للعرض .. ما هو اختيارك ؟</div>",
                    showConfirmButton: true,
                    confirmButtonText: "إحفظ الملف",
                    showCancelButton: true,
                    showDenyButton: true,
                    denyButtonText: "اعرض الملف على المتصفح",
                    cancelButtonText: "إلغاء"
                }).then((result) => {
                    if (result.isConfirmed) {
                        a.download = reportTitle + ".PDF";
                        a.click();
                        swal.fire('تم حفظ الملف بنجاح');
                    }
                    if (result.isDenied) {
                        window.open(url, "_blank");
                        swal.close();
                    }
                }).then(() => {
                    window.URL.revokeObjectURL(url);
                })
            },
            error: (a, b, c) => {
                console.log(a);
                console.log(b);
                console.log(c);

                swal.fire({
                    title: "حدث خطأ ما",
                    text: "خطأ",
                    icon: "ERROR"
                })
            }
        });

        //window.open(actionUrl, '_blank');
    }
}