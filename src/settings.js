//加载香港模块
const {ipcRenderer, shell} = require('electron');
var _conf;

//获取版本信息处理
const verInfo = () => {

    ipcRenderer.on('setversion', function (event, version) {
        document.querySelector('.js-about-version').textContent = "版本:" + version;
    });
    ipcRenderer.send('getversion', 'setversion');

}

//注册鼠标单击事件
document.addEventListener('click', (event) => {
    if (event.target.href) {
        // Open links in external browser
        shell.openExternal(event.target.href)
        event.preventDefault();
    } else if (event.target.classList.contains('js-cancel')) {//关闭settings
        closewin();
    } else if (event.target.classList.contains('js-save')) {//保存配置信息
        saveconfig();
    } else if (event.target.classList.contains('js-about-label')) {//click about
        //document.querySelector('.js-about-version').textContent = '版本:0.9.1-alpha';
        document.querySelector('.js-about-label').className = 'js-about-label tab-item active tgroup-label';
        document.querySelector('.js-settings-label').className = 'js-settings-label tab-item tgroup-label';
        document.querySelector('.js-settings-form').className = 'tgroup-setting information jknoshow js-settings-form';
        document.querySelector('.js-about-form').className = 'tgroup-about-show js-about-form';
    } else if (event.target.classList.contains('js-settings-label')) {//click setting
        document.querySelector('.js-about-label').className = 'js-about-label tab-item tgroup-label';
        document.querySelector('.js-settings-label').className = 'js-settings-label tab-item active tgroup-label';
        document.querySelector('.js-settings-form').className = 'tgroup-setting information js-settings-form';
        document.querySelector('.js-about-form').className = 'tgroup-about js-about-form';
    }

})


ipcRenderer.on('getconf', function (event, conf) {
    _conf = conf;
    $("#user").val(_conf.user);
    $("#passwd").val(_conf.passwd);
    $("#localDir").val(_conf.localDir);
    $("#wpaddr").val(_conf.host != null && _conf.host != "" ? (_conf.host + (_conf.port != null && _conf.port != "" && _conf.port != "80" ? (":" + _conf.port) : "")) : "");
    $("input[name=synctype][value=" + _conf.synctype + "]").prop("checked", "checked");
    //$("input[name=synctype][value="+conf.synctype+"]").;

    //console.log(JSON.stringify(_conf));
});
ipcRenderer.on('saveconf', function (event, message) {
    console.log(message);
});
ipcRenderer.on('alertmessage', function (event, message) {
    alert(message + "");
});

verInfo();
$(document).ready(function () {

    ipcRenderer.send('getconf', 'getconf...');
});
function saveconfig() {
    try {
        _conf.user = $("#user").val();
        _conf.passwd = $("#passwd").val();
        _conf.synctype = $("input[name=synctype]:checked").val();
        _conf.localDir = $("#localDir").val();
        var wpaddr = $("#wpaddr").val();
        wpaddr = wpaddr.trim();
        var upcase = wpaddr.toLowerCase();
        if (upcase.indexOf("http://") == 0) {
            wpaddr = wpaddr.substring(7, wpaddr.length);
        } else if (upcase.indexOf("https://") == 0) {
            wpaddr = wpaddr.substring(8, wpaddr.length);
        }
        var idx = wpaddr.indexOf("/");
        wpaddr = wpaddr.substring(0, idx != -1 ? idx : wpaddr.length);
        _conf.host = wpaddr;
        _conf.port = 80;
        if (wpaddr != null) {
            var strs = wpaddr.split(":");
            if (strs.length == 2) {
                _conf.host = strs[0];
                _conf.port = strs[1];
            }
        }
        ipcRenderer.send('saveconf', _conf);
    } catch (e) {
        ipcRenderer.emit('alertmessage','智汇仓网址:'+$("#wpaddr").val()+' 为无效地址。');
    }
};
function closewin() {
    ipcRenderer.send('closeconf');
}
