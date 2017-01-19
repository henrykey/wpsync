const electron = require('electron')
const ipcMain = electron.ipcMain

function httppost(options, postData, callback, cbdata) {
    var http = require('http');
    var retdata;
    var retstatus = false;
    var req = http.request(options, function (res) {
        var rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
            try {
                if (rawData != "") {
                    //console.log(rawData);
                    //将返回内容进行base64解码
                    var b64 = new Buffer(rawData, "base64").toString();
                    retdata = JSON.parse(b64);
                    //console.log(retdata);                    
                }
            } catch (e) {
                console.log(e.message);
            }
            retstatus = true;
            callback(retdata, cbdata);
        });
    });
    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        //连接失败
        callback({status:'-8'}, cbdata);
    });
    req.write(postData + "&authtime=" + new Date().getTime());
    req.end();

}

function httpmultipart(options, fileKeyValue, callback, cbdata) {
    var http = require('http');
    var path = require('path');
    var fs = require('fs');
    var retdata;

    var req = http.request(options, function (res) {
        var rawData = '';
        res.on('data', (chunk) => rawData += chunk);

        res.on('end', () => {
            try {
                if (rawData != "") {
                    //将返回内容进行base64解码
                    var b64 = new Buffer(rawData, "base64").toString();
                    retdata = JSON.parse(b64);
                    //console.log(retdata);

                }

            } catch (e) {
                console.log(e.message);
            }
            callback(retdata, cbdata);
        });
    });
    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        //连接失败
        callback({status:'-8'}, cbdata);
    });
    var boundaryKey = Math.random().toString(16);
    var enddata = '\r\n----' + boundaryKey + '--';


    var files = new Array();
    for (var i = 0; i < fileKeyValue.length; i++) {
        if (fileKeyValue[i].type == "file") {
            var content = "\r\n----" + boundaryKey + "\r\n" + "Content-Type: application/octet-stream\r\n" + "Content-Disposition: form-data; name=\"" + fileKeyValue[i].name + "\"; filename=\"" + path.basename(fileKeyValue[i].value) + "\"\r\n" + "Content-Transfer-Encoding: binary\r\n\r\n";
            //console.log(content);
            var contentBinary = new Buffer(content, 'utf-8');//当编码为ascii时，中文会乱码。
            files.push({ contentBinary: contentBinary, filePath: fileKeyValue[i].value, type: 'file' });
        } else if (fileKeyValue[i].type == "param") {
            var content = "\r\n----" + boundaryKey + "\r\n" + "\r\n" + "Content-Disposition: form-data; name=\"" + fileKeyValue[i].name + "\" \r\n\r\n" + fileKeyValue[i].value + "\r\n";
            var contentBinary = new Buffer(content, 'utf-8');//当编码为ascii时，中文会乱码。
            //console.log(content);
            files.push({ contentBinary: contentBinary, filePath: fileKeyValue[i].value, type: 'param' });
        }
    }
    var contentLength = 0;
    for (var i = 0; i < files.length; i++) {
        if (files[i].type == 'file') {
            var stat = fs.statSync(files[i].filePath);
            contentLength += files[i].contentBinary.length;
            contentLength += stat.size;
        } else if (files[i].type == 'param') {
            contentLength += files[i].contentBinary.length;

        }
    }

    req.setHeader('Content-Type', 'multipart/form-data; boundary=--' + boundaryKey);
    //req.setHeader('Content-Length', contentLength + Buffer.byteLength(enddata));

    // 将参数发出
    var fileindex = 0;
    var doOneFile = function () {
        req.write(files[fileindex].contentBinary);
        if (files[fileindex].type == 'file') {
            var fileStream = fs.createReadStream(files[fileindex].filePath, { bufferSize: 4 * 1024 });
            fileStream.pipe(req, { end: false });
            fileStream.on('end', function () {
                fileindex++;
                if (fileindex == files.length) {
                    req.end(enddata);
                } else {
                    doOneFile();
                }
            });
        } else {
            fileindex++;
            if (fileindex == files.length) {
                req.end(enddata);
            } else {
                doOneFile();
            }
        }
    };
    if (fileindex == files.length) {
        req.end(enddata);
    } else {
        doOneFile();
    }
}

