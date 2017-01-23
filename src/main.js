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
const moment = require("moment");
//加载同步模块
var sync = require('./components/sync');
//设置同步完成后的回调事件
//sync.setteamFinishEvent('setsyncteamfinished');
//加载wp服务模块
var wpservice = require('./components/wpservice');
//加载文件变的监控模块
var teamFileAlert = require('./components/jpwnotify');
//初始化，这里读取配置文件的相关信息
//LoadUserInfo()
let autoLaunch = true
let iconSetting = 'auto'

var fileChangeInfo = '已同步!';//显示文件状态信息
var userInfo = null;//显示的用户信息
var settingWin = null;//设置窗口Instance
var connectInfo = null; //连接信息
var fs = require('fs');
var os = require('os');

var defaultSyncFolder = "jwp";//默认同步目录名称
var defaultJWPFolder = ".jwp";//默认jwp系统文件夹名称
var disconnect = false;//停止链接
var jwpversion = "";
var Tray = electron.Tray

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
  icon: path.join(__dirname, '../img/jwp/icon.iconset/icon_32x32.png'),
  width: 280,
  height: 170,
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

  //读取version
  readversion();

  //显示窗体
  mb.showWindow();

  //开始同步
  ipcMain.emit("callSync");
  
  //打开调试工具
  //mb.window.webContents.openDevTools();

  //设置监控目录
  
  //注册处理事件的回调函数
  mb.window.on('focus', () => {//获得焦点
    mb.window.transparent = true;
    ipcMain.emit("log", "get focus...");
  })

  ipcMain.on('openfolder', (event) => {//自定义按退出键
    //alert('openfolder');
    var _conf = getconf();
    //console.log('openfolder');
    electron.shell.openItem(_conf.localDir + "/" + defaultSyncFolder);
  });
  ipcMain.on('opencloud', (event) => {//自定义按退出键
    var _conf = getconf();
    electron.shell.openExternal('http://' + _conf.host + ':' + _conf.port + "/wp/synclogin?user=" + _conf.user + "&passwd=" + _conf.passwd + "&authtime=" + new Date().getTime());
    //alert('opencloud');
    //console.log('opencloud ' + _conf.host);
  });

  ipcMain.on('quit', (event, arg) => {//自定义按退出键
    app.quit();
    ipcMain.emit("log", arg);
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
      ipcMain.emit("log", arg);
      settingWin.loadURL(`file://${path.join(__dirname, 'settings.html')}`);//加载设置页面
    }
    settingWin.show();//显示设置窗口
  });

  ipcMain.on('closeconf', function (event, arg) { //关闭/销毁设置页面

    if (settingWin != null) {
      settingWin.close();
      settingWin = null;
    }
    ipcMain.emit("log", "destroy settingWin");
    //event.sender.send('userinfo', userInfo);//将信息发送至窗体
  });



  ipcMain.on('userinfo', function (event, arg) { //自定义获取用户信息
    //停止连接
    if (disconnect)
      return;
    var _conf = getconf();
    ipcMain.emit("log", arg);
    //尝试登陆
    var opt = {
      'host': _conf.host,
      'port': _conf.port,
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
    //停止连接
    if (disconnect) {
      mb.window.webContents.send('userinfo', null);
      return;
    }

    var _conf = getconf();
    //登陆   
    var opt = {
      'host': _conf.host,
      'port': _conf.port,
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
      ipcMain.emit("setmenubaricon");
      mb.window.webContents.send('userinfo', userInfo);
    });

  });
  ipcMain.on('logoninfo', function (event, arg) {//自定义连接信息
    connectInfo = '已连接 '
    ipcMain.emit("log", arg);
    event.sender.send('userinfo', connectInfo);//发送连接信息至窗体
  });

  ipcMain.on('getconf', function (event, arg) { //读取config信息
    var conf = getconf();
    //默认同步目录
    if (conf.localDir == null || conf.localDir == "") {
      conf.localDir = os.homedir();
    }
    //默认同步模式
    if (conf.synctype == null || conf.synctype == "") {
      conf.synctype = "1";
    }
    event.sender.send('getconf', conf);//将信息发送至窗体
  });

  ipcMain.on('saveconf', function (event, conf) { //保存config信息  
    //检查目录是否存在
    if (!fs.existsSync(conf.localDir)) {
      event.sender.send('alertmessage', "目录:" + conf.localDir + "不存在，请选择其他目录。");//将信息发送至窗体
      return;
    }
    var _conf = getconf();
    //密码未改变
    if (_conf.passwd != null && _conf.passwd != "" && (conf.passwd == null || conf.passwd == "")) {
      conf.passwd = _conf.passwd;
    } else {
      //将密码加密
      conf.passwd = Encrypt(conf.passwd);
    }
    //console.log("save conf to :" + __dirname + "/../../config.json");

    writeconf(conf);

    //同步目录改变
    if (_conf.localDir != conf.localDir) {
      //初始化同步目录
      initSyncFolder(conf, true);
    }
    else if (!fs.existsSync(conf.localDir + "/" + defaultSyncFolder)) {
      //初始化同步目录
      initSyncFolder(conf, true);
    }

    ipcMain.emit("callSync");//保存配置文件后，马上进行同步

    event.sender.send('saveconf', "save conf ok");//将信息发送至窗体
    //close settingsWin
    ipcMain.emit("closeconf");

    //刷新登录信息
    ipcMain.emit("refreshuserinfo");
    //setInterval(callSync, 1000);//设置定时器，3分钟

  });
  ipcMain.on('connecterr', function (event, err) { //连接服务器失败
    ipcMain.emit("log", "connect error:" + err);
    ipcMain.emit("refreshuserinfo");//断开用户连接    
  });
  ipcMain.on('log', function (message) { //打印log
    console.log(moment().format("YYYY-MM-DD HH:mm:ss.SSS") + " " + message);
  });
  ipcMain.on('setdisconnect', function (event, arg) { //断开连接
    
    var call = false;
    //重新连接时调用同步
    if(disconnect&&!arg){
      call = true;
      
    }
    
    disconnect = arg;
    if(call){
      ipcMain.emit("callSync");
    }
    ipcMain.emit("log", "disconnect:" + disconnect);
    ipcMain.emit("refreshuserinfo");
    ipcMain.emit("setmenubaricon");
  });
  ipcMain.on('getversion', function (event, callback) { //获取版本
    event.sender.send(callback, jwpversion);//将信息发送至窗体
  });
  ipcMain.on('callSync', function (event, filepath) { //同步
    //停止连接
    if (disconnect)
      return;
    var conf = getconf();
    var ret = syncBefore(conf);
    if (ret.error < 0) {
      ipcMain.emit("log", "call sync fail:" + ret.message);
    } else {
      //尝试登陆
      var opt = {
        'host': conf.host,
        'port': conf.port,
        'user': conf.user,
        'passwd': conf.passwd
      };
      //test login
      wpservice.login(opt, function (data, cbdata) {
        if (data == null || data.status < 0) {
          ipcMain.emit("log", "call syncmy fail: login auth fail");
          ipcMain.emit("refreshuserinfo");
        }
        //登录成功，准备启动同步
        else {
          try {
            startSync(filepath, conf);
          } catch (e) {
            ipcMain.emit("log", e);
            ipcMain.emit("refreshuserinfo");
            ipcMain.emit("setmenubaricon");
            ipcMain.emit("setsyncmyfinished", true);
          }
        }
      });
    }
  });

  ipcMain.on('setmenubaricon', function (event, callback) { //设置menubar的图标    
    if(disconnect){
      mb.tray.setImage(path.join(__dirname, '../img/cancel/icon.iconset/icon_32x32.png'))
    }else{
      if(!syncmyfinished){
      mb.tray.setImage(path.join(__dirname, '../img/refresh/icon.iconset/icon_32x32.png'))
      }else{
        var conf = getconf();
        var opt = {
        'host': conf.host,
        'port': conf.port,
        'user': conf.user,
        'passwd': conf.passwd
      };
      //test login
      wpservice.login(opt, function (data, cbdata) {
        if (data == null || data.status < 0) {
          mb.tray.setImage(path.join(__dirname, '../img/cancel/icon.iconset/icon_32x32.png'))
        }
        //登录成功，准备启动同步
        else {
          mb.tray.setImage(path.join(__dirname, '../img/check/icon.iconset/icon_32x32.png'))
        }
      });
      
      }
    }
    
  });
  ipcMain.emit("setmenubaricon");
});

