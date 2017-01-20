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
sync.setteamFinishEvent('setsyncteamfinished');
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

  //设置监控目录
  ipcMain.emit("setMyFileAlert");
  ipcMain.emit("setTeamFileAlert");

  //注册处理事件的回调函数
  mb.window.on('focus', () => {//获得焦点
    mb.window.transparent = true;
    ipcMain.emit("log", "get focus...");
  })

  ipcMain.on('openfolder', (event) => {//自定义按退出键
    //alert('openfolder');
    var _conf = getconf();
    //console.log('openfolder');
    electron.shell.openItem(_conf.localDir);
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
      initSyncFolder(conf,true);
    }
    else if (!fs.existsSync(conf.localDir + "/" + defaultSyncFolder)) {
      //初始化同步目录
      initSyncFolder(conf,true);
    }

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
});

/* 我的盘库 开始------------------------------------------*/
sync.setmyFinishEvent('setsyncmyfinished');
var myFileAlert = require('./components/jpwnotify');//监控文件夹
var syncmyfinished = true;

ipcMain.on('setsyncmyfinished', function (arg) { //设置我的盘库同步完成状态
  syncmyfinished = arg;
  var _conf = getconf();
  //同步完成，启动文件监控
  if (syncmyfinished) {
    ipcMain.emit("setMyFileAlert", _conf.localDir + "/" + defaultSyncFolder + "/MyFiles");
  }
  mb.window.webContents.send('setsyncmyfinished', arg);
  //ipcMain.emit("log", "set syncmyfinished:" + arg);
  ipcMain.emit("refreshuserinfo");
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
    myFileAlert.stop();
    myFileAlert.clearFolders();
    //遍历子目录
    var filelist = require('./components/getAllFolder').getAllFiles(notifypath, false);

    //加入需监控的目录
    filelist.forEach(function (file) {
      //ipcMain.emit("log", file);
      myFileAlert.addFolder(file);
    });

    //注册回调函数
    myFileAlert.setNotify(function (file, event, path) {
      var msg = file + ' ' + event + ' in ' + path; //测试信息
      fileChangeInfo = '有文件被改变！'; //更新文件状态信息
      //将文件路径中的"\"替换为"/"
      path = path.replace(/\\/g, "/");
      ipcMain.emit("log", "myFileAlert:" + path);
      //调用同步程序
      callSyncMy(path);
      mb.window.webContents.send('file-change-notify', fileChangeInfo);//发送文件状态信息至窗体
    });
    myFileAlert.start();
  }
});
function startSyncMy(filepath, conf) {//启动同步程序
  if (!syncmyfinished)
    return;
  var syncConf = { url: '', port: '', un: '', pw: '', localDir: '', mystrategy: '', teamstrategy: '' };
  syncConf.url = conf.host;
  syncConf.port = conf.port;
  syncConf.un = conf.user;
  syncConf.pw = conf.passwd;
  syncConf.localDir = conf.localDir + "/" + defaultSyncFolder;
  syncConf.mystrategy = conf.synctype;
  syncConf.teamstrategy = conf.synctype;

  //同步过程中停止文件监控
  myFileAlert.stop();
  //设置同步状态
  ipcMain.emit("setsyncmyfinished", false);
  ipcMain.emit("log", "start sync my... ");
  try {    
    initSyncFolder(conf,false);
    //开始同步
    sync.syncmy(filepath, syncConf);
  } catch (e) {
    ipcMain.emit("log", e);
  }
}
//调用同步模块函数
function callSyncMy(filepath) {
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
      }
      //登录成功，准备启动同步
      else {
        startSyncMy(filepath, conf);
      }
    });
  }

}
/*我的盘库 结束============================================== */
/*工作组盘库 开始------------------------------------------*/
sync.setteamFinishEvent('setsyncteamfinished');
var teamFileAlert = require('./components/jpwnotify');//监控文件夹
var syncteamfinished = true;

ipcMain.on('setsyncteamfinished', function (arg) { //设置我的盘库同步完成状态
  syncteamfinished = arg;
  var _conf = getconf();
  //同步完成，启动文件监控
  if (syncteamfinished) {
    ipcMain.emit("setTeamFileAlert", _conf.localDir + "/" + defaultSyncFolder + "/TeamFiles");
  }
  mb.window.webContents.send('setsyncteamfinished', arg);
  //ipcMain.emit("log", "set syncteamfinished:" + arg);
  ipcMain.emit("refreshuserinfo");
});

