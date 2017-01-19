var mydirpath, teamdirpath, cliConf, homedir, configfile, mydata, mylist, delmylist, downmylist, teamlist, delteamlist, downteamlist, mylogfile, mysyncpath, teamlogfile, teamsyncpath;
var os = require('os');
var fs = require('fs');
var Notify = require('fs.notify');
var moment = require('moment');
var events = require("events");
var crypto = require('crypto');
var wpservice = require('./wpservice');
var eventsEmitter = new events.EventEmitter();
module.exports.syncmy = syncmy;
var cliConf = null;
eventsEmitter.on('delmyaction', delmyaction);
eventsEmitter.on('delmycheckfinish', delmycheckfinish);
eventsEmitter.on('delmyfinish', delmyfinish);
eventsEmitter.on('upmyaction', upmyaction);
eventsEmitter.on('upmycheckfinish', upmycheckfinish);
eventsEmitter.on('upmyfinish', upmyfinish);
eventsEmitter.on('downmyaction', downmyaction);
eventsEmitter.on('downmycheckfinish', downmycheckfinish);
eventsEmitter.on('downmyfinish', downmyfinish);

var finishEvent = null;
exports.setFinishEvent = function (cb) {
    finishEvent = cb;
}
const electron = require('electron')
const ipcMain = electron.ipcMain

// eventsEmitter.on('delteamaction', delteamaction);
// eventsEmitter.on('delteamcheckfinish', delteamcheckfinish);
// eventsEmitter.on('delteamfinish', delteamfinish);
// eventsEmitter.on('upteamaction', upteamaction);
// eventsEmitter.on('upteamcheckfinish', upteamcheckfinish);
// eventsEmitter.on('upteamfinish', upteamfinish);
// eventsEmitter.on('downteamaction', downteamaction);
// eventsEmitter.on('downteamcheckfinish', downteamcheckfinish);
// eventsEmitter.on('downteamfinish', downteamfinish);

// function syncteam(dirpath) {
//     cliConf = {};
//     teamdata = {};
//     delteamlist = new Array();
//     homedir = conf.localDir + "/" + conf.user;
//     var datestr = moment(new Date()).format("YYYY_MM_DD");
//     var yyyy = datestr.substr(0, 4);
//     if (!fs.existsSync(homedir + '/.setting/log/' + yyyy)) {
//         fs.mkdirSync(homedir + '/.setting/log/' + yyyy);
//     }
//     if (!fs.existsSync(homedir + '/.setting/log/' + yyyy + '/' + datestr + '.log')) {
//         fs.writeFileSync(homedir + '/.setting/log/' + yyyy + '/' + datestr + '.log', '');
//     }
//     teamlogfile = homedir + '/.setting/log/' + yyyy + '/' + datestr + '.log';

//     cliConf = require(homedir + '/.setting/config.json');
//     teamdata = require(homedir + '/.setting/teamdata.json');
//     teamsyncpath = homedir + '/TeamFiles';
//     if (dirpath != null && dirpath.length > 0) {
//         teamsyncpath = dirpath;
//     }
//     opt = {
//         'host': cliConf.url,
//         'port': cliConf.port,
//         'user': cliConf.un,
//         'passwd': cliConf.pw,
//         'type': 'team'
//     };
//     wpservice.getroot(opt, function (data) {
//         if (data == null || data.status < 0) {
//             fs.appendFileSync(teamlogfile, '同步工作组盘库失败！\n', 'utf-8');
//         }
//         else {
//             var listteam = data.teamlist;
//             listteam.forEach(function (item, index) {
//                 if (!fs.existsSync(homedir + '/TeamFiles' + '/' + item.teamname)) {
//                     fs.mkdirSync(homedir + '/TeamFiles' + '/' + item.teamname);
//                     states = fs.statSync(homedir + '/TeamFiles' + '/' + item.teamname);
//                     var obj = new Object();
//                     obj.type = 1;
//                     obj.name = item.teamname;
//                     obj.mtime = states.mtime.getTime();
//                     obj.smtime = 0;
//                     obj.sid = -999;
//                     teamdata[homedir + '/TeamFiles' + '/' + item.teamname] = obj;
//                 }
//                 if (!fs.existsSync(homedir + '/TeamFiles' + '/' + item.teamname + '/' + item.protectname)) {
//                     fs.mkdirSync(homedir + '/TeamFiles' + '/' + item.teamname + '/' + item.protectname);
//                     states = fs.statSync(homedir + '/TeamFiles' + '/' + item.teamname + '/' + item.protectname);
//                     var obj = new Object();
//                     obj.type = 1;
//                     obj.name = item.protectname;
//                     obj.mtime = states.mtime.getTime();
//                     obj.smtime = 0;
//                     obj.sid = item.protectid;
//                     teamdata[homedir + '/TeamFiles' + '/' + item.teamname + '/' + item.protectname] = obj;
//                 }
//                 if (!fs.existsSync(homedir + '/TeamFiles' + '/' + item.teamname + '/' + item.publicname)) {
//                     fs.mkdirSync(homedir + '/TeamFiles' + '/' + item.teamname + '/' + item.publicname);
//                     states = fs.statSync(homedir + '/TeamFiles' + '/' + item.teamname + '/' + item.publicname);
//                     var obj = new Object();
//                     obj.type = 1;
//                     obj.name = item.publicname;
//                     obj.mtime = states.mtime.getTime();
//                     obj.smtime = 0;
//                     obj.sid = item.publicid;
//                     teamdata[homedir + '/TeamFiles' + '/' + item.teamname + '/' + data.publicname] = obj;
//                 }
//             });
//             fs.writeFileSync(homedir + '/.setting/teamdata.json', JSON.stringify(teamdata));