/* 我的盘库 开始------------------------------------------*/
sync.setFinishEvent('setsyncfinished');
var myFileAlert = require('./components/jpwnotify');//监控文件夹
var syncmyfinished = true;

ipcMain.on('setsyncfinished', function (arg) { //设置我的盘库同步完成状态
  syncmyfinished = arg;
  var _conf = getconf();
  //同步完成，启动文件监控
  if (syncmyfinished) {
    ipcMain.emit("setMyFileAlert", _conf.localDir + "/" + defaultSyncFolder);
  }
  mb.window.webContents.send('setsyncfinished', arg);
  //ipcMain.emit("log", "set syncmyfinished:" + arg);
  ipcMain.emit("refreshuserinfo");
  ipcMain.emit("setmenubaricon");
});

ipcMain.on('setMyFileAlert', function (notifypath) { //开始文件监控  
  //ipcMain.emit("log", "set MyFileAlert:" + notifypath);

  if (notifypath == null) {
    var _conf = getconf();
    if (_conf.localDir != null && _conf.localDir != "" && fs.existsSync(_conf.localDir + "/" + defaultSyncFolder + "/MyFiles")) {
      notifypath = _conf.localDir + "/" + defaultSyncFolder + "/MyFiles";
    }
  }
  if (fs.existsSync(notifypath)) {

    myFileAlert.clearFolders();
    //遍历子目录
    var filelist = require('./components/getAllFolder').getAllFiles(notifypath, false);


    //加入需监控的目录
    filelist.forEach(function (file) {
      //ipcMain.emit("log", "MyFileAlert addFolder:"+file);
      myFileAlert.addFolder(file);
    });

    try {
      //注册回调函数
      myFileAlert.start(function (file, event, path) {
        var msg = file + ' ' + event + ' in ' + path; //测试信息
        ipcMain.emit("log", msg);
        fileChangeInfo = '有文件被改变！'; //更新文件状态信息
        //将文件路径中的"\"替换为"/"
        path = path.replace(/\\/g, "/");
        //ipcMain.emit("log", "myFileAlert:" + path);
        //调用同步程序
        ipcMain.emit("callSync", path);
        //mb.window.webContents.send('file-change-notify', fileChangeInfo);//发送文件状态信息至窗体
      });
    } catch (e) {
      ipcMain.emit("log", e);

    }
  }
});


