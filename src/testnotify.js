var fileAlert = require('./components/jpwnotify');
fileAlert.addFolder("/Users/kehongwei/myScripts");
fileAlert.addFolder("/Users/kehongwei/output");
fileAlert.addFolder("/Users/kehongwei/output/test");
fileAlert.start(function(file,event,path){
    console.log(file + " in " + path + " " + event);
})