function httpmultipart2(options, fileKeyValue, callback, cbdata) {
    var http = require('http');
    var path = require('path');
    var fs = require('fs');
    var retdata;

    var req = http.request(options, function (res) {
        var rawData = '';
        res.on('data', (chunk) => rawData += chunk);

        res.on('end', () => {
            try {
                if (rawData != "") {
                    retdata = JSON.parse(rawData);
                    //console.log(retdata);

                }

            } catch (e) {
                console.log(e.message);
            }
            callback(retdata, cbdata);
        });
    });

    var boundaryKey = Math.random().toString(16);
    var enddata = '\r\n----' + boundaryKey + '--';


    var files = new Array();
    for (var i = 0; i < fileKeyValue.length; i++) {
        if (fileKeyValue[i].type == "file") {
            var content = "\r\n----" + boundaryKey + "\r\n" + "Content-Type: application/octet-stream\r\n" + "Content-Disposition: form-data; name=\"" + fileKeyValue[i].name + "\"; filename=\"" + path.basename(fileKeyValue[i].value) + "\"\r\n" + "Content-Transfer-Encoding: binary\r\n\r\n";
            console.log(content);
            var contentBinary = new Buffer(content, 'utf-8');//当编码为ascii时，中文会乱码。
            files.push({ contentBinary: contentBinary, filePath: fileKeyValue[i].value, type: 'file' });
        } else if (fileKeyValue[i].type == "param") {
            var content = "\r\n----" + boundaryKey + "\r\n" + "\r\n" + "Content-Disposition: form-data; name=\"" + fileKeyValue[i].name + "\" \r\n\r\n" + fileKeyValue[i].value + "\r\n";
            var contentBinary = new Buffer(content, 'utf-8');//当编码为ascii时，中文会乱码。
            console.log(content);
            files.push({ contentBinary: contentBinary, filePath: fileKeyValue[i].value, type: 'param' });
        }
    }
    var contentLength = 0;
    for (var i = 0; i < files.length; i++) {
        if (files[i].type == 'file') {
            var stat = fs.statSync(files[i].filePath);
            contentLength += files[i].contentBinary.length;
            contentLength += stat.size;
        } else if (files[i].type == 'param') {
            contentLength += files[i].contentBinary.length;

        }
    }

    req.setHeader('Content-Type', 'multipart/form-data; boundary=--' + boundaryKey);
    //req.setHeader('Content-Length', contentLength + Buffer.byteLength(enddata));

    // 将参数发出
    var fileindex = 0;
    var doOneFile = function () {
        req.write(files[fileindex].contentBinary);
        if (files[fileindex].type == 'file') {
            var fileStream = fs.createReadStream(files[fileindex].filePath, { bufferSize: 4 * 1024 });
            fileStream.pipe(req, { end: false });
            fileStream.on('end', function () {
                fileindex++;
                if (fileindex == files.length) {
                    req.end(enddata);
                } else {
                    doOneFile();
                }
            });
        } else {
            fileindex++;
            if (fileindex == files.length) {
                req.end(enddata);
            } else {
                doOneFile();
            }
        }
    };
    if (fileindex == files.length) {
        req.end(enddata);
    } else {
        doOneFile();
    }
}

function httpdownload(options, postData, filepath, callback, cbdata) {
    var http = require('http');
    var fs = require('fs');
    var retdata;
    //console.log(filepath);
    var file = fs.createWriteStream(filepath);
    var req = http.request(options, function (res) {
        var count = 0;
        var error = false;
        res.on('data', function (data) {
            if (data.toString() == "-3" || data.toString() == "-5") {
                error = true;
                retdata = data.toString();
            } else {
                count += data.length;
            }
            if (!error) {
                try {
                    file.write(data);
                } catch (e) {
                    retdata = "-7";
                    error = true;
                    file.end();
                }
            }
        });
        res.on('end', () => {
            file.end();
            if (error) {
                if (!exist) {
                    //console.log("del:"+filepath);
                    fs.unlinkSync(filepath);
                }
            }

            callback(retdata, cbdata);
        });
    });
    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        //连接失败
        callback({status:'-8'}, cbdata);
    });
    req.write(postData + "&authtime=" + new Date().getTime());
    req.end();

}


exports.login = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/login",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var postData = querystring.stringify({
        "user": opt.user,
        "passwd": opt.passwd,
        "sysid": opt.sysid != null ? opt.sysid : ""
    });
    //console.log(postData);
    httppost(options, postData, callback, cbdata);

};

exports.getroot = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/getroot",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var postData = querystring.stringify({
        "user": opt.user,
        "passwd": opt.passwd,
        "sysid": opt.sysid != null ? opt.sysid : "",
        "type": opt.type
    });

    httppost(options, postData, callback, cbdata);
};

exports.getlist = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/getlist",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var postData = querystring.stringify({
        "user": opt.user,
        "passwd": opt.passwd,
        "sysid": opt.sysid != null ? opt.sysid : "",
        "parentid": opt.parentid
    });

    httppost(options, postData, callback, cbdata);
};