function startSync(filepath, conf) {//启动同步程序
  if (!syncmyfinished)
    return;
  //设置同步状态
  ipcMain.emit("setsyncfinished", false);
  var syncConf = { url: '', port: '', un: '', pw: '', localDir: '', mystrategy: '', teamstrategy: '' };
  syncConf.url = conf.host;
  syncConf.port = conf.port;
  syncConf.un = conf.user;
  syncConf.pw = conf.passwd;
  syncConf.localDir = conf.localDir + "/" + defaultSyncFolder;
  syncConf.strategy = conf.synctype;

  //同步过程中停止文件监控
  myFileAlert.close();

  try {
    //检查同步目录是否存在
    initSyncFolder(conf, false);
    //获取不能删除的文件夹
    syncJWPSystem(function () {
      ipcMain.emit("setmenubaricon");
      ipcMain.emit("log", "start sync my... ");
      //开始同步
      sync.sync(filepath, syncConf);
    });
  } catch (e) {
    //发生异常，将同步状态置为已完成
    ipcMain.emit("setsyncfinished", true);
    ipcMain.emit("log", e);
    ipcMain.emit("refreshuserinfo");
  }
}


/*我的盘库 结束============================================== */


function syncBefore(conf) {
  var error = 0;
  var message = "";
  if (conf.user == null || conf.user == "" || conf.passwd == null || conf.passwd == "") {
    message = "user or passwd not set.";
    error = -1;
  } else if (conf.host == null || conf.host == "" || conf.port == null || conf.port == "") {
    message = "host or port not set.";
    error = -2;
  } else if (conf.localDir == null || conf.localDir == "") {
    message = "localDir not set.";
    error = -3;
  } else {
    //检查同步目录是否存在
    if (!fs.existsSync(conf.localDir + "/" + defaultSyncFolder)) {
      message = "localDir:" + conf.localDir + "/" + defaultSyncFolder + " is not exists";
      error = -4;
    }
  }
  return { error: error, message: message };
}
//获取配置信息
function getconf() {
  var confstr;
  initJWPFolder();
  if (fs.existsSync(os.homedir() + '/' + defaultJWPFolder + '/jwpconfig.json')) {
    confstr = fs.readFileSync(os.homedir() + '/' + defaultJWPFolder + '/jwpconfig.json', 'utf-8');

  } else {
    confstr = '{"localDir":"","passwd":"","synctype":"","user":"","host":"","port":""}';
  }
  var conf = JSON.parse(confstr);
  return conf;
}

function writeconf(conf) {
  initJWPFolder();
  //写入配置信息
  fs.writeFileSync(os.homedir() + '/' + defaultJWPFolder + '/jwpconfig.json', JSON.stringify(conf));
}


