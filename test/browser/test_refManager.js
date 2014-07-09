/*global describe, it, expect, before, after, editor*/
(function(){
	"use strict";
    var RefManager = editor.refManager;
    describe("Test RefManager", function () {
        it("should be idempotent for ref adding", function () {
            expect(RefManager.allRefs("123").length).to.equal(0);
            RefManager.addRef("123", "123");
            expect(RefManager.allRefs("123").length).to.equal(1);
            RefManager.addRef("123", "123");
            expect(RefManager.allRefs("123").length).to.equal(1);
            RefManager.addRef("123", "123");
            expect(RefManager.allRefs("123").length).to.equal(1);            
        });
        it("should has the newly added ref", function () {
            expect(RefManager.hasRef("123", "123")).to.equal(true);
        });
        it("should not has the removed ref", function () {
            RefManager.removeRef("123", "123");
            expect(RefManager.hasRef("123", "123")).to.equal(false);
        });
        it("should return all the refs", function () {
            RefManager.addRef("123", "123");
            RefManager.addRef("123", "234");
            RefManager.addRef("123", "345");
            expect(RefManager.allRefs("123").length).to.equal(3);
        });
    });	
})();