exports.addfolder = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/addfolder",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var postData = querystring.stringify({
        "user": opt.user,
        "passwd": opt.passwd,
        "sysid": opt.sysid != null ? opt.sysid : "",
        "docname": opt.docname,
        "parentid": opt.parentid
    });

    httppost(options, postData, callback, cbdata);
};

exports.deldoc = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/deldoc",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var postData = querystring.stringify({
        "user": opt.user,
        "passwd": opt.passwd,
        "sysid": opt.sysid != null ? opt.sysid : "",
        "ids": opt.ids
    });

    httppost(options, postData, callback, cbdata);
};

exports.upload = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var params = querystring.stringify({
        'user': opt.user,
        'passwd': opt.passwd,
        'parentid': opt.parentid,
        'type': opt.type,
        'dup': opt.dup
    });
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/upload?" + params + "&authtime=" + new Date().getTime()
    };

    var postData = [{ type: "param", name: "user", value: opt.user },
    { type: "param", name: "passwd", value: opt.passwd },
    { type: "param", name: "sysid", value: opt.sysid != null ? opt.sysid : "" },
    { type: "param", name: "user", value: opt.user },
    { type: "param", name: "parentid", value: opt.parentid },
    { type: "param", name: "type", value: opt.type != null ? opt.type : "" },
    { type: "param", name: "dup", value: opt.dup != null ? opt.dup : "" },
    { type: "file", name: "file", value: opt.file }
    ];

    httpmultipart(options, postData, callback, cbdata);
};

exports.download = function (opt, callback, cbdata) {
    var querystring = require('querystring');

    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/download",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var postData = querystring.stringify({
        "user": opt.user,
        "passwd": opt.passwd,
        "sysid": opt.sysid != null ? opt.sysid : "",
        "id": opt.id
    });

    httpdownload(options, postData, opt.filepath, callback, cbdata);
};

exports.uploadhistory = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var params = querystring.stringify({
        'user': opt.user,
        'passwd': opt.passwd,
        'parentid': opt.parentid,
        'type': opt.type,
        'dup': opt.dup
    });
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/uploadhistory?" + params + "&authtime=" + new Date().getTime()
    };

    var postData = [{ type: "param", name: "user", value: opt.user },
    { type: "param", name: "passwd", value: opt.passwd },
    { type: "param", name: "sysid", value: opt.sysid != null ? opt.sysid : "" },
    { type: "param", name: "user", value: opt.user },
    { type: "param", name: "parentid", value: opt.parentid },
    { type: "param", name: "type", value: opt.type != null ? opt.type : "" },
    { type: "param", name: "dup", value: opt.dup != null ? opt.dup : "" },
    { type: "file", name: "file", value: opt.file }
    ];

    httpmultipart(options, postData, callback, cbdata);
};

exports.getfile = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/getfile",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var postData = querystring.stringify({
        "user": opt.user,
        "passwd": opt.passwd,
        "sysid": opt.sysid != null ? opt.sysid : "",
        "id": opt.id
    });

    return httppost(options, postData, callback, cbdata);
};

exports.getall = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/getall",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var postData = querystring.stringify({
        "user": opt.user,
        "passwd": opt.passwd,
        "sysid": opt.sysid != null ? opt.sysid : "",
        "parentid": opt.parentid
    });

    httppost(options, postData, callback, cbdata);
};

exports.getall2 = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/getall2",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var postData = querystring.stringify({
        "user": opt.user,
        "passwd": opt.passwd,
        "sysid": opt.sysid != null ? opt.sysid : "",
        "type": opt.type
    });

    httppost(options, postData, callback, cbdata);
};



exports.upload2 = function (opt, callback, cbdata) {
    var querystring = require('querystring');
    var params = querystring.stringify({
        'user': opt.user,
        'passwd': opt.passwd,
        'parentid': opt.parentid,
        'type': opt.type,
        'dup': opt.dup
    });
    var options = {
        hostname: opt.host,
        port: opt.port,
        method: "post",
        path: "/wp/sync/upload"
    };

    var postData = [{ type: "param", name: "user", value: opt.user },
    { type: "param", name: "passwd", value: opt.passwd },
    { type: "param", name: "sysid", value: opt.sysid != null ? opt.sysid : "" },
    { type: "param", name: "user", value: opt.user },
    { type: "param", name: "parentid", value: opt.parentid },
    { type: "param", name: "type", value: opt.type != null ? opt.type : "" },
    { type: "param", name: "dup", value: opt.dup != null ? opt.dup : "" }
    ];

    httpmultipart2(options, postData, callback, cbdata);
};


