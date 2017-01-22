var dirpath, syncpath, cliConf, homedir, configfile, localdata, dellist, uplist, downlist, logfile, nosync1, nosync2, nodel1, nodel2;
var os = require('os');
var fs = require('fs');
var Notify = require('fs.notify');
var moment = require('moment');
var events = require("events");
var crypto = require('crypto');
var wpservice = require('./wpservice');
var eventsEmitter = new events.EventEmitter();
module.exports.sync = sync;

eventsEmitter.on('delaction', delaction);
eventsEmitter.on('delcheckfinish', delcheckfinish);
eventsEmitter.on('delfinish', delfinish);
eventsEmitter.on('upaction', upaction);
eventsEmitter.on('upcheckfinish', upcheckfinish);
eventsEmitter.on('upfinish', upfinish);
eventsEmitter.on('downaction', downaction);
eventsEmitter.on('downcheckfinish', downcheckfinish);
eventsEmitter.on('downfinish', downfinish);

var finishEvent = null;
exports.setFinishEvent = function (cb) {
    finishEvent = cb;
}

const electron = require('electron')
const ipcMain = electron.ipcMain

function sync(pathpath, conf) {
    nosync1 = {};
    nosync2 = {};
    nodel1 = {};
    nodel2 = {};
    var systemconfig = require(os.homedir() + '/.jwp/system/sysconfig.json');
    var userconfig = require(os.homedir() + '/.jwp/system/userconfig.json');
    var snosync = systemconfig.nosync;
    var unosync = userconfig.nosync;
    var snodel = systemconfig.nodel;
    var unodel = userconfig.nodel;
    for (var key in snosync) {
        if (snosync[key] == 1) {
            nosync1[key] = 1;
        } else {
            nosync2[key] = 1;
        }
    }
    for (var key in unosync) {
        if (unosync[key] == 1) {
            nosync1[key] = 1;
        } else {
            nosync2[key] = 1;
        }
    }
    for (var key in snodel) {
        if (snodel[key] == 1) {
            nodel1[key] = 1;
        } else {
            nodel2[key] = 1;
        }
    }
    for (var key in unodel) {
        if (unodel[key] == 1) {
            nodel1[key] = 1;
        } else {
            nodel2[key] = 1;
        }
    }

    cliConf = conf;
    dirpath = pathpath;
    localdata = {};
    dellist = new Array();
    homedir = cliConf.localDir;
    var reg = /\\/g;
    homedir = homedir.replace(reg, "/");
    var datestr = moment(new Date()).format("YYYY_MM_DD");
    var yyyy = datestr.substr(0, 4);
    if (!fs.existsSync(homedir + '/.setting/log/' + yyyy)) {
        fs.mkdirSync(homedir + '/.setting/log/' + yyyy);
    }
    if (!fs.existsSync(homedir + '/.setting/log/' + yyyy + '/' + datestr + '.log')) {
        fs.writeFileSync(homedir + '/.setting/log/' + yyyy + '/' + datestr + '.log', '');
    }
    logfile = homedir + '/.setting/log/' + yyyy + '/' + datestr + '.log';
    if (!fs.existsSync(homedir + '/.setting/localdata.json')) {
        fs.writeFileSync(homedir + '/.setting/localdata.json', JSON.stringify(localdata));
    }
    localdata = require(homedir + '/.setting/localdata.json');
    nosync1[homedir + '/.setting'] = 1;
    nodel1[homedir + '/.setting'] = 1;

    syncpath = homedir;
    if (dirpath != null && dirpath.length > 0) {
        syncpath = dirpath;
    }
    if (fs.existsSync(syncpath)) {
        fs.appendFileSync(logfile, new Date() + ' 启动同步:' + syncpath + '\r\n', 'utf-8');
    }
    opt = {
        'host': cliConf.url,
        'port': cliConf.port,
        'user': cliConf.un,
        'passwd': cliConf.pw
    };
    wpservice.getall2(opt, function (data) {
        if (data == null || data.status < 0) {
            fs.appendFileSync(logfile, new Date() + ' 获取同步列表错误!\r\n', 'utf-8');
            fs.appendFileSync(logfile, new Date() + ' 同步失败!\r\n', 'utf-8');
            if (data.status == -8) {
                ipcMain.emit("connecterr");
                ipcMain.emit("setsyncfinished", true);
                return;
            }
        }
        else {
            
            var datalist = data.list;
            var datamap = data.map;
            fs.appendFileSync(logfile, new Date() + ' 获取同步列表成功\r\n', 'utf-8');
            datalist.forEach(function (element) {
                var filepath = homedir + '/' + element.path + element.docname;
                if (filepath.indexOf(syncpath) > -1) {
                    if (fs.existsSync(filepath)) {
                        var dobj = localdata[filepath];
                        if (dobj == null) {
                            var obj = new Object();
                            obj.name = element.docname;
                            obj.strmd5 = element.md5;
                            obj.smtime = element.time;
                            obj.sid = element.id;
                            localdata[filepath] = obj;
                        } else {
                            dobj.name = element.docname;
                            dobj.smtime = element.time;
                            dobj.sid = element.id;
                            localdata[filepath] = dobj;
                        }

                    }
                }
            }, this);
            fs.writeFileSync(homedir + '/.setting/localdata.json', JSON.stringify(localdata));

            if (cliConf.strategy == 1 || cliConf.strategy == 2) {
                for (var key in localdata) {
                    if (key.indexOf(syncpath) > -1) {
                        if (!(key in nodel1)) {
                            if (!fs.existsSync(key)) {
                                var obj = localdata[key];
                                var aobj = new Object();
                                aobj.type = -1;
                                aobj.filepath = key;
                                aobj.sid = obj.sid;
                                dellist.push(aobj);
                                delete localdata[key];
                            }
                        }
                    }
                }
            }
            if (cliConf.strategy == 1 || cliConf.strategy == 3) {
                for (var key in localdata) {
                    if (key.indexOf(syncpath) > -1) {
                        var filekey = key.replace(homedir + '/', "");
                        if (!(filekey in nodel1)) {
                            if (!(filekey in datamap)) {
                                if (fs.existsSync(key)) {
                                    if (fs.statSync(key).isDirectory()) { // recurse
                                        deleteFolderRecursive(key);
                                    } else { // delete file
                                        fs.unlinkSync(key);
                                    }
                                }
                                delete localdata[key];
                            }
                        }

                    }
                }
            }
            eventsEmitter.emit('delaction', dellist);
        }
    });
}

