var fs = require('fs');
var crypto = require('crypto');

//遍历文件夹，获取所有文件夹里面的文件信息, 为每个子目录生成md5码
/*
 * @param path 路径
 *
 */

getPathMD5 = function (path)
{
   var folderList = [];
   readFile(path,folderList);
   folderList.forEach(f => console.log(f.name + f.value + '\n'+f.md5 + '\n'));
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
    var n = folderParam.indexOf('\n');
    obj.name = folderParam.slice(0, n);
    obj.value = folderParam.slice(n, folderParam.length - 1);
    var md5sum = crypto.createHash('md5');
    md5sum.update(obj.value);
    obj.md5 = md5sum.digest('hex');
    folderList.push(obj);
//    return folderParam
}

getPathMD5('/Users/kehongwei/test');
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
