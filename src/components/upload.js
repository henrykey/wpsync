console.log("try uploading...");
	var request = require('request');
	var FormData = require('form-data');
	var fs = require('fs');


	//参数
	var _url = "http://www.joinkey.com.cn:280/";
	var _parentid = '1';
	var _update = '1';
	var _updateid = '100001';
	var _inwim = '0';
	var _dirname = "./";
	var fname = "index.js";
	var user = "testuser";
	var passwd = "testuser";

	//认证
	request.get(_url + 'login', {
		 'auth': {
		 'user': user,
		 'pass': passwd,
		 'sendImmediately': false
		}
		});	
	
	 //上传
/*	var options = {
			  url: _url + 'upload',
			  headers: {
			    'X-Requested-With': 'XMLHttpRequest'
			  }
			};

	function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			    var info = JSON.parse(body);
			    console.log(info.stargazers_count + " Stars");
			    console.log(info.forks_count + " Forks");
			}
		}
	request(options, callback);
	*/
    var fd = new FormData();
    fd.append('parentid', _parentid); //父目录id
    fd.append('update', _update); //更新模式：1|0
    fd.append('id', _updateid); //要更新的file的id
    fd.append('inwim', _inwim);//是否加入wim：true|false
    fd.append('file', fs.createReadStream(_dirname + fname));  //上传的文件
    
	request.post({
		url: 'http://www.joinkey.com.cn:280/upload', 
		//headers: {'X-Requested-With': 'XMLHttpRequest'},
		formData: fd
		}, function optionalCallback(err, httpResponse, body) {
		  if (err) {
		    return console.error('upload failed:', err);
		  }
		  console.log('Upload successful!  Server responded with:', body);
		});
/*    
  var xhr = new XMLHttpRequest();

    xhr.open("post", _receivefileurl, true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    var fd = new FormData();
    fd.append('parentid', _parentid); //父目录id
    fd.append('update', _update); //更新模式：1|0
    fd.append('id', _updateid); //要更新的file的id
    fd.append('inwim', _inwim);//是否加入wim：true|false
    fd.append('dup', $("#mod_upload2 input[name='dup']:checked").val());//重名文件的处理（重命名|更新版本）：rename|history
//    fd.append('file', transferFiles[count]);  //上传的文件
    fd.append('file', fname);  //上传的文件
    xhr.send(fd);
*/