//Notification of file changing
const Notify = require('fs.notify');
var folderList = new Array();
var isNotify = true;
exports.addFolder = function(folderName){
    folderList[folderList.length] = folderName;
};

//暂停
exports.stop = function(){
  isNotify = false;
}
//重启
exports.start = function(){
  isNotify = true;
}

//删除一个文件夹
exports.delAFolder = function(folderName){
  folderList = folderList.filter(f => (f != folderName));
}
exports.clearFolders = () => {
  folderList = new Array();
}
//设置文件变动提醒
exports.setNotify = function(callback){
  if(!isNotify) return;
  var notifications = new Notify(folderList);
  notifications.on('change', function (file, event, path) {
    callback(file,event,path);
  });
  // kill everything
  notifications.close();
  };
