/*global describe, it, expect, before, after, UI, delete*/
(function(){
	"use strict";
    describe("Test UI.Window", function () {
        it("should get the newly setted height/width when rendered", function () {
            var win = new UI.Window();
            document.body.appendChild(win.dom);
            win.setHeight("100px");
            win.setWidth("100px");
            expect(win.getHeight()).to.equal(100);
            expect(win.getWidth()).to.equal(100);
            document.body.removeChild(win.dom);
        });
        it("should get the newly setted height/width when not rendered", function () {
            var win = new UI.Window();
            win.setHeight("100px");
            win.setWidth("100px");
            expect(win.getHeight()).to.equal(100);
            expect(win.getWidth()).to.equal(100);
        });
    });	
})();
