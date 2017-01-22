//加载香港模块
const {ipcRenderer, shell} = require('electron');
//注册鼠标单击事件
document.addEventListener('click', (event) => {
  if (event.target.href) {
    // Open links in external browser
    shell.openExternal(event.target.href)
    event.preventDefault();
  } else if (event.target.classList.contains('js-setting')) {
    ipcRenderer.send('goto-settings', 'opening setting window...');
  } else if (event.target.classList.contains('js-quit')) {
    ipcRenderer.send('quit', 'quit');
    window.close();
  } else if (event.target.classList.contains('openfolder')) {
    ipcRenderer.send('openfolder');
  } else if (event.target.classList.contains('opencloud')) {
    ipcRenderer.send('opencloud');
  }
})

//文件变更处理
const getFileChangeInfo = () => {
  ipcRenderer.on('file-change-notify', function (event, arg) {
    document.querySelector('.js-syncinfo').textContent = arg;
  });

}
//获取版本信息处理
const verInfo = () => {
  document.querySelector('.js-version').textContent = '0.6.1-alpha';
}
//获取用户信息处理
function getUserInfo() {
  ipcRenderer.on('userinfo', function (event, userinfo) {
    if (userinfo != null) {
      document.querySelector('.js-userinfo').textContent = userinfo.username + "  " + userinfo.deptname + "";
      document.querySelector('.js-logoninfo').textContent = '已连接';
      document.querySelector('.logonicon').className = 'logonicon icon icon-check jkcheck';
      document.querySelector('.js-spaceused').innerHTML = "已使用:" + userinfo.usedspace + " 共" + userinfo.totalspace;
    } else {
      document.querySelector('.js-userinfo').textContent = "登录失败";
      document.querySelector('.js-logoninfo').textContent = '未连接';
      document.querySelector('.logonicon').className = 'logonicon icon icon-cancel jkcancel';
      document.querySelector('.js-spaceused').innerHTML = "&nbsp;";
    }

  });
  ipcRenderer.send('userinfo', 'asking userinfo...');
}
//处理点击设置按钮事件
const jwpsetting = () => {
  ipcRenderer.send('goto-settings', 'opening setting window...');
}

ipcRenderer.on('setsyncfinished', function (event, syncfinished) {
  console.log("index setsyncfinished:" + syncfinished);
  if (syncfinished) {

    document.querySelector('.js-syncinfo').innerHTML = '同步完成';

  } else {
    document.querySelector('.js-syncinfo').innerHTML = "同步中...";
  }

});

//执行事件处理程序
verInfo();//获取版本信息
getUserInfo();//获取用户信息
getFileChangeInfo();//文件变更处理
document.onkeydown = function(e) {
        var keyCode = e.keyCode || e.which || e.charCode;
        var ctrlKey = e.ctrlKey || e.metaKey;
        var altKey = e.altKey;
        var shiftKey = e.shiftKey;
        if(shiftKey && altKey && ctrlKey && keyCode == 74) {
            alert('版权信息');
        }
        e.preventDefault();
        return false;
}