//             if (fs.existsSync(teamsyncpath)) {
//                 fs.appendFileSync(teamlogfile, '启动同步' + teamsyncpath + '\n', 'utf-8');
//                 opt = {
//                     'host': cliConf.url,
//                     'port': cliConf.port,
//                     'user': cliConf.un,
//                     'passwd': cliConf.pw,
//                     'type': 'team'
//                 };
//                 wpservice.getall2(opt, function (data) {
//                     //console.log(data);
//                     if (data == null || data.status < 0) {
//                         fs.appendFileSync(teamlogfile, '获取工作组盘库列表错误\n', 'utf-8');
//                         fs.appendFileSync(teamlogfile, '同步失败！\n', 'utf-8');
//                     }
//                     else {
//                         var datalist = data.list;
//                         var datamap = data.map;
//                         fs.appendFileSync(teamlogfile, '获取工作组盘库列表成功\n', 'utf-8');
//                         if (cliConf.teamstrategy == 1 || cliConf.teamstrategy == 2) {
//                             for (var key in teamdata) {
//                                 if (key.indexOf(teamsyncpath) > -1) {
//                                     if (!fs.existsSync(key)) {
//                                         var obj = teamdata[key];
//                                         var aobj = new Object();
//                                         aobj.type = -1;
//                                         aobj.filepath = key;
//                                         aobj.sid = obj.sid;
//                                         delteamlist.push(aobj);
//                                         delete teamdata[key];
//                                     }
//                                 }
//                             }
//                         }
//                         if (cliConf.teamstrategy == 1 || cliConf.teamstrategy == 3) {
//                             for (var key in teamdata) {
//                                 if (key.indexOf(teamsyncpath) > -1) {
//                                     var obj = teamdata[key];
//                                     if (!(obj.sid in datamap)) {
//                                         if (fs.existsSync(key)) {
//                                             if (fs.statSync(key).isDirectory()) { // recurse
//                                                 deleteFolderRecursive(key);
//                                             } else { // delete file
//                                                 fs.unlinkSync(key);
//                                             }
//                                         }
//                                         delete teamdata[key];
//                                     }
//                                 }
//                             }
//                         }
//                         eventsEmitter.emit('delteamaction', delteamlist, data);
//                     }
//                 });
//             }
//         }
//     });
// }

// function delteamaction(delteamlist, alldata) {
//     if (delteamlist.length == 0) {
//         eventsEmitter.emit('delteamfinish', alldata);
//     } else {
//         var obj = delteamlist[0];
//         if (obj.type == -1) {
//             opt = {
//                 'host': cliConf.url,
//                 'port': cliConf.port,
//                 'user': cliConf.un,
//                 'passwd': cliConf.pw,
//                 'ids': obj.sid
//             };
//             wpservice.deldoc(opt, function (data, key) {
//                 if (data == null || data.status < 0) {
//                     fs.appendFileSync(teamlogfile, '删除' + key + '失败!\n', 'utf-8');
//                 } else {
//                     fs.appendFileSync(teamlogfile, '删除' + key + '成功!\n', 'utf-8');
//                 }
//                 delteamlist.shift();
//                 eventsEmitter.emit('delteamcheckfinish', delteamlist, alldata);
//             }, obj.filepath);
//         }
//     }
// }

// function delteamcheckfinish(delteamlist, alldata) {
//     if (delteamlist.length == 0) {
//         eventsEmitter.emit('delteamfinish', alldata);
//     } else {
//         eventsEmitter.emit('delteamaction', delteamlist, alldata);
//     }
// }