ipcMain.on('setTeamFileAlert', function (notifypath) { //开始文件监控  
  //ipcMain.emit("log", "set TeamFileAlert:" + notifypath);

  if (notifypath == null) {
    var _conf = getconf();
    if (_conf.localDir != null && _conf.localDir != "" && fs.existsSync(_conf.localDir + "/" + defaultSyncFolder + "/TeamFiles")) {
      notifypath = _conf.localDir + "/" + defaultSyncFolder + "/TeamFiles";
    }
  }
  if (fs.existsSync(notifypath)) {
    teamFileAlert.stop();
    teamFileAlert.clearFolders();
    //遍历子目录
    var filelist = require('./components/getAllFolder').getAllFiles(notifypath, false);

    //加入需监控的目录
    filelist.forEach(function (file) {
      //ipcMain.emit("log", file);
      teamFileAlert.addFolder(file);
    });

    //注册回调函数
    teamFileAlert.setNotify(function (file, event, path) {
      var msg = file + ' ' + event + ' in ' + path; //测试信息
      fileChangeInfo = '有文件被改变！'; //更新文件状态信息
      //将文件路径中的"\"替换为"/"
      path = path.replace(/\\/g, "/");
      ipcMain.emit("log", "teamFileAlert:" + path);
      //调用同步程序
      callSyncTeam(path);
      mb.window.webContents.send('file-change-notify', fileChangeInfo);//发送文件状态信息至窗体
    });
    teamFileAlert.start();
  }
});
function startSyncTeam(filepath, conf) {//启动同步程序
  if (!syncteamfinished)
    return;
  var syncConf = { url: '', port: '', un: '', pw: '', localDir: '', mystrategy: '', teamstrategy: '' };
  syncConf.url = conf.host;
  syncConf.port = conf.port;
  syncConf.un = conf.user;
  syncConf.pw = conf.passwd;
  syncConf.localDir = conf.localDir + "/" + defaultSyncFolder;
  syncConf.mystrategy = conf.synctype;
  syncConf.teamstrategy = conf.synctype;

  //同步过程中停止文件监控
  teamFileAlert.stop();
  //设置同步状态
  ipcMain.emit("setsyncteamfinished", false);
  ipcMain.emit("log", "start sync team... ");
  try {    
    initSyncFolder(conf,false);
    //开始同步
    sync.syncteam(filepath, syncConf);
  } catch (e) {
    ipcMain.emit("log", e);
  }
}
//调用同步模块函数
function callSyncTeam(filepath) {
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
        ipcMain.emit("log", "call syncteam fail: login auth fail");
      }
      //登录成功，准备启动同步
      else {
        startSyncTeam(filepath, conf);
      }
    });
  }

}
/*工作组盘库 结束============================================== */



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
  if (fs.existsSync(__dirname + '/../../jwpconfig.json')) {
    confstr = fs.readFileSync(__dirname + '/../../jwpconfig.json', 'utf-8');

  } else {
    confstr = '{"localDir":"","passwd":"","synctype":"","user":"","host":"","port":""}';
  }
  var conf = JSON.parse(confstr);

  return conf;
}

function writeconf(conf) {
  //写入配置信息
  fs.writeFileSync(__dirname + '/../../jwpconfig.json', JSON.stringify(conf));
}


//初始化同步程序目录
function initSyncFolder(conf,initdata) {
  var homedir = conf.localDir;
  var mydata = {};
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
  //ipcMain.emit("log", "initSyncFolder:" + conf.localDir + "/" + defaultSyncFolder+" initdata:"+initdata);
  if (!fs.existsSync(conf.localDir + "/" + defaultSyncFolder)) {
    fs.mkdirSync(conf.localDir + "/" + defaultSyncFolder);
  }
  homedir = conf.localDir + "/" + defaultSyncFolder;
  if (!fs.existsSync(homedir + '/MyFiles')) {
    fs.mkdirSync(homedir + '/MyFiles');
  }
  if (!fs.existsSync(homedir + '/TeamFiles')) {
    fs.mkdirSync(homedir + '/TeamFiles');
  }
  if (!fs.existsSync(homedir + '/.setting')) {
    fs.mkdirSync(homedir + '/.setting');
  }
  if (!fs.existsSync(homedir + '/.setting/mylog')) {
    fs.mkdirSync(homedir + '/.setting/mylog');
  }
  if (!fs.existsSync(homedir + '/.setting/teamlog')) {
    fs.mkdirSync(homedir + '/.setting/teamlog');
  }
  //初始化重置data文件
  if(initdata){
    fs.writeFileSync(homedir + '/.setting/mydata.json', JSON.stringify(mydata));
    fs.writeFileSync(homedir + '/.setting/teamdata.json', JSON.stringify(teamdata));
  }else{
    if (!fs.existsSync(homedir + '/.setting/mydata.json')) {
      fs.writeFileSync(homedir + '/.setting/mydata.json', JSON.stringify(mydata));
    }
    if (!fs.existsSync(homedir + '/.setting/teamdata.json')) {
      fs.writeFileSync(homedir + '/.setting/teamdata.json', JSON.stringify(teamdata));
    }
  }
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

setInterval(callSyncMy, 180 * 1000);//设置定时器-同步我的盘库，3分钟

setInterval(callSyncTeam, 180 * 1000);//设置定时器-同步工作组盘库，3分钟

setInterval(timerefreshuserinfo, 600 * 1000);//设置定时器-刷新登录，10分钟