function delaction(dellist) {
    if (dellist.length == 0) {
        eventsEmitter.emit('delfinish');
    } else {
        var obj = dellist[0];
        if (obj.type == -1) {
            opt = {
                'host': cliConf.url,
                'port': cliConf.port,
                'user': cliConf.un,
                'passwd': cliConf.pw,
                'ids': obj.sid
            };
            wpservice.deldoc(opt, function (data, key) {
                if (data == null || data.status < 0) {
                    fs.appendFileSync(logfile, new Date() + ' 删除:' + key + '失败!\r\n', 'utf-8');
                    if (data.status == -8) {
                        ipcMain.emit("connecterr");
                        ipcMain.emit("setsyncfinished", true);
                        return;
                    }
                } else {
                    fs.appendFileSync(logfile, new Date() + ' 删除:' + key + '成功!\r\n', 'utf-8');
                }
                dellist.shift();
                eventsEmitter.emit('delcheckfinish', dellist);
            }, obj.filepath);
        }
    }
}

function delcheckfinish(dellist) {
    if (dellist.length == 0) {
        eventsEmitter.emit('delfinish');
    } else {
        eventsEmitter.emit('delaction', dellist);
    }
}

function delfinish() {
    fs.writeFileSync(homedir + '/.setting/localdata.json', JSON.stringify(localdata));
    opt = {
        'host': cliConf.url,
        'port': cliConf.port,
        'user': cliConf.un,
        'passwd': cliConf.pw
    };
    wpservice.getall2(opt, function (data) {
        if (data == null || data.status < 0) {
            fs.appendFileSync(logfile, new Date() + ' 获取同步列表错误\r\n', 'utf-8');
            fs.appendFileSync(logfile, new Date() + ' 同步失败！\r\n', 'utf-8');
            if (data.status == -8) {
                ipcMain.emit("connecterr");
                ipcMain.emit("setsyncfinished", true);
                return;
            }
        }
        else {
            var parentid = -999;
            var obj = localdata[syncpath];
            if (obj != null) {
                parentid = obj.sid;
            }
            uplist = new Array();
            downlist = new Array();
            if (cliConf.strategy == 1 || cliConf.strategy == 2) {
                buildlistup(data, syncpath, parentid, uplist);
                eventsEmitter.emit('upaction', data, uplist);
            } else if (cliConf.strategy == 1 || cliConf.strategy == 3) {
                buildlistdown(data, downlist);
                eventsEmitter.emit('downaction', data, downlist);
            }
        }
    });
}

