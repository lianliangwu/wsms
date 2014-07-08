/*global _, describe, it, expect, before, after, delete, Operation, OperationHistory, ExecuteOperation, editor*/
(function(){
    "use strict";

    describe("Test Egine.OperationHistory", function () {
        var addedObjects = [];
        function addOperation(){
            var op = new Operation(Operation.CREATE, {
                'primary': 'Box',
                'parent': editor.scene.uuid
            });
            ExecuteOperation.execute(op);        
            OperationHistory.add(op);

            addedObjects.push(op.uuid);
        }        

        after(function(){
            OperationHistory.__resetOperations();
            _.forEach(addedObjects, function(uuid){
                var object = editor.getObjectByUuid(uuid);
                if(object){
                    editor.removeObject(object);
                }
            });
        });

        it("should add the new operations", function () {
            //add three operations
            addOperation();
            expect(OperationHistory.__getCount()).to.equal(1);

            addOperation();
            expect(OperationHistory.__getCount()).to.equal(2);            
            
            addOperation();
            expect(OperationHistory.__getCount()).to.equal(3);            
        });
        it("should undo one operation", function () {
            OperationHistory.undo();
            expect(OperationHistory.__getCount()).to.equal(2); 
            OperationHistory.undo();
            expect(OperationHistory.__getCount()).to.equal(1);  
            OperationHistory.undo();
            expect(OperationHistory.__getCount()).to.equal(0);       
        });
        it("should fail for undo if there's no operation", function(){
            var op = OperationHistory.undo();
            expect(op).to.equal(null);
            expect(OperationHistory.__getCount()).to.equal(0);
        });        
        it("should return undefined when there is no operation", function(){
            expect(OperationHistory.getCurrent()).to.equal(undefined);
        });
        it("should redo one operation", function () {
            OperationHistory.redo();
            expect(OperationHistory.__getCount()).to.equal(1);
            OperationHistory.redo();
            expect(OperationHistory.__getCount()).to.equal(2);  
            OperationHistory.redo();
            expect(OperationHistory.__getCount()).to.equal(3);
        });
        it("should fail for redo if there's no operation undone", function(){
            var op = OperationHistory.redo();
            expect(op).to.equal(null);
            expect(OperationHistory.__getCount()).to.equal(3);
        });  
        it("should clear the undone operations if new operation is added", function () {
            OperationHistory.undo();
            expect(OperationHistory.__getCount()).to.equal(2);
            OperationHistory.undo();
            expect(OperationHistory.__getCount()).to.equal(1);

            addOperation();
            expect(OperationHistory.__getCount()).to.equal(2);               
        });
    }); 
})();
