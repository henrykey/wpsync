//Notification of file changing
const Notify = require('fs.notify');
var folderList = new Array();
var notifications = null;
exports.addFolder = function(folderName){
    folderList[folderList.length] = folderName;
};

//暂停
exports.close = function(){
  // kill everything
  if(notifications!=null)
    notifications.close();
}


//删除一个文件夹
exports.delAFolder = function(folderName){
  folderList = folderList.filter(f => (f != folderName));
}
exports.clearFolders = () => {
  folderList = new Array();
}

//设置文件变动提醒
exports.start = function(callback){  
  notifications = new Notify(folderList);
  notifications.on('change', function (file, event, path) {
    callback(file,event,path);
  });
};
