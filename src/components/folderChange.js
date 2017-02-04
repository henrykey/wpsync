var fs = require('fs');
var crypto = require('crypto');

//检查目录及子目录是否有变化
/********
 * @param path 欲检查目录的路径
 * @param recordFile 纪录目录状态的json文件
 * @return folderArr 有变化子目录的数组
 *********/
var oriFolderStatus = {};
var folderStatus = {};
var chglist = {};
exports.checkPath = function (path, recordFile){
  folderStatus = this.getPathMD5(path);
  if(!fs.existsSync(recordFile)){
    fs.writeFileSync(recordFile, JSON.stringify(folderStatus));
    return 0;
  }
  var jstr = fs.readFileSync(recordFile);
  oriFolderStatus = JSON.parse(jstr);
  //write current status into file
  fs.writeFileSync(recordFile, JSON.stringify(folderStatus));
  return compDir();
}

/********
 * 获取变化目录
 */
exports.getChgDir()
{
  return chglist;
}

/*****
 * 比较测试目录当前状态与先前存储的状态，当前状态为folderStatus, 先前状态为ororiFolderStatus
 * @return 0：无变化，1:有变化，变化目录存储于chlist中
 */
function compDir(){
  var res = 0;
  //测试是否目录的数目不同
  if(folderStatus.length != oriFolderStatus.length){
    res = 1;//目录数目不同，结果为有变化
  }
  //遍历当前目录
  var n = oriFolderStatus.length;
  var status = new Object();
  for(var i = 0; i < n; ++i){
    var oriStatus = oriFolderStatus.pop();//获取相同目录先前状态
    var currStatus = searchDir(oriStatus);//获取当前一个目录
    if (currStatus == null){ //原先目录不存在
      res = 1; //设定为有变化
      status.name = currStatus.name;
      status.value = 'del';
      chglist.push(status);//当前目录名放入数组
    }
    else if (currStatus.md5 != oriStatus.md5){//目录存在，测试md5码是否相同
      status.name = currStatus.name;
      status.value = 'chg';
      chglist.push(status); //md5码不同，目录有变化，名称放入数组
    }
  }
  //获取未被被处理过的
  var rest = folderStatus.filter(f => f.name != 'pop');
  rest.forEach(f => {
    status.name = f.name;
    status.value = 'new';
    chglist.push(status)
  });
  return res;
}

function searchDir(dirStatus){
  for (var i = 0; i < folderStatus.length; ++i){
    if (dirStatus.name == folderStatus[i].name){
      var st = folderStatus[i];
      folderStatus[i].name = 'pop';
      return st;
    }
  }
  return null
}
//遍历文件夹，获取所有文件夹里面的文件信息, 为每个子目录生成md5码
/*
 * @param path 路径
 *
 */

exports.getPathMD5 = function (path)
{
   var folderList = [];
   readFile(path,folderList);
   return folderList.reverse();
}

//遍历读取文件
function readFile(path,folderList)
{
   var folderParam = path + '\n';
   files = fs.readdirSync(path);//需要用到同步读取
   files.forEach(walk);
   function walk(file)
   {
        states = fs.statSync(path+'/'+file);
        if(states.isDirectory())
        {
          folderParam += file + ',-1\n';
          readFile(path+'/'+file, folderList);
        }
        else
        {
          folderParam += file + ',' + states.size + '\n';
            //创建一个对象保存信息
            var obj = new Object();
            obj.size = states.size;//文件大小，以字节为单位
            obj.name = file;//文件名
            obj.path = path+'/'+file; //文件绝对路径
//            filesList.push(obj);
        }
    }
    var obj = new Object();
    var n = folderParam.indexOf('\n'); //定位目录全路径名称长度
    obj.name = folderParam.slice(0, n);//取出目录名
    var value = folderParam.slice(n, folderParam.length - 1); //取出剩余的所有内容
    //计算内容的md5码
    var md5sum = crypto.createHash('md5');
    md5sum.update(value);
    //按16进制取md5
    obj.md5 = md5sum.digest('hex');
    //放入数组
    folderList.push(obj);
}

//getPathMD5('/Users/kehongwei/test');
/*
//写入文件utf-8格式
function writeFile(fileName,data)
{
  fs.writeFile(fileName,data,'utf-8',complete);
  function complete()
  {
     console.log("文件生成成功");
  }
}


var filesList = geFileList("G:/nodejs");
filesList.sort(sortHandler);
function sortHandler(a,b)
{
  if(a.size > b.size)
   return -1;
  else if(a.size < b.size) return 1
   return 0;
}
var str='';
for(var i=0;i<filesList.length;i++)
{
   var item = filesList[i];
   var desc ="文件名:"+item.name + "  "
        +"大小:"+(item.size/1024).toFixed(2) +"/kb"+"  "
        +"路径:"+item.path;
   str+=desc +"\n"
}


writeFile("test.txt",str);
*/
