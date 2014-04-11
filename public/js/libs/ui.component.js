//Window
//wzhscirpt 2014.4.11

UI.Window = function( name ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'div' );
	dom.className = 'Window';
	dom.style.paddingTop = "30px";
	dom.style.paddingBottom = "25px";
	dom.style.border = "1px solid gray";
	dom.style.backgroundColor = "#fff";

	var head = document.createElement('div');
	head.style.backgroundColor = "#eee";
	head.style.position = "absolute";
	head.style.top = '0px';
	head.style.width = '100%';
	head.style.height = '30px';

	var title = document.createElement('span');
	title.style.color = "#888";
	title.style.padding = "8px";
	title.style.display = "inline-block";
	title.innerText = name;

	head.appendChild(title);

	var footer = document.createElement('div');
	footer.style.backgroundColor = "#eee";
	footer.style.position = "absolute";
	footer.style.bottom = '0px';
	footer.style.width = '100%';
	footer.style.height = '25px';	

	var closeBtn = document.createElement('img');
	closeBtn.src = "img/close.png";
	closeBtn.style.position = "absolute";
	closeBtn.style.right = "-19px";
	closeBtn.style.top = "-19px";
	closeBtn.style.cursor = "pointer";
	closeBtn.addEventListener( 'click', function ( event ) {

		scope.hide();

	}, false );


	dom.appendChild(head);
	dom.appendChild(footer);
	dom.appendChild(closeBtn);
	this.dom = dom;

	return this;
};

UI.Window.prototype = Object.create( UI.Element.prototype );

UI.Window.prototype.add = function () {

	for ( var i = 0; i < arguments.length; i ++ ) {

		this.dom.appendChild( arguments[ i ].dom );

	}

	return this;

};

UI.Window.prototype.remove = function () {

	for ( var i = 0; i < arguments.length; i ++ ) {

		this.dom.removeChild( arguments[ i ].dom );

	}

	return this;

};

UI.Window.prototype.clear = function () {

	while ( this.dom.children.length ) {

		this.dom.removeChild( this.dom.lastChild );

	}

};

UI.Window.prototype.show = function() {
	this.dom.style.display = "";

	return this;
};

UI.Window.prototype.hide = function() {
	this.dom.style.display = "none";

	return this;
};