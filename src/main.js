'use strict'
//加载应用模块
const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const app = electron.app
const globalShortcut = electron.globalShortcut
const path = require('path');
const menubar = require('menubar')
const Menu = electron.Menu
const ipcMain = electron.ipcMain
const ipcRender = electron.ipcRenderer;
//加载同步模块
var sync = require('./components/sync');
//设置同步完成后的回调事件
sync.setFinishEvent('setsyncfinished');
//加载wp服务模块
var wpservice = require('./components/wpservice');
//加载文件变的监控模块
var fileAlert = require('./components/jpwnotify');
//初始化，这里读取配置文件的相关信息
//LoadUserInfo()
let autoLaunch = true
let iconSetting = 'auto'

var fileChangeInfo = '已同步!';//显示文件状态信息
var userInfo = null;//显示的用户信息
var settingWin = null;//设置窗口Instance
var syncfinished = true;
var connectInfo = null; //连接信息
var fs = require('fs');
var os = require('os');




// Quit when all windows are closed.
app.on('window-all-closed', function () { //程序退出事件
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', function () {//程序即将退出事件
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})


let mb = menubar({//创建托盘窗体
  index: path.join('file://', __dirname, 'index.html'),
  icon: path.join(__dirname, '../img/icons/IconTemplate.png'),
  width: 300,
  height: 190,
  resizable: false,
  transparent: true,
  showDockIcon: false,
  preloadWindow: true,
  webPreferences: {
    // Prevents renderer process code from not running when window is
    // hidden
    backgroundThrottling: false
  }
})

