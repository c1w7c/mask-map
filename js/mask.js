// initialize the map on the "map" div with a given center and zoom
var mymap = L.map('mapid', {
    center: [24.789452, 120.9249699],
    zoom: 14
});
//加上圖磚資訊
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);


//icon 改顏色
let goldenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// 取得json資料
let data = '';
let xml = new XMLHttpRequest();
xml.open("get", "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
// xml.setRequestHeader('content-type','application/json');
xml.send(null);

xml.onload = function () {
    data = JSON.parse(xml.responseText);
    data = data.features;

    //markerCluster
    let markers = L.markerClusterGroup();
    for (let i = 0; i < data.length; i++) {
        markers.addLayer(L.marker([data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]])
            .bindPopup(
                `<div class="card" style="font-size:16px;">
                    <div class="card-body">
                        <div class="card-title font-weight-bolder pharmacy-name">
                        ${data[i].properties.name}
                        </div>
                        <div class='card-text'>
                            <span class="pharmacy-address">${data[i].properties.address}</span><br>
                            <span class="pharmacy-tel">${data[i].properties.phone}</span><br>
                            <span class="pharmacy-open">${data[i].properties.note}</span><br>
                            <span class='badge badge-info mask maskadult'><span class='mr-auto'>成人</span>
                            ${data[i].properties.mask_adult}</span>
                            <span class='badge badge-warning mask maskchild'><span class='mr-auto'>兒童</span>
                            ${data[i].properties.mask_child}</span>
                        </div>
                    </div>
                </div>`
            ));
    }
    mymap.addLayer(markers);
}


//網頁menu操作

//星期
let day = document.querySelector('.day');
//日期
let date = document.querySelector('.date');
//身分證
let id = document.querySelector('.ID');
//身分證末碼
let idNo = document.querySelector('.ID-No');
let today = new Date();
day.innerHTML = getTodayDay(today);
date.innerHTML = getTodayDate(today);

idNo.innerHTML = getIDNo(today);

//轉成中文星期
function getTodayDay(day) {
    switch (day.getDay()) {
        case 0:
            return '星期天';
        case 1:
            return '星期一';
        case 2:
            return '星期二';
        case 3:
            return '星期三';
        case 4:
            return '星期四';
        case 5:
            return '星期五';
        case 6:
            return '星期六';
    }
}

//今天日期
function getTodayDate(date) {
    return date.getFullYear() + '/' + (date.getMonth()) + 1 + '/' + date.getDate();
}

function getIDNo(day) {
    if ((day.getDay()) % 2 == 1) {
        return '1,3,5,7,9';
    } else if (day.getDay() % 2 == 0 && day.getDay() != 0) {
        return '0,2,4,6,8';
    } else {
        return '都';
    }
}

let parser, xmlDoc;
//取得dom結果
let domResult = [];
// console.log(mymap.distance([24.8058049,120.9130114],[24.8017301,120.9188469]));
mymap.addEventListener('popupopen', function (ev) {
    console.log(ev);
    shortDistance.length=0;
    mymap.setView([ev.popup._latlng.lat, ev.popup._latlng.lng], ev.target._animateToZoom);
    // console.log(ev.popup._content);
    // parser = new DOMParser();
    // xmlDoc = parser.parseFromString(ev.popup._content, "text/xml");
    //分解並賦予dom
    // getDom(xmlDoc);

    setMenuCard(ev);

});

/* 
function getDom(xmlDoc) {
    document.querySelector('.pharmacy-name').textContent =
        xmlDoc.querySelector('.pharmacy-name').textContent;
    document.querySelector('.pharmacy-address').textContent =
        xmlDoc.querySelector('.pharmacy-address').textContent;
    document.querySelector('.pharmacy-tel').textContent =
        xmlDoc.querySelector('.pharmacy-tel').textContent;
    document.querySelector('.pharmacy-open').textContent =
        xmlDoc.querySelector('.pharmacy-open').textContent;
    document.querySelector('.maskadult').textContent =
        xmlDoc.querySelector('.maskadult').textContent;
    document.querySelector('.maskchild').textContent =
        xmlDoc.querySelector('.maskchild').textContent
}
*/

let shortDistance = [];
function setMenuCard(e) {
    for (let i = 0; i < data.length; i++) {
        let shortDistanceObj = {};
        shortDistanceObj.name = data[i].properties.name;
        shortDistanceObj.phone = data[i].properties.phone;
        shortDistanceObj.address = data[i].properties.address;
        shortDistanceObj.open = data[i].properties.note;
        shortDistanceObj.maskadult = data[i].properties.mask_adult;
        shortDistanceObj.maskchild = data[i].properties.mask_child;
        shortDistanceObj.distance = mymap.distance([e.popup._latlng.lat, e.popup._latlng.lng],
            [data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]]);
        shortDistance.push(shortDistanceObj);
    }
    shortDistance.sort(function(obj1,obj2){
        return obj1.distance - obj2.distance;
    })
    searchFST();
    console.log(shortDistance);
}

//找出前三小的值
function searchFST(){
    for(let i=1;i<4;i++){
        document.querySelector('.pharmacy'+i+' .pharmacy-name').
        textContent = shortDistance[i].name;
        document.querySelector('.pharmacy'+i+' .pharmacy-address').
        textContent = shortDistance[i].address;
        document.querySelector('.pharmacy'+i+' .pharmacy-tel').
        textContent = shortDistance[i].phone;
        document.querySelector('.pharmacy'+i+' .pharmacy-open').
        textContent = shortDistance[i].open;
        document.querySelector('.pharmacy'+i+' .maskadult').
        innerHTML = "<span class='mr-auto'>成人</span>"+shortDistance[i].maskadult;
        document.querySelector('.pharmacy'+i+' .maskchild').
        innerHTML = "<span class='mr-auto'>兒童</span>"+shortDistance[i].maskchild;
    }
}
//    


//加上標示地點
// L.marker([24.789452,120.9249699],{icon:goldenIcon}).addTo(mymap);