function buildlistup(alldata, pathstr, parentid, uplist) {
    var datamap = alldata.map;
    var files = fs.readdirSync(pathstr);
    files.forEach(function (file, index) {
        var filepath = pathstr + '/' + file;
        if (!(filepath in nosync1) && !(pathstr in nosync1) && !(file in nosync2)) {
            var states = fs.statSync(filepath);
            var obj = localdata[filepath];
            if (parentid == -999) {
                if (obj != null) {
                    buildlistup(alldata, filepath, obj.sid, uplist);
                }
            } else {
                if (obj == null) {
                    if (states.isDirectory()) {
                        var aobj = new Object();
                        aobj.type = 1;
                        aobj.filename = file;
                        aobj.pathstr = pathstr;
                        aobj.parentid = parentid;
                        aobj.filepath = filepath;
                        uplist.push(aobj);
                    } else {
                        var aobj = new Object();
                        aobj.type = 2;
                        aobj.filename = file;
                        aobj.pathstr = pathstr;
                        aobj.parentid = parentid;
                        aobj.filepath = filepath;
                        uplist.push(aobj);
                    }
                    obj = {};
                    obj.sid = -9999;
                } else {
                    if (!states.isDirectory()) {
                        var strmd5 = getfilemd5(filepath);
                        if (obj.strmd5 != strmd5) {
                            var filekey = filepath.replace(homedir + '/', "");
                            var stime = datamap[filekey].time;
                            if (states.mtime.getTime() > stime) {
                                var aobj = new Object();
                                aobj.type = 2;
                                aobj.filename = file;
                                aobj.pathstr = pathstr;
                                aobj.parentid = parentid;
                                aobj.filepath = filepath;
                                uplist.push(aobj);
                            } else {
                                var aobj = new Object();
                                aobj.type = 3;
                                aobj.filename = file;
                                aobj.pathstr = pathstr;
                                aobj.parentid = parentid;
                                aobj.filepath = filepath;
                                uplist.push(aobj);
                            }

                        }
                    }
                }
                if (states.isDirectory()) {
                    buildlistup(alldata, filepath, obj.sid, uplist);
                }
            }
        }
    });
}