mb.on('ready', function ready() {//程序就绪事件，主要操作在此完成
  //autoUpdater()

  // ToDo: Not working anymore with electron 1.4
  // mb.window.openDevTools();

  //Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  // Register a shortcut listener. 注册快捷键
  const ret = globalShortcut.register('CommandOrControl+Shift+W', function () {
    if (mb.window.isVisible()) {
      mb.window.hide();
    } else {
      mb.window.show();
    }
  });
  if (!ret) {//注册失败
    console.log('registration failed')
  }




  //显示窗体
  mb.showWindow();
  //打开调试工具
  //mb.window.webContents.openDevTools();

  //注册处理事件的回调函数
  mb.window.on('focus', () => {//获得焦点
    mb.window.transparent = true;
    console.log('get focus...');
  })

  ipcMain.on('quit', (event, arg) => {//自定义按退出键
    app.quit();
    console.log(arg);
  });


  ipcMain.on('goto-settings', function (event, arg) {//自定义按设置按钮
    if (settingWin == null) {
      settingWin = new BrowserWindow({//创建设置窗体
        //    index: path.join('file://', __dirname, 'settings.html'),
        width: 350,
        height: 410,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        parent: this.window,
        transparent: false
      });
      console.log(arg);
      settingWin.loadURL(`file://${path.join(__dirname, 'settings.html')}`);//加载设置页面
    }
    settingWin.show();//显示设置窗口
  });

  ipcMain.on('closeconf', function (event, arg) { //关闭/销毁设置页面
    if (settingWin != null) {
      settingWin.close();
      settingWin = null;
    }
    console.log("destroy settingWin");
    //event.sender.send('userinfo', userInfo);//将信息发送至窗体
  });

  ipcMain.on('setsyncfinished', function (arg) { //设置同步完成状态
    syncfinished = arg;
    var _conf = getconf();
    //同步完成，启动文件监控
    if (syncfinished) {

      ipcMain.emit("setFileAlert", _conf.localDir + "/" + _conf.user + "/MyFiles");

    }
    mb.window.webContents.send('setsyncfinished', arg);
    console.log("set syncfinished:" + arg);
  });

  ipcMain.on('userinfo', function (event, arg) { //自定义获取用户信息
    var _conf = getconf();
    console.log(arg);
    //尝试登陆
    var strs = _conf.wpaddr.split(":");
    var host = _conf.wpaddr;
    var port = 80;
    if (strs.length == 2) {
      host = strs[0];
      port = strs[1];
    }
    var opt = {
      'host': host,
      'port': port,
      'user': _conf.user,
      'passwd': _conf.passwd
    };

    //test login

    wpservice.login(opt, function (data, cbdata) {
      userInfo = null;
      //登录失败
      if (data == null || data.status < 0) {

      }
      //登录成功
      else {
        userInfo = data;
      }
      event.sender.send('userinfo', userInfo);//将信息发送至窗体
    });

  });
  ipcMain.on('refreshuserinfo', function (event) { //刷新登录用户信息
    var _conf = getconf();
    //登陆
    var strs = _conf.wpaddr.split(":");
    var host = _conf.wpaddr;
    var port = 80;
    if (strs.length == 2) {
      host = strs[0];
      port = strs[1];
    }
    var opt = {
      'host': host,
      'port': port,
      'user': _conf.user,
      'passwd': _conf.passwd
    };

    //test login
    wpservice.login(opt, function (data, cbdata) {
      userInfo = null;
      //登录失败
      if (data == null || data.status < 0) {

      }
      //登录成功
      else {
        userInfo = data;
      }
      mb.window.webContents.send('userinfo', userInfo);
    });

  });
  ipcMain.on('logoninfo', function (event, arg) {//自定义连接信息
    connectInfo = '已连接 '
    console.log(arg);
    event.sender.send('userinfo', connectInfo);//发送连接信息至窗体
  });

  ipcMain.on('getconf', function (event, arg) { //读取config信息
    //console.log(__dirname + '/config.json');
    //var conf = require(__dirname + '/config');
    var conf = getconf();
    //console.log(conf);
    //默认同步目录
    if (conf.localDir == null || conf.localDir == "") {
      conf.localDir = os.homedir() + '/jwp';
    }
    //默认同步模式
    if (conf.synctype == null || conf.synctype == "") {
      conf.synctype = "1";
    }

    event.sender.send('getconf', conf);//将信息发送至窗体
  });

  ipcMain.on('saveconf', function (event, conf) { //保存config信息       
    var _conf = getconf();
    //密码未改变
    if (_conf.passwd != null && _conf.passwd != "" && (conf.passwd == null || conf.passwd == "")) {
      conf.passwd = _conf.passwd;
    }
    console.log("save conf to :" + __dirname + "/config.json");

    writeconf(conf);

    //同步目录改变
    if (_conf.localDir != conf.localDir) {
      //初始化同步目录
      initSync(conf);
    }
    else if (!fs.existsSync(conf.localDir + "/" + conf.user)) {
      //初始化同步目录
      initSync(conf);
    }

    //将配置信息写入到同步目录的setting下
    saveSyncConf(conf);

    event.sender.send('saveconf', "save conf ok");//将信息发送至窗体
    //close settingsWin
    ipcMain.emit("closeconf");

    //刷新登录信息
    ipcMain.emit("refreshuserinfo");
    //setInterval(callSync, 1000);//设置定时器，3分钟

  });

  setInterval(callSync, 1 * 60 * 1000);//设置定时器，3分钟

  ipcMain.on('setFileAlert', function (notifypath) { //开始文件监控  
    console.log("set FileAlert.");

    if (fs.existsSync(notifypath)) {
      fileAlert.stop();
      fileAlert.clearFolders();
      //遍历子目录
      var filelist = require('./components/getAllFolder').getAllFiles(notifypath, false);

      //加入需监控的目录
      filelist.forEach(function (file) {
        //console.log(file);
        fileAlert.addFolder(file);
      });

      //注册回调函数
      fileAlert.setNotify(function (file, event, path) {
        var msg = file + ' ' + event + ' in ' + path; //测试信息
        fileChangeInfo = '有文件被改变！'; //更新文件状态信息
        //将文件路径中的"\"替换为"/"
        path = path.replace(/\\/g, "/");

        //调用同步程序
        callSync(path);
        mb.window.webContents.send('file-change-notify', fileChangeInfo);//发送文件状态信息至窗体
      });
      fileAlert.start();
    }
  });
});



