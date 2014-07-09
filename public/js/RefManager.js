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
        var geometry = object.geometry;
        var material = object.material;

        addRef(geometry.uuid, object.uuid);
        addRef(material.uuid, object.uuid);
    });

    editor.signals.objectRemoved.add(function(object){
        var geometry = object.geometry;
        var material = object.material;

        removeRef(geometry.uuid, object.uuid);
        removeRef(material.uuid, object.uuid);
    });

    editor.signals.objectChanged.add(function(object){
        var geometry = object.geometry;
        var material = object.material;
        var keys = allKeys();
        //remove old ref
        _.forEach(keys, function(key){
            if(refMap[key].has(object.uuid)){
                refMap[key].remove(object.uuid);
            }
        });
        //add new ref
        addRef(geometry.uuid, object.uuid);
        addRef(material.uuid, object.uuid);
    });    

    return {
        addRef: addRef,
        removeRef: removeRef,
        hasRef: hasRef,
        allRefs: allRefs,
        allKeys: allKeys
    };
};
