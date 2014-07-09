/*global _, editor, Utils*/
/* Manage the references(from object) on every geometry and material
 *
 */
var RefManager = function(editor){
    "use strict";
    var refMap = {};
    var Set = Utils.Set;

    function addRef(uuid, ref){
        if(!refMap[uuid]){
            refMap[uuid] = new Set();
        }
        refMap[uuid].add(ref);
    }
    function removeRef(uuid, ref){
        if(refMap[uuid]){
            refMap[uuid].remove(ref);
        }
    }
    function hasRef(uuid, ref){
        if(refMap[uuid]){
            return refMap[uuid].has(ref);
        }else{
            return false;
        }
    }
    function allRefs(uuid){
        if(refMap[uuid]){
            return refMap[uuid].all();
        }else{
            return [];
        }
    }
    function allKeys(){
        var result = [];
        for(var key in refMap){
            if(refMap.hasOwnProperty(key)){
                result.push(key);
            }
        }
        return result;        
    }

    editor.signals.objectAdded.add(function(object){
        if(object.geometry){
            addRef(object.geometry.uuid, object.uuid);
        }
        if(object.material){
            addRef(object.material.uuid, object.uuid);
        }
    });

    editor.signals.objectRemoved.add(function(object){
        if(object.geometry){
            removeRef(object.geometry.uuid, object.uuid);
        }
        if(object.material){
            removeRef(object.material.uuid, object.uuid);
        }
    });

    editor.signals.objectChanged.add(function(object){
        if(object.geometry||object.material){
            var keys = allKeys();
            //remove old ref
            _.forEach(keys, function(key){
                if(hasRef(key, object.uuid)){
                    removeRef(key, object.uuid);
                }
            });

            //add new ref
            if(object.geometry){
                addRef(object.geometry.uuid, object.uuid);
            }
            if(object.material){
                addRef(object.material.uuid, object.uuid);
            }
        }
    });    

    return {
        addRef: addRef,
        removeRef: removeRef,
        hasRef: hasRef,
        allRefs: allRefs,
        allKeys: allKeys
    };
};
