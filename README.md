wsms
====
Dependencies:
npm: latest version
node js: version >= 0.80
mongodb: *


Pre work:
step1:
    git clone the repository to your local machine under $PROJECT_HOME.
step2:
    cd your $PROJECT_HOME, run npm install, then it will automatically download all the dependecy node modules
step3:
    You can install some optinal tools - debug tool:node inspector, ide tool:sublime text, mongodb management tool: robomongo
    

Run:
step1:
    start mongodb
step2: 
    cd $PROJECT_HOME, run npm app.js
step3:
    login the system, and it will generate the database-"wsms" automatically,
    


Pay attention:
1: maybe need "npm install async". but i am not sure 
2: at 1st time, need to insert the default tree root node to the mongoDB treeNode table: show as follows
{ "id" : "1", "pId" : "0", "name" : "3D模型根节点", "open" : true}
    
    