// function delteamfinish(alldata) {
//     fs.writeFileSync(homedir + '/.setting/teamdata.json', JSON.stringify(teamdata));
//     var parentid = -999;
//     var obj = teamdata[teamsyncpath];
//     if (obj != null) {
//         parentid = obj.sid;
//     }
//     teamlist = new Array();
//     downteamlist = new Array();
//     if (cliConf.teamstrategy == 1 || cliConf.teamstrategy == 2) {
//         teambuildlistup(alldata, teamsyncpath, parentid, teamlist);
//         eventsEmitter.emit('upteamaction', alldata, teamlist);
//     } else if (cliConf.teamstrategy == 1 || cliConf.teamstrategy == 3) {
//         teambuildlistdown(alldata, downteamlist);
//         eventsEmitter.emit('downteamaction', alldata, downteamlist);
//     }
// }

// function downteamaction(alldata, downteamlist) {
//     if (downteamlist.length == 0) {
//         eventsEmitter.emit('downteamcheckfinish', alldata, downteamlist);
//     } else {
//         var obj = downteamlist[0];
//         if (obj.type == 1) {
//             opt = {
//                 'host': cliConf.url,
//                 'port': cliConf.port,
//                 'user': cliConf.un,
//                 'passwd': cliConf.pw,
//                 'id': obj.sid,
//                 'filepath': obj.filepath
//             };
//             wpservice.download(opt, function (data, aobj) {
//                 if (data < 0) {
//                     fs.appendFileSync(teamlogfile, '同步' + aobj.filename + '错误\n', 'utf-8');
//                 } else {
//                     fs.appendFileSync(teamlogfile, '同步' + aobj.filename + '成功\n', 'utf-8');
//                     var obj = new Object();
//                     obj.type = 2;
//                     obj.name = aobj.filename;
//                     obj.strmd5 = getfilemd5(aobj.filepath);
//                     obj.smtime = aobj.smtime;
//                     obj.sid = aobj.sid;
//                     teamdata[aobj.filepath] = obj;
//                 }
//                 downteamlist.shift();
//                 eventsEmitter.emit('downteamcheckfinish', alldata, downteamlist);
//             }, obj);
//         }
//     }
// }

// function downteamcheckfinish(alldata, downteamlist) {
//     if (downteamlist.length == 0) {
//         eventsEmitter.emit('downteamfinish', alldata);
//     } else {
//         eventsEmitter.emit('downteamaction', alldata, downteamlist);
//     }
// }

// function downteamfinish(alldata) {
//     fs.appendFileSync(teamlogfile, '服务器到本地同步完成\n', 'utf-8');
//     fs.writeFileSync(homedir + '/.setting/teamdata.json', JSON.stringify(teamdata));
// }

