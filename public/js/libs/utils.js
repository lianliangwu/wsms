var Utils = {};

Utils.Set = (function(){
    "use strict";
    function SetManager(){
        this.set = {};
        this.count = 0;
    }

    SetManager.prototype.add = function(item){
        var key = item.toString();
        if(!this.set[key]){
            this.set[key] = item;
            this.count++;
        }
        return this;
    };
    SetManager.prototype.has = function(item){
        var key = item.toString();
        return this.set[key] ? true : false;
    };
    SetManager.prototype.remove = function(item){
        var key = item.toString();
        if(this.set[key]){
            delete this.set[key];
            this.count--;
        }
        return this;
    };
    //return an array of all items
    SetManager.prototype.all = function(){
        var result = [];
        for(var key in this.set){
            if(this.set.hasOwnProperty(key)){
                result.push(this.set[key]);
            }
        }
        return result;
    };

    return SetManager;
})();

Utils.readCookie = function (k){
    "use strict";
    return(document.cookie.match('(^|; )'+k+'=([^;]*)')||0)[2];
};