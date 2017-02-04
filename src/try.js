var fdchg = require('./components/folderChange');
var status = fdchg.checkPath('/Users/kehongwei/test', '/Users/kehongwei/curstat.json');
if(status == 0){
    console.log('no change')
}
else {
    console.log('changed');
    var dir = fdchg.getChgDir();
    dir.forEach(f => console.log(f.name + ":" + f.value));
}
// var jstr = JSON.stringify(folderList);
// console.log(jstr);
// folderList = JSON.parse(jstr);
// folderList.forEach(f => console.log(f.name + '\n'+ f.md5 + '\n'));