// function upteamaction(alldata, teamlist) {
//     if (teamlist.length == 0) {
//         eventsEmitter.emit('upteamcheckfinish', alldata, teamlist);
//     } else {
//         var obj = teamlist[0];
//         if (obj.parentid == -9999) {
//             var parent = teamdata[obj.pathstr];
//             obj.parentid = parent.sid;
//         }
//         if (obj.type == 1) {
//             opt = {
//                 'host': cliConf.url,
//                 'port': cliConf.port,
//                 'user': cliConf.un,
//                 'passwd': cliConf.pw,
//                 'docname': obj.filename,
//                 'parentid': obj.parentid
//             };
//             wpservice.addfolder(opt, function (data, aobj) {
//                 if (data == null || data.status < 0) {
//                     fs.appendFileSync(teamlogfile, '创建' + aobj.filepath + '错误\n', 'utf-8');
//                 } else {
//                     fs.appendFileSync(teamlogfile, '创建' + aobj.filepath + '成功\n', 'utf-8');
//                     states = fs.statSync(aobj.filepath);
//                     var obj = new Object();
//                     obj.type = 1;
//                     obj.name = aobj.filename;
//                     obj.mtime = states.mtime.getTime();
//                     obj.smtime = data.time;
//                     obj.sid = data.id;
//                     teamdata[aobj.filepath] = obj;
//                     teamlist.shift();
//                     eventsEmitter.emit('upteamcheckfinish', alldata, teamlist);
//                 }
//             }, obj);
//         } else if (obj.type == 2) {
//             opt = {
//                 'host': cliConf.url,
//                 'port': cliConf.port,
//                 'user': cliConf.un,
//                 'passwd': cliConf.pw,
//                 'parentid': obj.parentid,
//                 'file': obj.filepath
//             };
//             wpservice.upload(opt, function (data, aobj) {
//                 if (data == null || data.status < 0) {
//                     fs.appendFileSync(teamlogfile, '创建' + aobj.filepath + '错误\n', 'utf-8');
//                 } else {
//                     fs.appendFileSync(teamlogfile, '创建' + aobj.filepath + '成功\n', 'utf-8');
//                     states = fs.statSync(aobj.filepath);
//                     var obj = new Object();
//                     obj.type = 2;
//                     obj.name = aobj.filename;
//                     obj.mtime = states.mtime.getTime();
//                     obj.smtime = data.time;
//                     obj.sid = data.id;
//                     teamdata[aobj.filepath] = obj;
//                     teamlist.shift();
//                     eventsEmitter.emit('upteamcheckfinish', alldata, teamlist);
//                 }
//             }, obj);
//         } else if (obj.type == 3) {
//             opt = {
//                 'host': cliConf.url,
//                 'port': cliConf.port,
//                 'user': cliConf.un,
//                 'passwd': cliConf.pw,
//                 'parentid': obj.parentid,
//                 'file': obj.filepath
//             };
//             wpservice.uploadhistory(opt, function (data, aobj) {
//                 if (data == null || data.status < 0) {
//                     fs.appendFileSync(teamlogfile, '创建' + aobj.filepath + '错误\n', 'utf-8');
//                 } else {
//                     fs.appendFileSync(teamlogfile, '创建' + aobj.filepath + '成功\n', 'utf-8');
//                     states = fs.statSync(aobj.filepath);
//                     var obj = new Object();
//                     obj.type = 2;
//                     obj.name = aobj.filename;
//                     obj.mtime = states.mtime.getTime();
//                     obj.smtime = data.time;
//                     obj.sid = data.id;
//                     teamdata[aobj.filepath] = obj;
//                     teamlist.shift();
//                     eventsEmitter.emit('upteamcheckfinish', alldata, teamlist);
//                 }
//             }, obj);
//         }
//     }
// }

// function upteamcheckfinish(alldata, teamlist) {
//     if (teamlist.length == 0) {
//         eventsEmitter.emit('upteamfinish', alldata);
//     } else {
//         eventsEmitter.emit('upteamaction', alldata, teamlist);
//     }
// }

// function upteamfinish(alldata) {
//     fs.appendFileSync(teamlogfile, '本地到服务器同步完成\n', 'utf-8');
//     fs.writeFileSync(homedir + '/.setting/teamdata.json', JSON.stringify(teamdata));
//     downteamlist = new Array();
//     if (cliConf.teamstrategy == 1 || cliConf.teamstrategy == 3) {
//         teambuildlistdown(alldata, downteamlist);
//         eventsEmitter.emit('downteamaction', alldata, downteamlist);
//     }
// }

// function teambuildlistdown(alldata, downteamlist) {
//     alldata.list.forEach(function (element) {
//         var filepath = teamsyncpath + '/' + element.path + element.docname;
//         if (!fs.existsSync(filepath)) {
//             var aobj = new Object();
//             aobj.type = 1;
//             aobj.filename = element.docname;
//             aobj.sid = element.id;
//             aobj.filepath = filepath;
//             aobj.smtime = element.time;
//             downteamlist.push(aobj);
//         } else {
//             var obj = mydata[filepath];
//             if (obj == null) {
//                 var aobj = new Object();
//                 aobj.type = 1;
//                 aobj.filename = element.docname;
//                 aobj.sid = element.id;
//                 aobj.filepath = filepath;
//                 aobj.smtime = element.time;
//                 downteamlist.push(aobj);
//             } else {
//                 if (obj.smtime != element.time) {
//                     var aobj = new Object();
//                     aobj.type = 1;
//                     aobj.filename = element.docname;
//                     aobj.sid = element.id;
//                     aobj.filepath = filepath;
//                     aobj.smtime = element.time;
//                     downteamlist.push(aobj);
//                 }
//             }
//         }
//     }, this);
//     //fs.writeFileSync(homedir + '/.setting/teamdata.json', JSON.stringify(teamdata));
// }

