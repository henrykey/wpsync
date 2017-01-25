var fs = require('fs');
exports.getAllFiles = function (dir,containfile, callback) {
  var fileArr = [];
  /*
  dir = ///$/.test(dir) ? dir : dir + '/';
  (function dir(dirpath, fn) {
    var files = Sys.fs.readdirSync(dirpath);
    exports.async(files, function (item, next) {
      var info = Sys.fs.statSync(dirpath + item);
      if (info.isDirectory()) {
        dir(dirpath + item + '/', function () {
          next();
        });
      } else {
        filesArr.push(dirpath + item);
        callback && callback(dirpath + item);
        next();
      }
    }, function (err) {
      !err && fn && fn();
    });
  })(dir);
  */

  return getFile(dir,fileArr,containfile);
};

function getFile(dir,fileArr,containfile){
    
    var files = fs.readdirSync(dir);
    files.forEach(function (filename) {
            if(filename=='.setting')
                return ;
            //console.log("getfile:"+dir + "/" + filename);
            var stats = null;
            try{
              stats = fs.statSync(dir + "/" + filename);
            }catch(e){

            }
            if(stats==null)
              return ;
            if(stats.isDirectory()){
                fileArr.push(dir + "/" + filename);
                fileArr = getFile(dir + "/" + filename,fileArr,containfile);
            }
                
            if(containfile&&stats.isFile())
                fileArr.push(dir + "/" + filename);
        });
    return fileArr;
}