function upaction(alldata, uplist) {
    if (uplist.length == 0) {
        eventsEmitter.emit('upcheckfinish', alldata, uplist);
    } else {
        var obj = uplist[0];
        if (obj.parentid == -9999) {
            var parent = localdata[obj.pathstr];
            obj.parentid = parent.sid;
        }
        if (obj.type == 1) {
            opt = {
                'host': cliConf.url,
                'port': cliConf.port,
                'user': cliConf.un,
                'passwd': cliConf.pw,
                'docname': obj.filename,
                'parentid': obj.parentid
            };
            wpservice.addfolder(opt, function (data, aobj) {
                if (data == null || data.status < 0) {
                    fs.appendFileSync(logfile, new Date() + ' 同步:' + aobj.filepath + '错误\r\n', 'utf-8');
                    if (data.status == -8) {
                        ipcMain.emit("connecterr");
                        ipcMain.emit("setsyncfinished", true);
                        return;
                    }
                } else {
                    fs.appendFileSync(logfile, new Date() + ' 同步:' + aobj.filepath + '成功\r\n', 'utf-8');
                    var obj = new Object();
                    obj.type = 1;
                    obj.name = aobj.filename;
                    obj.strmd5 = '';
                    obj.smtime = data.time;
                    obj.sid = data.id;
                    localdata[aobj.filepath] = obj;
                }
                uplist.shift();
                eventsEmitter.emit('upcheckfinish', alldata, uplist);
            }, obj);
        } else if (obj.type == 2) {
            opt = {
                'host': cliConf.url,
                'port': cliConf.port,
                'user': cliConf.un,
                'passwd': cliConf.pw,
                'parentid': obj.parentid,
                'file': obj.filepath
            };
            wpservice.upload(opt, function (data, aobj) {
                if (data == null || data.status < 0) {
                    fs.appendFileSync(logfile, new Date() + ' 同步:' + aobj.filepath + '错误\r\n', 'utf-8');
                    if (data.status == -8) {
                        ipcMain.emit("connecterr");
                        ipcMain.emit("setsyncfinished", true);
                        return;
                    }
                } else {
                    fs.appendFileSync(logfile, new Date() + ' 同步:' + aobj.filepath + '成功\r\n', 'utf-8');
                    var obj = new Object();
                    obj.type = 2;
                    obj.name = aobj.filename;
                    obj.strmd5 = getfilemd5(aobj.filepath);
                    obj.smtime = data.time;
                    obj.sid = data.id;
                    localdata[aobj.filepath] = obj;
                }
                uplist.shift();
                eventsEmitter.emit('upcheckfinish', alldata, uplist);
            }, obj);
        } else if (obj.type == 3) {
            opt = {
                'host': cliConf.url,
                'port': cliConf.port,
                'user': cliConf.un,
                'passwd': cliConf.pw,
                'parentid': obj.parentid,
                'file': obj.filepath
            };
            wpservice.uploadhistory(opt, function (data, aobj) {
                if (data == null || data.status < 0) {
                    fs.appendFileSync(logfile, new Date() + ' 同步:' + aobj.filepath + '错误\r\n', 'utf-8');
                    if (data.status == -8) {
                        ipcMain.emit("connecterr");
                        ipcMain.emit("setsyncfinished", true);
                        return;
                    }
                } else {
                    fs.appendFileSync(logfile, new Date() + ' 同步:' + aobj.filepath + '成功\r\n', 'utf-8');
                    var obj = new Object();
                    obj.type = 2;
                    obj.name = aobj.filename;
                    obj.strmd5 = getfilemd5(aobj.filepath);
                    obj.smtime = data.time;
                    obj.sid = data.id;
                    localdata[aobj.filepath] = obj;
                }
                uplist.shift();
                eventsEmitter.emit('upcheckfinish', alldata, uplist);
            }, obj);
        }
    }
}

function upcheckfinish(alldata, uplist) {
    if (uplist.length == 0) {
        eventsEmitter.emit('upfinish', alldata);
    } else {
        eventsEmitter.emit('upaction', alldata, uplist);
    }
}

function upfinish(alldata) {
    fs.appendFileSync(logfile, new Date() + ' 本地到服务器同步完成\r\n', 'utf-8');
    fs.writeFileSync(homedir + '/.setting/localdata.json', JSON.stringify(localdata));
    downlist = new Array();
    if (cliConf.strategy == 1 || cliConf.strategy == 3) {
        buildlistdown(alldata, downlist);
        eventsEmitter.emit('downaction', alldata, downlist);
    } else {
        ipcMain.emit(finishEvent, true);
    }
}