// function teambuildlistup(alldata, pathstr, parentid, teamlist) {
//     var datamap = alldata.map;
//     var files = fs.readdirSync(pathstr);
//     files.forEach(function (file, index) {
//         var filepath = pathstr + '/' + file;
//         var states = fs.statSync(filepath);
//         var obj = teamdata[filepath];
//         if (parentid == -999) {
//             if (obj != null) {
//                 if (obj.sid == -999) {
//                     var teams = fs.readdirSync(filepath);
//                     teams.forEach(function (tramsfile, teamsindex) {
//                         var teampath = filepath + '/' + tramsfile;
//                         var teamobj = teamdata[teampath];
//                         teambuildlistup(alldata, teampath, teamobj.sid, teamlist);
//                     });
//                 }
//             }
//         } else {
//             if (obj == null) {
//                 if (states.isDirectory()) {
//                     var aobj = new Object();
//                     aobj.type = 1;
//                     aobj.filename = file;
//                     aobj.pathstr = pathstr;
//                     aobj.parentid = parentid;
//                     aobj.filepath = filepath;
//                     teamlist.push(aobj);
//                 } else {
//                     var aobj = new Object();
//                     aobj.type = 2;
//                     aobj.filename = file;
//                     aobj.pathstr = pathstr;
//                     aobj.parentid = parentid;
//                     aobj.filepath = filepath;
//                     teamlist.push(aobj);
//                 }
//                 obj = {};
//                 obj.sid = -9999;
//             } else {
//                 if (!states.isDirectory()) {
//                     if (obj.mtime != states.mtime.getTime()) {
//                         var stime = datamap[obj.sid].time;
//                         if (states.mtime.getTime() > stime) {
//                             var aobj = new Object();
//                             aobj.type = 2;
//                             aobj.filename = file;
//                             aobj.pathstr = pathstr;
//                             aobj.parentid = parentid;
//                             aobj.filepath = filepath;
//                             teamlist.push(aobj);
//                         } else {
//                             var aobj = new Object();
//                             aobj.type = 3;
//                             aobj.filename = file;
//                             aobj.pathstr = pathstr;
//                             aobj.parentid = parentid;
//                             aobj.filepath = filepath;
//                             teamlist.push(aobj);
//                         }

//                     }
//                 }
//             }
//             if (states.isDirectory()) {
//                 teambuildlistup(alldata, filepath, obj.sid, teamlist);
//             }
//         }
//     });
// }

function syncmy(dirpath, conf) {
    cliConf = conf;
    cliConf = conf;
    mydirpath = dirpath;
    mydata = {};
    delmylist = new Array();
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
    mylogfile = homedir + '/.setting/log/' + yyyy + '/' + datestr + '.log';

    mydata = require(homedir + '/.setting/mydata.json');
    mysyncpath = homedir + '/MyFiles';
    if (dirpath != null && dirpath.length > 0) {
        mysyncpath = dirpath;
    }
    opt = {
        'host': cliConf.url,
        'port': cliConf.port,
        'user': cliConf.un,
        'passwd': cliConf.pw,
        'type': 'personal'
    };
    wpservice.getroot(opt, function (data) {
        if (data == null || data.status < 0) {
            fs.appendFileSync(mylogfile, new Date() + ' 同步:我的盘库失败！\n', 'utf-8');
            if (data.status == -8) {
                ipcMain.emit("connecterr");
                ipcMain.emit("setsyncfinished", true);
                return;
            }
        }
        else {
            if (!fs.existsSync(homedir + '/MyFiles' + '/' + data.protectname)) {
                fs.mkdirSync(homedir + '/MyFiles' + '/' + data.protectname);
                var obj = new Object();
                obj.type = 1;
                obj.name = data.protectname;
                obj.strmd5 = '';
                obj.smtime = 0;
                obj.sid = data.protectid;
                mydata[homedir + '/MyFiles' + '/' + data.protectname] = obj;
            }
            if (!fs.existsSync(homedir + '/MyFiles' + '/' + data.publicname)) {
                fs.mkdirSync(homedir + '/MyFiles' + '/' + data.publicname);
                var obj = new Object();
                obj.type = 1;
                obj.name = data.publicname;
                obj.strmd5 = '';
                obj.smtime = 0;
                obj.sid = data.publicid;
                mydata[homedir + '/MyFiles' + '/' + data.publicname] = obj;
            }
            fs.writeFileSync(homedir + '/.setting/mydata.json', JSON.stringify(mydata));

            if (fs.existsSync(mysyncpath)) {
                fs.appendFileSync(mylogfile, new Date() + ' 启动同步:' + mysyncpath + '\n', 'utf-8');
                opt = {
                    'host': cliConf.url,
                    'port': cliConf.port,
                    'user': cliConf.un,
                    'passwd': cliConf.pw,
                    'type': 'personal'
                };
                wpservice.getall2(opt, function (data) {
                    //console.log(data);
                    if (data == null || data.status < 0) {
                        fs.appendFileSync(mylogfile, new Date() + ' 获取:我的盘库列表错误\n', 'utf-8');
                        fs.appendFileSync(mylogfile, new Date() + ' 同步失败！\n', 'utf-8');
                        if (data.status == -8) {
                            ipcMain.emit("connecterr");
                            ipcMain.emit("setsyncfinished", true);
                            return;
                        }
                    }
                    else {
                        var datalist = data.list;
                        var datamap = data.map;
                        fs.appendFileSync(mylogfile, new Date() + ' 获取:我的盘库列表成功\n', 'utf-8');

                        datalist.forEach(function (element) {
                            var filepath = homedir + '/MyFiles' + '/' + element.path + element.docname;
                            if (filepath.indexOf(mysyncpath) > -1) {
                                if (fs.existsSync(filepath)) {
                                    var dobj = mydata[filepath];
                                    if (dobj == null) {
                                        var obj = new Object();
                                        obj.type = 2;
                                        obj.name = element.docname;
                                        obj.strmd5 = element.md5;
                                        obj.smtime = element.time;
                                        obj.sid = element.id;
                                        mydata[filepath] = obj;
                                    } else {
                                        dobj.name = element.docname;
                                        dobj.smtime = element.time;
                                        dobj.sid = element.id;
                                        mydata[filepath] = dobj;
                                    }

                                }
                            }
                        }, this);
                        fs.writeFileSync(homedir + '/.setting/mydata.json', JSON.stringify(mydata));

                        if (cliConf.mystrategy == 1 || cliConf.mystrategy == 2) {
                            for (var key in mydata) {
                                if (key.indexOf(mysyncpath) > -1) {
                                    if (!fs.existsSync(key)) {
                                        var obj = mydata[key];
                                        var aobj = new Object();
                                        aobj.type = -1;
                                        aobj.filepath = key;
                                        aobj.sid = obj.sid;
                                        delmylist.push(aobj);
                                        delete mydata[key];
                                    }
                                }
                            }
                        }
                        if (cliConf.mystrategy == 1 || cliConf.mystrategy == 3) {
                            for (var key in mydata) {
                                if (key.indexOf(mysyncpath) > -1) {
                                    //var obj = mydata[key];
                                    var filekey = key.replace(homedir + '/MyFiles' + '/', "");
                                    if (!(filekey in datamap)) {
                                        if (fs.existsSync(key)) {
                                            if (fs.statSync(key).isDirectory()) { // recurse
                                                deleteFolderRecursive(key);
                                            } else { // delete file
                                                fs.unlinkSync(key);
                                            }
                                        }
                                        delete mydata[key];
                                    }
                                }
                            }
                        }
                        eventsEmitter.emit('delmyaction', delmylist);
                    }
                });
            }
        }
    });
}

