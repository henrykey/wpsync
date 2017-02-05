var fdchg = require('./components/folderChange');
var args = process.argv.splice(2); //get arguments of comand line
var checkpath = '/Users/kehongwei/test';
if(args.length > 0){
    checkpath = args[0];
}
var t1 = Date.now();
var status = fdchg.checkPath(checkpath, '/Users/kehongwei/curstat.json');
var t2 = Date.now();
var t = t2 - t1;
console.log('time(ms):' + t.toString());
if(status == 0){
    console.log('no change')
}
else {
    console.log('changed');
    var dir = fdchg.getChgDir();
    dir.forEach(f => console.log(f.name + ":" + f.value));
}