function buildlistdown(alldata, downlist) {
    alldata.list.forEach(function (element) {
        var filepath = homedir + '/' + element.path + element.docname;
        if (filepath.indexOf(syncpath) > -1) {
            if (element.doctype == 1) {
                if (!fs.existsSync(filepath)) {
                    fs.mkdirSync(filepath);
                    var obj = new Object();
                    obj.type = 1;
                    obj.name = element.docname;
                    obj.strmd5 = '';
                    obj.smtime = element.time;
                    obj.sid = element.id;
                    localdata[filepath] = obj;
                    fs.appendFileSync(logfile, new Date() +' 同步' + filepath + '成功\r\n', 'utf-8');
                }
            } else {
                if (!fs.existsSync(filepath)) {
                    var aobj = new Object();
                    aobj.type = 1;
                    aobj.filename = element.docname;
                    aobj.sid = element.id;
                    aobj.filepath = filepath;
                    aobj.smtime = element.time;
                    downlist.push(aobj);
                } else {
                    var obj = localdata[filepath];
                    if (obj == null) {
                        var aobj = new Object();
                        aobj.type = 1;
                        aobj.filename = element.docname;
                        aobj.sid = element.id;
                        aobj.filepath = filepath;
                        aobj.smtime = element.time;
                        downlist.push(aobj);
                    } else {
                        var strmd5 = getfilemd5(filepath);
                        if (obj.strmd5 != strmd5) {
                            var aobj = new Object();
                            aobj.type = 1;
                            aobj.filename = element.docname;
                            aobj.sid = element.id;
                            aobj.filepath = filepath;
                            aobj.smtime = element.time;
                            downlist.push(aobj);
                        }
                    }
                }
            }
        }
    }, this);
    //fs.writeFileSync(homedir + '/.setting/localdata.json', JSON.stringify(localdata));
}

function downaction(alldata, downlist) {
    if (downlist.length == 0) {
        eventsEmitter.emit('downcheckfinish', alldata, downlist);
    } else {
        var obj = downlist[0];
        if (obj.type == 1) {
            opt = {
                'host': cliConf.url,
                'port': cliConf.port,
                'user': cliConf.un,
                'passwd': cliConf.pw,
                'id': obj.sid,
                'filepath': obj.filepath
            };
            wpservice.download(opt, function (data, aobj) {
                if (data < 0) {
                    fs.appendFileSync(logfile, new Date() + ' 同步:' + aobj.filename + '错误\r\n', 'utf-8');
                    if (data.status == -8) {
                        ipcMain.emit("connecterr");
                        ipcMain.emit("setsyncfinished", true);
                        return;
                    }
                } else {
                    fs.appendFileSync(logfile, new Date() + ' 同步:' + aobj.filename + '成功\r\n', 'utf-8');
                    var obj = new Object();
                    obj.type = 2;
                    obj.name = aobj.filename;
                    obj.strmd5 = getfilemd5(aobj.filepath);
                    obj.smtime = aobj.smtime;
                    obj.sid = aobj.sid;
                    localdata[aobj.filepath] = obj;
                }
                downlist.shift();
                eventsEmitter.emit('downcheckfinish', alldata, downlist);
            }, obj);
        }
    }
}

function downcheckfinish(alldata, downlist) {
    if (downlist.length == 0) {
        eventsEmitter.emit('downfinish', alldata);
    } else {
        eventsEmitter.emit('downaction', alldata, downlist);
    }
}

function downfinish(alldata) {
    fs.appendFileSync(logfile, new Date() + ' 服务器到本地同步完成\r\n', 'utf-8');
    fs.writeFileSync(homedir + '/.setting/localdata.json', JSON.stringify(localdata));
    ipcMain.emit(finishEvent, true);
}

deleteFolderRecursive = function (path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function getfilemd5(path) {
    var md5sum = crypto.createHash('md5');
    var fnum = fs.openSync(path, 'r');
    var states = fs.statSync(path);
    var fsize = states.size;
    var buffsize = 1024 * 1024 * 1024;
    if (fsize < buffsize) {
        buffsize = fsize;
    }
    var data = new Buffer(buffsize);
    while (fs.readSync(fnum, data, 0, buffsize, null) > 0) {
        //console.log(data.length);
        md5sum.update(data);
        fsize = fsize - buffsize;
        if (fsize <= 0) break;
        if (fsize < buffsize) {
            buffsize = fsize;
        }
        data = new Buffer(buffsize);
    }
    fs.closeSync(fnum);
    return md5sum.digest('hex');
};