//初始化同步程序目录
function initSyncFolder(conf, initdata) {
  var homedir = conf.localDir;
  var localdata = {};
  var teamdata = {};
  //同步目录不存在
  if (!fs.existsSync(conf.localDir)) {
    return;
  }
  //用户未指定
  if (conf.user == null || conf.user == "") {
    return;
  }

  if (conf.host == null || conf.host == "") {
    return;
  }
  //初始化jwp系统文件夹
  initJWPFolder();

  //ipcMain.emit("log", "initSyncFolder:" + conf.localDir + "/" + defaultSyncFolder+" initdata:"+initdata);
  if (!fs.existsSync(conf.localDir + "/" + defaultSyncFolder)) {
    fs.mkdirSync(conf.localDir + "/" + defaultSyncFolder);
  }

  homedir = conf.localDir + "/" + defaultSyncFolder;

  // if (!fs.existsSync(homedir + '/setting')) {
  //   fs.mkdirSync(homedir + '/setting');
  // }
  // if (!fs.existsSync(homedir + '/setting/log')) {
  //   fs.mkdirSync(homedir + '/setting/log');
  // }
  //初始化重置data文件
  if (initdata) {
    fs.writeFileSync(os.homedir() + '/' + defaultJWPFolder + '/setting/localdata.json', JSON.stringify(localdata));
  } else {
    if (!fs.existsSync(os.homedir() + '/' + defaultJWPFolder + '/setting/localdata.json')) {
      fs.writeFileSync(os.homedir() + '/' + defaultJWPFolder + '/setting/localdata.json', JSON.stringify(localdata));
    }
  }

}

function initJWPFolder() {//初始化jwp系统文件夹
  var homedir = os.homedir() + '/' + defaultJWPFolder;
  var sysconfig = {};
  var nosync = {};
  var nodel = {};
  sysconfig["nosync"] = nosync;
  sysconfig["nodel"] = nodel;


  if (!fs.existsSync(homedir)) {
    fs.mkdirSync(homedir);
  }
  if (!fs.existsSync(homedir + "/system")) {//创建系统同步文件夹
    fs.mkdirSync(homedir + "/system");
  }
  if (!fs.existsSync(homedir + '/setting')) {
    fs.mkdirSync(homedir + '/setting');
  }
  if (!fs.existsSync(homedir + '/setting/log')) {
    fs.mkdirSync(homedir + '/setting/log');
  }
  if (!fs.existsSync(homedir + "/system/sysconfig.json")) {
    fs.writeFileSync(homedir + '/system/sysconfig.json', JSON.stringify(sysconfig));
  }
  if (!fs.existsSync(homedir + "/system/userconfig.json")) {
    fs.writeFileSync(homedir + '/system/userconfig.json', JSON.stringify(sysconfig));
  }
}

function syncJWPSystem(callback) {//同步.jwp的系统数据---暂未实现
  //不能删除的目录
  var _conf = getconf();
  var sysconfig = {};
  var nosync = {};
  var nodel = {};
  //nosync[_conf.localDir+"/jwp/MyFiles"] = 1;
  //nosync["文件名1"] = 2;
  //尝试登陆
  var opt = {
    'host': _conf.host,
    'port': _conf.port,
    'user': _conf.user,
    'passwd': _conf.passwd
  };
  //获取不能删除的目录
  wpservice.getsystem(opt, function (data, cbdata) {
    if (data == null || data.status < 0) {
      ipcMain.emit("log", "call sync fail: login auth fail");
    }
    else {
      //不能删除
      data.nodel.forEach(function (element) {
        nodel[_conf.localDir + "/" + defaultSyncFolder + "/" + element] = 1;
      });
      //不能同步
      data.nosync.forEach(function (element) {
        nosync[_conf.localDir + "/" + defaultSyncFolder + "/" + element] = 1;
      });
      nosync[_conf.localDir + "/" + defaultSyncFolder + "/setting"] = 1;

      //保存
      sysconfig["nodel"] = nodel;
      sysconfig["nosync"] = nosync;
      sysconfig["roottree"] = data.list;
      fs.writeFileSync(os.homedir() + '/.jwp/system/sysconfig.json', JSON.stringify(sysconfig));
      callback();
    }
  });



}

function Encrypt(str) {
  var str2 = new Buffer(str).toString("base64");
  return str2;
}
function Decrypt(str) {
  var str2 = new Buffer(str, "base64").toString();
  return str2;
}
function timerefreshuserinfo() {
  ipcMain.emit("log", "timer refresh userinfo");
  ipcMain.emit("refreshuserinfo");
}
function readversion() {
  var packagefile = __dirname + "/../package.json";
  if (fs.existsSync(packagefile)) {
    var packageinfo = JSON.parse(fs.readFileSync(packagefile).toString());
    jwpversion = packageinfo.version;
  }
  console.log("version:" + jwpversion);
}
function fireCallSync() {
  ipcMain.emit("callSync");
}
setInterval(fireCallSync, 3 * 60 * 1000);//设置定时器-同步我的盘库，3分钟

setInterval(timerefreshuserinfo, 10 * 60 * 1000);//设置定时器-刷新登录，10分钟