function delmyaction(delmylist) {
    if (delmylist.length == 0) {
        eventsEmitter.emit('delmyfinish');
    } else {
        var obj = delmylist[0];
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
                    fs.appendFileSync(mylogfile, new Date() + ' 删除:' + key + '失败!\n', 'utf-8');
                    if (data.status == -8) {
                        ipcMain.emit("connecterr");
                        ipcMain.emit("setsyncfinished", true);
                        return;
                    }
                } else {
                    fs.appendFileSync(mylogfile, new Date() + ' 删除:' + key + '成功!\n', 'utf-8');
                }
                delmylist.shift();
                eventsEmitter.emit('delmycheckfinish', delmylist);
            }, obj.filepath);
        }
    }
}

function delmycheckfinish(delmylist) {
    if (delmylist.length == 0) {
        eventsEmitter.emit('delmyfinish');
    } else {
        eventsEmitter.emit('delmyaction', delmylist);
    }
}

function delmyfinish() {
    fs.writeFileSync(homedir + '/.setting/mydata.json', JSON.stringify(mydata));
    opt = {
        'host': cliConf.url,
        'port': cliConf.port,
        'user': cliConf.un,
        'passwd': cliConf.pw,
        'type': 'personal'
    };
    wpservice.getall2(opt, function (data) {
        if (data == null || data.status < 0) {
            fs.appendFileSync(mylogfile, new Date() + ' 获取:我的盘库列表错误\n', 'utf-8');
            fs.appendFileSync(mylogfile, new Date() + ' 同步失败！\n', 'utf-8');
            if (data.status == -8) {
                ipcMain.emit("connecterr");
                ipcMain.emit("setsyncfinished", true);
                return;
            }
        }
        else {
            var parentid = -999;
            var obj = mydata[mysyncpath];
            if (obj != null) {
                parentid = obj.sid;
            }
            mylist = new Array();
            downmylist = new Array();
            if (cliConf.mystrategy == 1 || cliConf.mystrategy == 2) {
                mybuildlistup(data, mysyncpath, parentid, mylist);
                eventsEmitter.emit('upmyaction', data, mylist);
            } else if (cliConf.mystrategy == 1 || cliConf.mystrategy == 3) {
                mybuildlistdown(data, downmylist);
                eventsEmitter.emit('downmyaction', data, downmylist);
            }
        }
    });
}

