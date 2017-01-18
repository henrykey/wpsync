//加载香港模块
const {ipcRenderer, shell} = require('electron');
var _conf ;
ipcRenderer.on('getconf', function (event, conf) {
    _conf = conf;
    $("#user").val(_conf.user);
    $("#localDir").val(_conf.localDir);
    $("#wpaddr").val(_conf.wpaddr);
    $("input[name=synctype][value=" + _conf.synctype + "]").prop("checked", "checked");
    //$("input[name=synctype][value="+conf.synctype+"]").;

    console.log(JSON.stringify(_conf));
});
ipcRenderer.on('saveconf', function (event, message) {
    console.log(message);
});
$(document).ready(function () {
    ipcRenderer.send('getconf', 'getconf...');
});
function saveConfig() {
    alert(1);
   /* 
    _conf.user=$("#user").val();
    _conf.passwd=$("#passwd").val();
    _conf.synctype=$("input[name=synctype]:checked").val();
    _conf.localDir=$("#localDir").val();
    _conf.wpaddr=$("#wpaddr").val();
    */
    ipcRenderer.send('saveconf', _conf);
};