//调用同步模块函数
function callSync(filepath) {
  var conf = getconf();
  var error = 0;
  var message = "";
  if (conf.user == null || conf.user == "" || conf.passwd == null || conf.passwd == "") {
    message = "user or passwd not set.";
    error = -1;
  } else if (conf.wpaddr == null || conf.wpaddr == "") {
    message = "wpaddr not set.";
    error = -2;
  } else if (conf.localDir == null || conf.localDir == "") {
    message = "localDir not set.";
    error = -3;
  } else {
    //检查同步目录是否存在

    if (!fs.existsSync(conf.localDir)) {
      message = "localDir:" + conf.localDir + " is not exists";
      error = -4;
    } else {
      //尝试登陆

      var strs = conf.wpaddr.split(":");
      var host = conf.wpaddr;
      var port = 80;
      if (strs.length == 2) {
        host = strs[0];
        port = strs[1];
      }
      var opt = {
        'host': host,
        'port': port,
        'user': conf.user,
        'passwd': conf.passwd

      };

      //test login
      wpservice.login(opt, function (data, cbdata) {
        if (data == null || data.status < 0) {
          console.log("call sync fail: login auth fail");
        }
        //登录成功，准备启动同步
        else {

          if (syncfinished) {
            startSync(filepath);
          }
        }
      });
    }
    if (error < 0) {
      console.log("call sync fail:" + message);
    }

  }
}
//获取配置信息
function getconf() {
  
  return JSON.parse(fs.readFileSync(os.homedir + '/jwpconfig.json', 'utf-8'));
}
function writeconf(conf) {
  
  //写入配置信息
  fs.writeFileSync(os.homedir + "/jwpconfig.json", JSON.stringify(conf));
}
//保存同步程序的配置信息
function saveSyncConf(conf) {

  var cliConf = {};
  var homedir = conf.localDir + "/" + conf.user;
  var strs = conf.wpaddr.split(":");
  var host = conf.wpaddr;
  var port = 80;
  if (strs.length == 2) {
    host = strs[0];
    port = strs[1];
  }
  cliConf["url"] = host;
  cliConf["port"] = port;
  cliConf["un"] = conf.user;
  cliConf["pw"] = conf.passwd;
  cliConf["mystrategy"] = conf.synctype;
  cliConf["teamstrategy"] = conf.synctype;
  cliConf["interval"] = "10";
  fs.writeFileSync(homedir + '/.setting/config.json', JSON.stringify(cliConf));
}
//初始化同步程序目录
function initSync(conf) {

  var homedir = conf.localDir;
  var mydata = {};
  var teamdata = {};
  if (!fs.existsSync(conf.localDir)) {
    fs.mkdirSync(conf.localDir);
  }
  if (!fs.existsSync(conf.localDir + "/" + conf.user)) {
    fs.mkdirSync(conf.localDir + "/" + conf.user);
  }
  homedir = conf.localDir + "/" + conf.user;
  if (!fs.existsSync(homedir + '/MyFiles')) {
    fs.mkdirSync(homedir + '/MyFiles');
  }
  if (!fs.existsSync(homedir + '/TeamFiles')) {
    fs.mkdirSync(homedir + '/TeamFiles');
  }
  if (!fs.existsSync(homedir + '/.setting')) {
    fs.mkdirSync(homedir + '/.setting');
  }
  if (!fs.existsSync(homedir + '/.setting/log')) {
    fs.mkdirSync(homedir + '/.setting/log');
  }
  //保存conf信息
  saveSyncConf(conf);
  if (!fs.existsSync(homedir + '/.setting/mydata.json')) {
    fs.writeFileSync(homedir + '/.setting/mydata.json', JSON.stringify(mydata));
  }
  if (!fs.existsSync(homedir + '/.setting/teamdata.json')) {
    fs.writeFileSync(homedir + '/.setting/teamdata.json', JSON.stringify(teamdata));
  }
}

//启动同步程序
function startSync(filepath) {
  //同步过程中停止文件监控
  fileAlert.stop();
  //设置同步状态
  ipcMain.emit("setsyncfinished", false);
  console.log("start sync... ");
  sync.syncmy(filepath);
}