function downmyaction(alldata, downmylist) {
    if (downmylist.length == 0) {
        eventsEmitter.emit('downmycheckfinish', alldata, downmylist);
    } else {
        var obj = downmylist[0];
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
                    fs.appendFileSync(mylogfile, new Date() + ' 同步:' + aobj.filename + '错误\n', 'utf-8');
                    if (data.status == -8) {
                        ipcMain.emit("connecterr");
                        ipcMain.emit("setsyncfinished", true);
                        return;
                    }
                } else {
                    fs.appendFileSync(mylogfile, new Date() + ' 同步:' + aobj.filename + '成功\n', 'utf-8');
                    var obj = new Object();
                    obj.type = 2;
                    obj.name = aobj.filename;
                    obj.strmd5 = getfilemd5(aobj.filepath);
                    obj.smtime = aobj.smtime;
                    obj.sid = aobj.sid;
                    mydata[aobj.filepath] = obj;
                }
                downmylist.shift();
                eventsEmitter.emit('downmycheckfinish', alldata, downmylist);
            }, obj);
        }
    }
}

function downmycheckfinish(alldata, downmylist) {
    if (downmylist.length == 0) {
        eventsEmitter.emit('downmyfinish', alldata);
    } else {
        eventsEmitter.emit('downmyaction', alldata, downmylist);
    }
}

function downmyfinish(alldata) {
    fs.appendFileSync(mylogfile, new Date() + ' 服务器到本地同步完成\n', 'utf-8');
    fs.writeFileSync(homedir + '/.setting/mydata.json', JSON.stringify(mydata));
    ipcMain.emit(finishEvent, true);
}

function upmyaction(alldata, mylist) {
    if (mylist.length == 0) {
        eventsEmitter.emit('upmycheckfinish', alldata, mylist);
    } else {
        var obj = mylist[0];
        if (obj.parentid == -9999) {
            var parent = mydata[obj.pathstr];
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
                    fs.appendFileSync(mylogfile, new Date() + ' 同步:' + aobj.filepath + '错误\n', 'utf-8');
                    if (data.status == -8) {
                        ipcMain.emit("connecterr");
                        ipcMain.emit("setsyncfinished", true);
                        return;
                    }
                } else {
                    fs.appendFileSync(mylogfile, new Date() + ' 同步:' + aobj.filepath + '成功\n', 'utf-8');
                    var obj = new Object();
                    obj.type = 1;
                    obj.name = aobj.filename;
                    obj.strmd5 = '';
                    obj.smtime = data.time;
                    obj.sid = data.id;
                    mydata[aobj.filepath] = obj;
                }
                mylist.shift();
                eventsEmitter.emit('upmycheckfinish', alldata, mylist);
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
                    fs.appendFileSync(mylogfile, new Date() + ' 同步:' + aobj.filepath + '错误\n', 'utf-8');
                    if (data.status == -8) {
                        ipcMain.emit("connecterr");
                        ipcMain.emit("setsyncfinished", true);
                        return;
                    }
                } else {
                    fs.appendFileSync(mylogfile, new Date() + ' 同步:' + aobj.filepath + '成功\n', 'utf-8');
                    var obj = new Object();
                    obj.type = 2;
                    obj.name = aobj.filename;
                    obj.strmd5 = getfilemd5(aobj.filepath);
                    obj.smtime = data.time;
                    obj.sid = data.id;
                    mydata[aobj.filepath] = obj;
                }
                mylist.shift();
                eventsEmitter.emit('upmycheckfinish', alldata, mylist);
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
                    fs.appendFileSync(mylogfile, new Date() + ' 同步:' + aobj.filepath + '错误\n', 'utf-8');
                    if (data.status == -8) {
                        ipcMain.emit("connecterr");
                        ipcMain.emit("setsyncfinished", true);
                        return;
                    }
                } else {
                    fs.appendFileSync(mylogfile, new Date() + ' 同步:' + aobj.filepath + '成功\n', 'utf-8');
                    var obj = new Object();
                    obj.type = 2;
                    obj.name = aobj.filename;
                    obj.strmd5 = getfilemd5(aobj.filepath);
                    obj.smtime = data.time;
                    obj.sid = data.id;
                    mydata[aobj.filepath] = obj;
                }
                mylist.shift();
                eventsEmitter.emit('upmycheckfinish', alldata, mylist);
            }, obj);
        }
    }
}

