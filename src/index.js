//加载香港模块
const {ipcRenderer, shell} = require('electron')
//注册鼠标单击事件
document.addEventListener('click', (event) => {
  if (event.target.href) {
    // Open links in external browser
    shell.openExternal(event.target.href)
    event.preventDefault();
  } else if (event.target.classList.contains('js-setting')) {
    ipcRenderer.send('goto-settings', 'opening setting window...');  
  } else if (event.target.classList.contains('js-quit')) {
    ipcRenderer.send('quit');  
    window.close();
  }
})

//文件变更处理
const getFileChangeInfo = () => {
  ipcRenderer.on('file-change-notify', function(event, arg) {
    document.querySelector('.js-syncinfo').textContent = arg;
  });

}
//获取版本信息处理
const verInfo = () => {
  document.querySelector('.js-version').textContent = 'V0.1.0-Alpha';
}
//获取用户信息处理
function getUserInfo() {
  ipcRenderer.on('userinfo', function(event, arg) {
    document.querySelector('.js-userinfo').textContent = arg;
    document.querySelector('.js-logoninfo').textContent = '已连接';
    document.querySelector('.logonicon').className = 'logonicon icon icon-check';
    console.log(arg);
  });
  ipcRenderer.send('userinfo', 'asking userinfo...');
}
//处理点击设置按钮事件
const jwpsetting = () => {
  ipcRenderer.send('goto-settings', 'opening setting window...');  
}

//执行事件处理程序
verInfo();//获取版本信息
getUserInfo();//获取用户信息
getFileChangeInfo();//文件变更处理