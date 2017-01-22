
var wpsync = require('./components/wpservice');
var host = "localhost";
var port = "80";
var user = "songjiang";
var passwd = new Buffer("songjiang").toString("base64");

var opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd
    
};

//test login
wpsync.login(opt,function(data,cbdata){
    console.log("cbdata:"+JSON.stringify(cbdata));
if(data==null||data.status<0)
    console.log("login fail");
else
    console.log("userinfo:"+data.username);
},{data:'cbdata'});

/*
//test getroot personal
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'type' : 'personal'
};
wpsync.getroot(opt,function(data){

    if(data==null||data.status<0)
        console.log("getroot fail");
    else
        console.log("getroot:"+data.protectid);
});

//test getroot team
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'type' : 'team'
};
wpsync.getroot(opt,function(data){
    if(data==null||data.status<0){       
        console.log("getroot fail");
    }
    else{
        data.teamlist.forEach(function(team) {
            console.log("getroot:"+team.teamname);    
        }, this);        
    }
        
});

//test getlist personal protectroot
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'num' : '0',
    'parentid' : '1419'
};
wpsync.getlist(opt,function(data){
    if(data==null||data.status<0){    
        
        console.log("getlist fail");
    }else{
        data.list.forEach(function(element) {
             console.log("getlist:"+element.docname);
        }, this);
       
    }
        
});

//test addfolder personal protectroot
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'docname' : 'syncfolder',
    'parentid' : '1419'
};
wpsync.addfolder(opt,function(data){
    if(data==null||data.status<0){  
        console.log("addfolder fail");
    }else{
        console.log("addfolder:"+data.id);
    }
        
});


//test deldoc personal protectroot
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'ids' : '1433'
};
wpsync.deldoc(opt,function(data){
    if(data==null||data.status<0){
        console.log("deldoc fail");
        
    }else{
        console.log("deldoc:"+data.status);
    }
        
});

//test download personal protectroot
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'id' : '1049',
    'filepath' : 'd:/法律用词1.txt'
};
wpsync.download(opt,function(data){
    
    if(data<0){
        console.log("download fail:"+data);
    }else{
        console.log("download success");
    }        
});

//test upload personal protectroot
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'parentid' : '1419',
    'file' : 'd:/法律用词.txt'
};
wpsync.upload(opt,function(data){
    if(data==null||data.status<0){

        console.log("upload fail");
    }else{
        console.log("upload:"+data.id);
    }
        
});

//test uploadhistory personal protectroot
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'parentid' : '1419',
    'file' : 'd:/法律用词.txt'
};
wpsync.uploadhistory(opt,function(data){
    if(data==null||data.status<0){
        console.log("uploadhistory fail");
    }else{
        console.log("uploadhistory:"+data.id);
    }
        
});



//test getfile personal protectroot
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'id' : '1459'
};
wpsync.getfile(opt,function(data){
    if(data==null||data.status<0){
        console.log("getfile fail");
    }else{
        console.log("getfile:"+data.docname);
    }
        
});




//test getallmap personal protectroot
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'parentid' : '1419'
};
wpsync.getallmap(opt,function(data){
    if(data==null||data.status<0){    
        
        console.log("getallmap fail");
    }else{
        console.log("getallmap:"+JSON.stringify(data.map));
       
    }
        
});


//test getall personal protectroot
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'parentid' : '1419'
};
wpsync.getall(opt,function(data){
    if(data==null||data.status<0){    
        
        console.log("getall fail");
    }else{
        data.list.forEach(function(element) {
             console.log("getall:"+element.path+element.docname);
        }, this);
         console.log("getall map:"+JSON.stringify(data.map));
    }
        
});

*/
//test getall2
opt = {
    'host' : host,
    'port' : port,
    'user' : user,
    'passwd' : passwd,
    'type' : 'personal'
};
wpsync.getall2(opt,function(data){
    if(data==null||data.status<0){    
        
        console.log("getall fail");
    }else{
        data.list.forEach(function(element) {
             console.log("getall:"+element.path+element.docname);
        }, this);
         console.log("getall map:"+JSON.stringify(data.map));
    }
        
});