function upmycheckfinish(alldata, mylist) {
    if (mylist.length == 0) {
        eventsEmitter.emit('upmyfinish', alldata);
    } else {
        eventsEmitter.emit('upmyaction', alldata, mylist);
    }
}

function upmyfinish(alldata) {
    fs.appendFileSync(mylogfile, new Date() + ' 本地到服务器同步完成\n', 'utf-8');
    fs.writeFileSync(homedir + '/.setting/mydata.json', JSON.stringify(mydata));
    downmylist = new Array();
    if (cliConf.mystrategy == 1 || cliConf.mystrategy == 3) {
        mybuildlistdown(alldata, downmylist);
        eventsEmitter.emit('downmyaction', alldata, downmylist);
    } else {
        ipcMain.emit(finishEvent, true);
    }
}

function mybuildlistdown(alldata, downmylist) {
    alldata.list.forEach(function (element) {
        var filepath = homedir + '/MyFiles' + '/' + element.path + element.docname;
        if (filepath.indexOf(mysyncpath) > -1) {
            if (element.doctype == 1) {
                if (!fs.existsSync(filepath)) {
                    fs.mkdirSync(filepath);
                    var obj = new Object();
                    obj.type = 1;
                    obj.name = element.docname;
                    obj.strmd5 = '';
                    obj.smtime = element.time;
                    obj.sid = element.id;
                    mydata[filepath] = obj;
                    fs.appendFileSync(mylogfile, '同步' + filepath + '成功\n', 'utf-8');
                }
            } else {
                if (!fs.existsSync(filepath)) {
                    var aobj = new Object();
                    aobj.type = 1;
                    aobj.filename = element.docname;
                    aobj.sid = element.id;
                    aobj.filepath = filepath;
                    aobj.smtime = element.time;
                    downmylist.push(aobj);
                } else {
                    var obj = mydata[filepath];
                    if (obj == null) {
                        var aobj = new Object();
                        aobj.type = 1;
                        aobj.filename = element.docname;
                        aobj.sid = element.id;
                        aobj.filepath = filepath;
                        aobj.smtime = element.time;
                        downmylist.push(aobj);
                    } else {
                        var strmd5 = getfilemd5(filepath);
                        if (obj.strmd5 != strmd5) {
                            var aobj = new Object();
                            aobj.type = 1;
                            aobj.filename = element.docname;
                            aobj.sid = element.id;
                            aobj.filepath = filepath;
                            aobj.smtime = element.time;
                            downmylist.push(aobj);
                        }
                    }
                }
            }
        }
    }, this);
    //fs.writeFileSync(homedir + '/.setting/mydata.json', JSON.stringify(mydata));
}

function mybuildlistup(alldata, pathstr, parentid, mylist) {
    var datamap = alldata.map;
    var files = fs.readdirSync(pathstr);
    files.forEach(function (file, index) {
        var filepath = pathstr + '/' + file;
        var states = fs.statSync(filepath);
        var obj = mydata[filepath];
        if (parentid == -999) {
            if (obj != null) {
                mybuildlistup(alldata, filepath, obj.sid, mylist);
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
                    mylist.push(aobj);
                } else {
                    var aobj = new Object();
                    aobj.type = 2;
                    aobj.filename = file;
                    aobj.pathstr = pathstr;
                    aobj.parentid = parentid;
                    aobj.filepath = filepath;
                    mylist.push(aobj);
                }
                obj = {};
                obj.sid = -9999;
            } else {
                if (!states.isDirectory()) {
                    var strmd5 = getfilemd5(filepath);
                    if (obj.strmd5 != strmd5) {
                        var filekey = filepath.replace(homedir + '/MyFiles' + '/', "");
                        var stime = datamap[filekey].time;
                        if (states.mtime.getTime() > stime) {
                            var aobj = new Object();
                            aobj.type = 2;
                            aobj.filename = file;
                            aobj.pathstr = pathstr;
                            aobj.parentid = parentid;
                            aobj.filepath = filepath;
                            mylist.push(aobj);
                        } else {
                            var aobj = new Object();
                            aobj.type = 3;
                            aobj.filename = file;
                            aobj.pathstr = pathstr;
                            aobj.parentid = parentid;
                            aobj.filepath = filepath;
                            mylist.push(aobj);
                        }

                    }
                }
            }
            if (states.isDirectory()) {
                mybuildlistup(alldata, filepath, obj.sid, mylist);
            }
        }
    });
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
